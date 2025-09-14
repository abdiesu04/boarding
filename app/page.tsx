"use client";
import toast from "react-hot-toast";
import Link from "next/link";
import SimpleRegisterForm from "@/components/forms/SimpleRegisterForm";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LuxuryBackground from "@/components/ui/LuxuryBackground";
import FloatingElements from "@/components/ui/FloatingElements";
import DecorativeElements from "@/components/ui/DecorativeElements";
import { Mail, Lock, LogIn, AlertCircle, User } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedInput from "@/components/ui/EnhancedInput";
import EnhancedButton from "@/components/ui/EnhancedButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Function to log all cookies for debugging
  const logAllCookies = () => {
    console.log("==== CURRENT COOKIES ====");
    const cookiesArray = document.cookie.split(';').map(cookie => cookie.trim());
    if (cookiesArray.length === 0 || (cookiesArray.length === 1 && cookiesArray[0] === '')) {
      console.log("No cookies found");
    } else {
      cookiesArray.forEach(cookie => {
        const [name, value] = cookie.split('=');
        console.log(`Cookie: ${name} = ${value ? value.substring(0, 20) + (value.length > 20 ? '...' : '') : 'empty'}`);
      });
    }
    console.log("=======================");
  };

  // Function to check if a cookie exists
  const cookieExists = (name: string): boolean => {
    return document.cookie.split(';').some(c => {
      return c.trim().startsWith(name + '=');
    });
  };

  // Function to set a cookie with detailed logging
  const setSecureCookie = (name: string, value: string, maxAge: number = 604800) => {
    try {
      const cookieValue = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict`;
      console.log(`Setting cookie: ${name} (value length: ${value.length})`);
      console.log(`Cookie string: ${cookieValue.substring(0, name.length + 20)}...`);
      document.cookie = cookieValue;
      // Verify cookie was set
      setTimeout(() => {
        const wasSet = cookieExists(name);
        console.log(`Cookie ${name} set verification: ${wasSet ? 'SUCCESS' : 'FAILED'}`);
        if (!wasSet) {
          console.error(`Failed to set cookie ${name}. This might be due to browser settings or security restrictions.`);
        }
        logAllCookies();
      }, 100);
    } catch (e) {
      console.error(`Error setting cookie ${name}:`, e);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    console.log("Login submission started with email:", data.email);
    console.log("Current browser cookies before login:");
    logAllCookies();
    setIsLoading(true);
    try {
      console.log("Calling login API...");
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log("Login API response status:", response.status);
      const result = await response.json();
      console.log("Login API response body:", result);
      if (!response.ok) {
        console.error("Login API error:", result);
        throw new Error(result.error || 'Login failed');
      }
      console.log("Login successful:", result);
      console.log("Token received from API:", result.token ? `${result.token.substring(0, 20)}...` : 'missing');
      // Store the token and user info
      localStorage.setItem('token', result.token);
      console.log("Token stored in localStorage:", !!result.token);
      // Store token in cookie for middleware authentication
      setSecureCookie('token', result.token);
      // Double-check with direct setting as fallback
      document.cookie = `token=${result.token}; path=/; max-age=604800; SameSite=Strict`;
      console.log("Token also directly set in cookie");
      sessionStorage.setItem('userAuthenticated', 'true');
      sessionStorage.setItem('lastActivity', Date.now().toString());
      console.log("Session data stored:", {
        userAuthenticated: sessionStorage.getItem('userAuthenticated'),
        lastActivity: sessionStorage.getItem('lastActivity')
      });
      // Store user role for role-based access
      if (result.user && result.user.role) {
        sessionStorage.setItem('userRole', result.user.role);
        console.log("User role stored:", result.user.role);
      }
      // Debug info
      console.log('Login success, preparing to redirect with token:', {
        tokenExists: !!result.token,
        tokenInLocalStorage: !!localStorage.getItem('token'),
        tokenInCookie: cookieExists('token'),
        userAuthenticated: sessionStorage.getItem('userAuthenticated') === 'true',
        redirectingTo: '/dashboard'
      });
      // Show a message before redirecting
      toast.success("Login successful! Redirecting to dashboard...");
      // Add a small delay to ensure toast is shown and cookies are set
      console.log("Starting redirection process...");
      setTimeout(() => {
        console.log("Final cookie check before redirect:");
        logAllCookies();
        console.log("Executing redirect to dashboard now...");
        // IMPORTANT: Force a hard redirect to dashboard
        try {
          console.log("Redirect initiated with window.location.href to /dashboard");
          window.location.href = '/dashboard';
          // Fallback if the first redirect doesn't work
          setTimeout(() => {
            console.log("Fallback redirect with replace...");
            window.location.replace('/dashboard');
          }, 1000);
        } catch (e) {
          console.error("Redirect error:", e);
          alert("Redirect failed. Please click OK to try again.");
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'Please check your credentials'}`, {
        icon: <AlertCircle className="h-5 w-5" />
      });
      setIsLoading(false);
    }
  };

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('token');
    const isAuthenticated = sessionStorage.getItem('userAuthenticated');
    const lastActivity = sessionStorage.getItem('lastActivity');
    // If we have a token and authentication, redirect to dashboard
    if (token && isAuthenticated === 'true') {
      console.log('User already logged in, redirecting to dashboard');
      window.location.replace('/dashboard');
    }
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <LuxuryBackground variant="blue" intensity="subtle" />
      <FloatingElements variant="blue" density="medium" />
      <DecorativeElements variant="blue" position="all" />
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Login/Register Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg mx-auto p-6"
      >
        {showRegister ? (
          <SimpleRegisterForm />
        ) : (
          <GlassCard variant="blue">
            <form onSubmit={handleSubmit(onSubmit)} className="p-8">
              <div className="text-center mb-10">
                {/* Logo/Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <LogIn className="h-8 w-8 text-white" />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"
                >
                  Welcome Back
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 text-sm"
                >
                  Sign in to continue your financial journey
                </motion.p>
              </div>
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <EnhancedInput
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    icon={Mail}
                    variant="blue"
                    error={errors.email?.message}
                    isValid={!!dirtyFields.email && !errors.email}
                    {...register("email")}
                    autoFocus
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <EnhancedInput
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={Lock}
                    variant="blue"
                    error={errors.password?.message}
                    isValid={!!dirtyFields.password && !errors.password}
                    {...register("password")}
                  />
                  <div className="flex items-center justify-end mt-2">
                    <a 
                      href="#" 
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-8 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <EnhancedButton
                  type="submit"
                  variant="blue"
                  isLoading={isLoading}
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  iconLeft={<LogIn className="h-5 w-5" />}
                >
                  {isLoading ? "Signing you in..." : "Sign In"}
                </EnhancedButton>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">New to our platform?</span>
                  </div>
                </div>
                
                {/* Create Account Button - Bigger and Below Fields */}
                <motion.button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="w-full h-14 px-6 text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-lg border border-emerald-400/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <User className="h-5 w-5" />
                    Create New Client Account
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}