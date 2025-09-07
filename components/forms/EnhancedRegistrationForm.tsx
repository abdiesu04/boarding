"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { clientSchema } from "@/lib/schema";
import { formatSSN, formatPhone, formatCurrency } from "@/lib/formatters";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedButton from "@/components/ui/EnhancedButton";
import EnhancedInput from "@/components/ui/EnhancedInput";
import AnimatedTypography from "@/components/ui/AnimatedTypography";
import FloatingElements from "@/components/ui/FloatingElements";
import { Toggle } from "@/components/ui/toggle";
import { User, Mail, Phone, Home, DollarSign, CreditCard, Calendar, ArrowRight, ArrowLeft, CheckCircle, Lock, LogIn, AlertCircle, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type FormData = z.infer<typeof clientSchema>;

// Step definitions for the form
const STEPS = [
  {
    id: "personalName",
    title: "What's your name?",
    description: "Please provide your legal first and last name",
    fields: ["firstName", "lastName"],
  },
  {
    id: "personalSSN",
    title: "What's your SSN?",
    description: "Your information is encrypted and secure",
    fields: ["ssn"],
  },
  {
    id: "personalDOB",
    title: "When were you born?",
    description: "Please provide your date of birth",
    fields: ["dob"],
  },
  {
    id: "personalContact",
    title: "How can we contact you?",
    description: "Please provide your contact information",
    fields: ["phone", "email"],
  },
  {
    id: "securityPassword",
    title: "Create your password",
    description: "Make sure it's secure and easy to remember",
    fields: ["password", "confirmPassword"],
  },
  {
    id: "address",
    title: "What's your address?",
    description: "Please provide your current residential address",
    fields: ["address", "city", "state", "zip"],
  },
  {
    id: "financialMortgage",
    title: "Do you have a mortgage?",
    description: "This helps us determine your funding options",
    fields: ["hasMortgage"],
  },
  {
    id: "financialNeedAmount",
    title: "How much funding do you need?",
    description: "Enter the amount you're looking to secure",
    fields: ["loanAmount"],
  },
  {
    id: "financialIncome",
    title: "What's your monthly income?",
    description: "Please provide your pre-tax monthly income",
    fields: ["monthlyIncome"],
  },
];

export default function EnhancedRegistrationForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [mounted, setMounted] = useState(false);
  
  // Add keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't trigger on textarea shift+enter
      const target = e.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        
        // For password fields, check if passwords match before proceeding
        if (currentStepFields.includes('password') && currentStepFields.includes('confirmPassword')) {
          if (watchPassword !== watchConfirmPassword) {
            // Set error on confirmPassword field
            setError("confirmPassword", {
              type: "manual",
              message: "Passwords do not match"
            });
            
            // Show error toast for password mismatch
            toast.error("Passwords do not match", {
              icon: <AlertCircle className="h-5 w-5" />,
              duration: 4000
            });
            return;
          }
        }
        
        goToNextStep();
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, dirtyFields },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(clientSchema),
    mode: "onChange",
    defaultValues: {
      hasMortgage: false
    }
    
  });
  
  // Watch password fields for real-time validation
  const watchPassword = watch("password");
  const watchConfirmPassword = watch("confirmPassword");

  const watchHasMortgage = watch("hasMortgage");
  
  // Ensure step is within valid range to prevent TypeError
  const safeStep = Math.max(0, Math.min(step, STEPS.length - 1));
  const currentStepFields = STEPS[safeStep]?.fields || [];
  const isLastStep = safeStep === STEPS.length - 1;
  const progress = ((safeStep + 1) / STEPS.length) * 100;

  // Form submission handler
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Send data to API endpoint
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.log("Registration API error:", result);
        
        // Create a custom error component for toast
        const CustomToast = ({ title, message }: { title: string, message: string }) => (
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">{title}</h3>
              <p className="text-sm text-red-700">{message}</p>
            </div>
          </div>
        );
        
        if (typeof result.error === 'object') {
          // Handle structured Zod validation errors
          const validationErrors: Record<string, string[]> = {};
          let shouldNavigateToPasswordStep = false;
          
          // Extract validation errors from the response
          Object.entries(result.error).forEach(([key, value]) => {
            if (key !== '_errors' && value) {
              const errorObj = value as any;
              if (errorObj._errors && errorObj._errors.length > 0) {
                validationErrors[key] = errorObj._errors;
                
                // Show enhanced toast notification for each validation error
                errorObj._errors.forEach((errorMsg: string) => {
                  const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
                  toast.custom(
                    (t) => (
                      <div 
                        className={`${
                          t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                      >
                        <div className="flex-1 w-0 p-4">
                          <CustomToast 
                            title={`${fieldName} Error`} 
                            message={errorMsg}
                          />
                        </div>
                        <div className="flex border-l border-gray-200">
                          <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ),
                    { duration: 5000 }
                  );
                });
                
                // Set field error in the form
                if (key === 'confirmPassword' || key === 'password') {
                  shouldNavigateToPasswordStep = true;
                }
                
                // Set error on the field
                setError(key as any, {
                  type: 'manual',
                  message: errorObj._errors[0]
                });
              }
            }
          });
          
          // Navigate to password step if needed
          if (shouldNavigateToPasswordStep) {
            const passwordStepIndex = STEPS.findIndex(s => 
              s.fields.includes('password') && s.fields.includes('confirmPassword')
            );
            if (passwordStepIndex >= 0 && safeStep > passwordStepIndex) {
              setStep(passwordStepIndex);
            }
          }
          
          const formattedErrors = Object.entries(validationErrors)
            .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
            .join('; ');
          
          throw new Error(formattedErrors || 'Registration validation failed');
        } else {
          // Show enhanced toast for general errors
          toast.custom(
            (t) => (
              <div 
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
              >
                <div className="flex-1 w-0 p-4">
                  <CustomToast 
                    title="Registration Failed" 
                    message={result.error || 'Please check your information and try again.'}
                  />
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            ),
            { duration: 5000 }
          );
          
          throw new Error(result.error || 'Registration failed');
        }
      }
      
      // Store token in localStorage for authentication
      localStorage.setItem('token', result.token);
      
      console.log("Registration successful:", result);
    setIsSubmitting(false);
    setIsSuccess(true);
      
      // Set session data for maintaining login state
      sessionStorage.setItem('userAuthenticated', 'true');
      sessionStorage.setItem('lastActivity', Date.now().toString());
      sessionStorage.setItem('registrationCompleted', 'true');
      
      // Show success message
      toast.success('Registration successful! Redirecting to credit report...');
      
      // Redirect to credit report page after successful registration
      setTimeout(() => {
        window.location.replace('/credit-report');
      }, 2000);
      
    } catch (error) {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      
      // Check for specific error types
      const errorResponse = error instanceof Response ? await error.json() : null;
      const errorMessage = errorResponse?.error || (error instanceof Error ? error.message : 'Unknown error');
      
      // Handle specific error cases
      if (errorMessage.includes('email') && errorMessage.includes('already')) {
        toast.error('This email is already registered. Please use a different email address.', {
          icon: <AlertCircle className="h-5 w-5" />
        });
      } else if (errorMessage.includes('SSN') || errorMessage.includes('ssn')) {
        toast.error('This SSN is already registered. Please contact support if you need assistance.', {
          icon: <AlertCircle className="h-5 w-5" />
        });
      } else {
        // Generic error
        toast.error(`Registration failed: ${errorMessage}`, {
          icon: <AlertCircle className="h-5 w-5" />
        });
      }
    }
  };

    // Go to next step with validation
  const goToNextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = currentStepFields as Array<keyof FormData>;
    const isStepValid = await trigger(fieldsToValidate);
    
    // Special handling for password step
    if (fieldsToValidate.includes('password') && fieldsToValidate.includes('confirmPassword')) {
      // Check if passwords match
      if (watchPassword !== watchConfirmPassword) {
        // Set error on confirmPassword field
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords do not match"
        });
        
        // Show error toast for password mismatch
        toast.error("Passwords do not match", {
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 4000
        });
        
        // Prevent proceeding to next step
        return false;
      }
    }
    
    if (isStepValid) {
      // Double check password match for the password step
      if (fieldsToValidate.includes('password') && fieldsToValidate.includes('confirmPassword') && 
          watchPassword !== watchConfirmPassword) {
        toast.error("Please make sure your passwords match before continuing", {
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 4000
        });
        return false;
      }
      
    setDirection("forward");
    if (isLastStep) {
        console.log("Submitting form on final step");
        // Force form submission on the last step
        try {
          setIsSubmitting(true);
          const formData = watch();
          await onSubmit(formData);
        } catch (error) {
          console.error("Form submission error:", error);
          setIsSubmitting(false);
        }
    } else {
      setStep((prev) => prev + 1);
      }
    }
  };

  // Go to previous step
  const goToPrevStep = () => {
    if (step > 0) {
      setDirection("backward");
      setStep((prev) => prev - 1);
    }
  };

  // Input handlers for formatting
  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    e.target.value = formatted;
    setValue("ssn", formatted, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    e.target.value = formatted;
    setValue("phone", formatted, { shouldValidate: true });
  };

  const handleCurrencyChange = (field: "loanAmount" | "monthlyIncome") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    e.target.value = formatted;
    setValue(field, formatted, { shouldValidate: true });
  };

  // Animation variants
  const variants = {
    enter: (direction: string) => ({
      x: direction === "forward" ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === "forward" ? -50 : 50,
      opacity: 0,
    }),
  };

  // Render form field based on type
  const renderField = (field: keyof FormData) => {
    const isFieldDirty = dirtyFields[field];
    const hasError = !!errors[field];
    
    switch (field) {
      case "firstName":
        return (
          <EnhancedInput
            id="firstName"
            label="First Name"
            placeholder="Enter your first name"
            icon={User}
            error={errors.firstName?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("firstName")}
            autoFocus
          />
        );
        
      case "lastName":
        return (
          <EnhancedInput
            id="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            icon={User}
            error={errors.lastName?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("lastName")}
          />
        );
        
      case "ssn":
        return (
          <EnhancedInput
            id="ssn"
            label="Social Security Number"
            placeholder="XXX-XX-XXXX"
            icon={CreditCard}
            error={errors.ssn?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            helperText="Your SSN is encrypted and secure"
            {...register("ssn")}
            onChange={handleSSNChange}
            autoFocus
          />
        );
        
      case "dob":
        return (
          <EnhancedInput
            id="dob"
            label="Date of Birth"
            type="date"
            icon={Calendar}
            error={errors.dob?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("dob")}
            autoFocus
          />
        );
        
      case "phone":
        return (
          <EnhancedInput
            id="phone"
            label="Phone Number"
            placeholder="(XXX) XXX-XXXX"
            icon={Phone}
            error={errors.phone?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("phone")}
            onChange={handlePhoneChange}
            autoFocus
          />
        );
        
      case "email":
        return (
          <EnhancedInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("email")}
          />
        );

      case "password":
        return (
          <EnhancedInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            helperText="Must include uppercase, lowercase, and numbers"
            {...register("password")}
            autoFocus
            autoComplete="new-password"
          />
        );
        
      case "confirmPassword":
        // Check if passwords match for real-time feedback
        const passwordsMatch = 
          !watchConfirmPassword || 
          watchConfirmPassword === "" || 
          watchPassword === watchConfirmPassword;
        
        // Determine error message
        const confirmError = passwordsMatch 
          ? errors.confirmPassword?.message?.toString()
          : "Passwords do not match";
        
        // Set custom validation status
        const isValid = !!(isFieldDirty && !hasError && passwordsMatch && watchConfirmPassword);
        
        return (
          <div className="space-y-1">
            <EnhancedInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={confirmError}
              isValid={isValid}
              variant="blue"
              {...register("confirmPassword", {
                onChange: (e) => {
                  // Clear custom error when user types
                  if (e.target.value === watchPassword) {
                    clearErrors("confirmPassword");
                  }
                }
              })}
              autoComplete="new-password"
            />
            {!passwordsMatch && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Passwords do not match</span>
              </div>
            )}
          </div>
        );
        
      case "address":
        return (
          <EnhancedInput
            id="address"
            label="Address"
            placeholder="Street address"
            icon={Home}
            error={errors.address?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("address")}
            autoFocus
          />
        );
        
      case "city":
        return (
          <EnhancedInput
            id="city"
            label="City"
            placeholder="City"
            error={errors.city?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("city")}
          />
        );
        
      case "state":
        return (
          <EnhancedInput
            id="state"
            label="State"
            placeholder="State"
            error={errors.state?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("state")}
          />
        );
        
      case "zip":
        return (
          <EnhancedInput
            id="zip"
            label="ZIP Code"
            placeholder="ZIP code"
            error={errors.zip?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            {...register("zip")}
          />
        );
        
      case "hasMortgage":
        return (
          <div className="mb-3 flex flex-col items-center justify-center">
            <p className="text-center text-gray-700 mb-3">Do you currently have a mortgage?</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex flex-col items-center">
                <Toggle
                  className={`w-16 h-8 ${watchHasMortgage ? '' : ''}`}
                  {...register("hasMortgage")}
                />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {watchHasMortgage ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        );
        
      case "loanAmount":
        return (
          <EnhancedInput
            id="loanAmount"
            label="How Much Do You Need?"
            placeholder="$0.00"
            icon={DollarSign}
            error={errors.loanAmount?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            helperText="Enter the amount you're looking to secure"
            {...register("loanAmount")}
            onChange={handleCurrencyChange("loanAmount")}
            autoFocus
          />
        );
        
      case "monthlyIncome":
        return (
          <EnhancedInput
            id="monthlyIncome"
            label="Monthly Income (Before Taxes)"
            placeholder="$0.00"
            icon={DollarSign}
            error={errors.monthlyIncome?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            helperText="This helps us determine your funding options"
            {...register("monthlyIncome")}
            onChange={handleCurrencyChange("monthlyIncome")}
            autoFocus
          />
        );
        
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <GlassCard variant="blue" className="max-w-md mx-auto">
        <div className="py-10 px-8 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border border-blue-100 shadow-lg shadow-blue-100/50"
          >
            <CheckCircle className="h-10 w-10 text-blue-500" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Registration Complete!
          </h2>
          
            <p className="text-lg mb-2 text-slate-600">
              Thank you for completing your registration.
            </p>
            
            <p className="text-base mb-6 text-slate-500">
              You'll now be redirected to the credit report step...
            </p>
            
            <div className="flex justify-center">
            <EnhancedButton
                onClick={() => window.location.href = "/credit-report"}
              variant="blue"
              size="sm"
            >
                Continue to Credit Report
            </EnhancedButton>
          </div>
          </motion.div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row  max-w-4xl mx-auto relative px-4 py-8">
      <FloatingElements variant="blue" density="low" />
      
      {/* Left side - Progress visualization */}
      <div className="w-full lg:w-1/3 p-4 lg:pr-8 mb-8 lg:mb-0">
        <div className="lg:sticky lg:top-20">
          <motion.h3 
            className="text-lg md:text-xl font-semibold mb-6 text-blue-700 text-center lg:text-left"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
            Your Progress
            </span>
          </motion.h3>
          
          {/* Vertical progress steps */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {STEPS.map((stepItem, i) => (
              <motion.div 
                key={stepItem.id} 
                className="relative flex items-center mb-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <motion.div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center z-10 shadow-md transition-all duration-300 ${
                    i < safeStep ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' : 
                    i === safeStep ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white ring-4 ring-blue-100' : 
                    'bg-gray-100 text-gray-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {i < safeStep ? (
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                  ) : (
                    <span className="font-semibold">{i + 1}</span>
                  )}
                </motion.div>
                <div className="ml-4">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    i <= safeStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stepItem.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Security badges */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col space-y-4">
              <motion.div 
                className="flex items-center p-2 rounded-lg hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 border border-blue-200 shadow-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-blue-700 font-medium">Secure 256-bit encryption</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-2 rounded-lg hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 border border-blue-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-blue-700 font-medium">Quick approval process</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-2 rounded-lg hover:bg-blue-50/50 transition-all duration-300 cursor-pointer"
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 border border-blue-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <span className="text-sm text-blue-700 font-medium">Trusted by thousands of clients</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-2/3 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard 
            variant="blue" 
            className="shadow-2xl border-0 backdrop-blur-md bg-white/40 dark:bg-slate-900/40 overflow-hidden"
          >
          {/* Progress bar */}
            <div className="relative h-2 bg-gray-100/50">
              <motion.div 
                className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600"
                style={{ 
                  width: `${progress}%`, 
                  boxShadow: "0 1px 3px rgba(59, 130, 246, 0.3)"
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <form onSubmit={handleSubmit((data) => {
              console.log("Form submitted with data:", data);
              return onSubmit(data);
            })}>
            <div className="p-6">
              {/* Step title and description */}
              <div className="mb-6 text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-blue-700 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  {STEPS[safeStep].title}
                </h3>
                
                <p className="text-gray-600 text-base max-w-md mx-auto">
                  {STEPS[safeStep].description}
                </p>
                
                {/* Login option - Only show on the first step */}
                {safeStep === 0 && (
                  <div className="mt-2">
                    <Link 
                      href="/login" 
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      <LogIn className="mr-1 h-3 w-3" />
                      Already have an account? Log in
                    </Link>
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="bg-gradient-to-b from-blue-50/30 to-blue-100/20 p-8 rounded-2xl shadow-inner min-h-[300px] flex items-center justify-center backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={safeStep}
                    className="space-y-8 w-full max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepFields.map((field, index) => {
                  const fieldKey = field as keyof FormData;
                      return (
                        <motion.div 
                          key={fieldKey} 
                          className="transition-all duration-300 hover:translate-y-[-2px] mb-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {renderField(fieldKey)}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Form navigation */}
            <div className="p-6 border-t border-gray-100/50 flex justify-between items-center bg-gradient-to-b from-transparent to-blue-50/30">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <EnhancedButton
                type="button"
                onClick={goToPrevStep}
                variant="blue"
                outlined
                disabled={step === 0}
                iconLeft={<ArrowLeft className="h-4 w-4" />}
                size="sm"
                glassmorphism
                  className={step === 0 ? 'invisible' : 'hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300'}
              >
                Back
              </EnhancedButton>
              </motion.div>
              
              <div className="text-xs font-medium bg-blue-100/50 px-3 py-1.5 rounded-full text-blue-700 shadow-inner">
                Step {safeStep + 1} of {STEPS.length}
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <EnhancedButton
                  type={isLastStep ? "submit" : "button"}
                onClick={goToNextStep}
                variant="blue"
                isLoading={isSubmitting}
                  iconRight={!isLastStep && <ArrowRight className="h-5 w-5 ml-1" />}
                size="sm"
                  className="px-6 py-2.5 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600"
                  disabled={isSubmitting}
              >
                  {isLastStep ? 'Complete Registration' : 'Continue'}
              </EnhancedButton>
              </motion.div>
            </div>
          </form>
        </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}




