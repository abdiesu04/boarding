"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedInput from "@/components/ui/EnhancedInput";
import EnhancedButton from "@/components/ui/EnhancedButton";
import { User, Mail, Phone, Lock, LogIn, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(14, { message: "Phone number is required" }) // (XXX) XXX-XXXX is 14 chars
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, { message: "Phone number must be in format (XXX) XXX-XXXX" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Format phone as (XXX) XXX-XXXX
function formatPhone(value: string) {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

type RegisterFormData = z.infer<typeof registerSchema>;

export default function SimpleRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setError,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Watch password and confirmPassword for match validation
  const watchPassword = watch("password");
  const watchConfirmPassword = watch("confirmPassword");

  // Phone input formatting handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    e.target.value = formatted;
    setValue("phone", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    // Check if passwords match before proceeding
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match"
      });
      toast.error("Passwords do not match", {
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 4000
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Only send the fields the backend expects for this step
      const payload = {
        name: `${data.firstName} ${data.lastName}`, // Combine for backward compatibility
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password
      };
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        let errorMsg = "Registration failed";
        if (result.error) {
          if (typeof result.error === "string") {
            errorMsg = result.error;
          } else if (typeof result.error === "object") {
            errorMsg = "Some fields are missing or invalid. Please check your input.";
          }
        }
        toast.error(errorMsg, {
          icon: <AlertCircle className="h-5 w-5" />,
        });
        setIsSubmitting(false);
        return;
      }
      localStorage.setItem("token", result.token);
      sessionStorage.setItem("userAuthenticated", "true");
      sessionStorage.setItem("lastActivity", Date.now().toString());
      setIsSuccess(true);
      toast.success("Registration successful! Redirecting to dashboard...");
      setTimeout(() => {
        // Check session validity before redirecting
        const isAuthenticated = sessionStorage.getItem("userAuthenticated") === "true";
        const token = localStorage.getItem("token");
        if (isAuthenticated && token) {
          // Redirect to dashboard
          window.location.replace('/dashboard');
        } else {
          toast.error("Session invalid. Please log in again.", {
            icon: <AlertCircle className="h-5 w-5" />,
          });
        }
      }, 2000);
    } catch (error) {
      toast.error("Registration failed. Please try again.", {
        icon: <AlertCircle className="h-5 w-5" />,
      });
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <GlassCard variant="blue" className="max-w-md mx-auto">
        <div className="py-10 px-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Registration Complete!</h2>
          <p className="text-lg mb-2 text-slate-600">Thank you for registering.</p>
          <p className="text-base mb-6 text-slate-500">Redirecting to your dashboard...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="bg-white/70 p-4 rounded-lg mx-auto max-w-6xl w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="p-2 md:px-8">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            Create an Account
          </h2>
          <p className="text-gray-600 text-sm">
            Register to access your account
          </p>
        </div>
        <div className="space-y-4">
          {/* Name Fields - Side by side */}
          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <EnhancedInput
                  id="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                  icon={User}
                  error={errors.firstName?.message}
                  isValid={!!dirtyFields.firstName && !errors.firstName}
                  variant="blue"
                  {...register("firstName")}
                  autoFocus
                />
              </div>
              <div>
                <EnhancedInput
                  id="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                  icon={User}
                  error={errors.lastName?.message}
                  isValid={!!dirtyFields.lastName && !errors.lastName}
                  variant="blue"
                  {...register("lastName")}
                />
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <EnhancedInput
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  error={errors.email?.message}
                  isValid={!!dirtyFields.email && !errors.email}
                  variant="blue"
                  {...register("email")}
                />
              </div>
              <div>
                <EnhancedInput
                  id="phone"
                  label="Phone Number"
                  placeholder="(XXX) XXX-XXXX"
                  icon={Phone}
                  error={errors.phone?.message?.toString()}
                  isValid={!!dirtyFields.phone && !errors.phone}
                  variant="blue"
                  {...register("phone")}
                  onChange={handlePhoneChange}
                />
              </div>
            </div>
          </div>
          
          {/* Password Section */}
          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <EnhancedInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  error={errors.password?.message}
                  isValid={!!dirtyFields.password && !errors.password}
                  variant="blue"
                  {...register("password")}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <EnhancedInput
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  icon={Lock}
                  error={errors.confirmPassword?.message}
                  isValid={!!dirtyFields.confirmPassword && !errors.confirmPassword && watchConfirmPassword.length > 0}
                  variant="blue"
                  {...register("confirmPassword")}
                  autoComplete="new-password"
                />
              </div>
            </div>
            
            <div className="mt-3 flex items-center text-xs text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Password must be at least 6 characters
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg blur opacity-20"></div>
            <EnhancedButton
              type="submit"
              variant="blue"
              isLoading={isSubmitting}
              className="w-full relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-2.5"
              iconLeft={<LogIn className="h-4 w-4" />}
            >
              Register
            </EnhancedButton>
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center">
              <div className="h-px bg-gray-200 flex-grow mr-2"></div>
              <span className="text-gray-500 text-xs">Already have an account?</span>
              <div className="h-px bg-gray-200 flex-grow ml-2"></div>
            </div>
            <Link 
              href="/login" 
              className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors"
            >
              Log in to your account
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
