"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { clientSchema } from "@/lib/schema";
import { formatSSN, formatPhone, formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { User, Mail, Phone, Home, DollarSign, CreditCard, CalendarIcon, ArrowRight, ArrowLeft, CheckCircle, Lock, LogIn } from "lucide-react";
import Link from "next/link";

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

export default function ClientRegistrationForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  // Add keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't trigger on textarea shift+enter
      const target = e.target as HTMLElement;
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault();
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
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(clientSchema),
    mode: "onChange",
    defaultValues: {
      hasMortgage: false
    }
  });

  const watchHasMortgage = watch("hasMortgage");
  const currentStepFields = STEPS[step].fields;
  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

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
        throw new Error(result.error || 'Registration failed');
      }
      
      // Store token in localStorage for authentication
      localStorage.setItem('token', result.token);
      
      console.log("Registration successful:", result);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Redirect to credit report page after successful registration
      setTimeout(() => {
        window.location.href = '/credit-report';
      }, 3000);
      
    } catch (error) {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      // Handle error (implement error state and display if needed)
      alert('Registration failed. Please try again.');
    }
  };

  // Go to next step with validation
  const goToNextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = currentStepFields as Array<keyof FormData>;
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setDirection("forward");
      if (isLastStep) {
        handleSubmit(onSubmit)();
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
  
  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character types check
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };
  
  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setValue("password", password, { shouldValidate: true });
    setPasswordStrength(calculatePasswordStrength(password));
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
    switch (field) {
      case "firstName":
        return (
          <div className="mb-3">
            <Label htmlFor="firstName" className="text-sm font-medium mb-1.5">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              icon={User}
              error={errors.firstName?.message}
              {...register("firstName")}
              autoFocus
              className="h-10 transition-all border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoComplete="given-name"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
        );
        
      case "lastName":
        return (
          <div className="mb-3">
            <Label htmlFor="lastName" className="text-sm font-medium mb-1.5">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              icon={User}
              error={errors.lastName?.message}
              {...register("lastName")}
              className="h-10 transition-all border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        );
        
      case "ssn":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="ssn">Social Security Number</Label>
            <div className="relative">
              <Input
                id="ssn"
                placeholder="XXX-XX-XXXX"
                icon={CreditCard}
                error={errors.ssn?.message}
                {...register("ssn")}
                onChange={handleSSNChange}
                autoFocus
                className="h-10 transition-all border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                maxLength={11}
              />
              <div className="absolute right-3 top-2.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                Secure
              </div>
            </div>
            {errors.ssn && (
              <p className="mt-1 text-xs text-red-500">{errors.ssn.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Your SSN is encrypted and secure
            </p>
          </div>
        );
        
      case "dob":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              icon={CalendarIcon}
              error={errors.dob?.message}
              {...register("dob")}
              autoFocus
            />
          </div>
        );
        
      case "phone":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="(XXX) XXX-XXXX"
              icon={Phone}
              error={errors.phone?.message}
              {...register("phone")}
              onChange={handlePhoneChange}
              autoFocus
            />
          </div>
        );
        
      case "email":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email")}
              className="h-10 transition-all border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
        );

      case "password":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              autoFocus
              className="transition-all border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...register("password")}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
            
            {/* Password strength indicator */}
            <div className="mt-2 mb-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Password strength</span>
                <span className="text-xs font-medium">
                  {passwordStrength === 0 && "Very weak"}
                  {passwordStrength === 1 && "Weak"}
                  {passwordStrength === 2 && "Fair"}
                  {passwordStrength === 3 && "Good"}
                  {passwordStrength === 4 && "Strong"}
                  {passwordStrength === 5 && "Very strong"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    passwordStrength === 0 ? 'bg-gray-300 w-0' :
                    passwordStrength === 1 ? 'bg-red-500 w-1/5' :
                    passwordStrength === 2 ? 'bg-orange-500 w-2/5' :
                    passwordStrength === 3 ? 'bg-yellow-500 w-3/5' :
                    passwordStrength === 4 ? 'bg-lime-500 w-4/5' :
                    'bg-green-500 w-full'
                  }`}
                />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase, and numbers
            </div>
          </div>
        );
        
      case "confirmPassword":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              className="transition-all border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        );
        
      case "address":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street address"
              icon={Home}
              error={errors.address?.message}
              {...register("address")}
              autoFocus
            />
          </div>
        );
        
      case "city":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              error={errors.city?.message}
              {...register("city")}
            />
          </div>
        );
        
      case "state":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="State"
              error={errors.state?.message}
              {...register("state")}
            />
          </div>
        );
        
      case "zip":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              placeholder="ZIP code"
              error={errors.zip?.message}
              {...register("zip")}
            />
          </div>
        );
        
      case "hasMortgage":
        return (
          <div className="mb-3 flex items-center justify-center">
            <div className="text-center">
              <Toggle
                label={watchHasMortgage ? "Yes" : "No"}
                className="text-sm"
                {...register("hasMortgage")}
              />
            </div>
          </div>
        );
        
      case "loanAmount":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="loanAmount">How Much Do You Need?</Label>
            <Input
              id="loanAmount"
              placeholder="$0.00"
              icon={DollarSign}
              error={errors.loanAmount?.message}
              {...register("loanAmount")}
              onChange={handleCurrencyChange("loanAmount")}
              autoFocus
            />
          </div>
        );
        
      case "monthlyIncome":
        return (
          <div className="mb-3">
            <Label className="text-sm font-medium mb-1.5" htmlFor="monthlyIncome">Monthly Income (Before Taxes)</Label>
            <Input
              id="monthlyIncome"
              placeholder="$0.00"
              icon={DollarSign}
              error={errors.monthlyIncome?.message}
              {...register("monthlyIncome")}
              onChange={handleCurrencyChange("monthlyIncome")}
              autoFocus
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="py-12 shadow-2xl border-0 rounded-3xl bg-white/95 backdrop-blur-lg max-w-xl mx-auto">
          <CardContent className="text-center px-8">
            <div className="mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1
                }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center shadow-md"
              >
                <CheckCircle className="h-12 w-12 text-emerald-500" />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Registration Complete! 🎉
              </h2>
              <p className="text-gray-600 text-lg mb-2 max-w-md mx-auto">
                Thank you for completing your registration. You'll now be redirected to the credit report step.
              </p>
              <p className="text-gray-500 text-base">
                Please wait a moment...
              </p>
            </motion.div>
          </CardContent>
          <CardFooter className="justify-center pt-4 pb-6">
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }} 
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={() => window.location.href = "/credit-report"}
                variant="secondary"
                className="px-6 py-2.5 shadow-md hover:shadow-lg text-base font-medium rounded-xl"
              >
                Continue to Credit Report
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="overflow-hidden shadow-2xl border-0 rounded-3xl bg-white/95 backdrop-blur-lg max-w-3xl mx-auto transform transition-all">
      {/* Progress bar */}
      <div className="relative w-full h-4">
        {/* Modern gradient progress bar */}
        <div className="w-full h-full bg-gradient-to-r from-gray-50 to-gray-200 rounded-t-md overflow-hidden">
          <motion.div 
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{
              background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 3s ease infinite",
              boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
            }}
          />
        </div>
        
        {/* Floating step indicators */}
        <div className="absolute top-0 left-0 w-full flex justify-between px-2 transform -translate-y-1/2">
          {/* Progress connector line */}
          <div className="absolute h-[3px] bg-gray-200 left-0 right-0 top-1/2 -z-10 transform -translate-y-1/2" />
          
          {STEPS.map((_, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0 }}
              animate={{ 
                scale: i <= step ? 1 : 0.7,
                y: i === step ? [-2, 0, -2] : 0,
              }}
              transition={{ 
                duration: i === step ? 2 : 0.3,
                repeat: i === step ? Infinity : 0,
                delay: 0.1 * i
              }}
              className={`flex items-center justify-center w-6 h-6 rounded-full z-10 border-2 ${
                i < step ? 'bg-emerald-500 border-emerald-600' : 
                i === step ? 'bg-blue-500 shadow-lg shadow-blue-300/50 border-blue-600 ring-4 ring-blue-100' : 
                'bg-gray-100 border-gray-300'
              }`}
            >
              {i <= step && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-white text-xs font-bold"
                >
                  {i + 1}
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-4 pb-1 px-6">
          {/* Step indicator */}
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Step {step + 1} of {STEPS.length}</span>
            <div className="flex space-x-1">
              {STEPS.map((stepItem, i) => (
                <div 
                  key={i}
                  className="relative" 
                >
                  <div 
                    className={`h-1.5 w-5 rounded-full transition-all duration-300 ${
                      i < step ? 'bg-emerald-500' : 
                      i === step ? 'bg-blue-500' : 
                      'bg-gray-200'
                    }`}
                  />
                  {i === step && (
                    <motion.div
                      className="absolute top-0 left-0 h-1.5 w-5 rounded-full bg-blue-400/40"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.8, 0.2, 0.8]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step title and description */}
          <div className="mb-8 text-center">
            <motion.div
              key={`title-${step}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight">{STEPS[step].title}</h2>
            </motion.div>
            <motion.div
              key={`desc-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-lg md:text-xl text-gray-600 font-medium max-w-md mx-auto">{STEPS[step].description}</p>
            </motion.div>
            
            {/* Login option - Only show on the first step */}
            {step === 0 && (
              <div className="mt-3">
                <Link 
                  href="/login" 
                  className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center justify-center gap-1.5 text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Already have an account? Log in
                </Link>
              </div>
            )}
          </div>

          {/* Step content with animation */}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="min-h-[220px] flex flex-col justify-center bg-gray-50/50 p-6 rounded-xl shadow-inner"
            >
              <div className="max-w-md mx-auto w-full">
                {currentStepFields.map((field) => {
                  const fieldKey = field as keyof FormData;
                  return <div key={fieldKey} className="enhanced-input">{renderField(fieldKey)}</div>;
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="px-8 py-6 flex justify-between bg-gradient-to-b from-transparent to-gray-50/30">
          <motion.div 
            whileHover={{ scale: step === 0 ? 1 : 1.03, y: step === 0 ? 0 : -2 }} 
            whileTap={{ scale: step === 0 ? 1 : 0.97 }}
          >
            <Button
              type="button"
              onClick={goToPrevStep}
              variant="secondary"
              disabled={step === 0}
              size="default"
              className={`shadow-md transition-all text-base font-medium px-8 py-3 rounded-xl ${
                step === 0 ? 'invisible' : 'hover:shadow-lg hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="mr-2.5 h-5 w-5" />
              Back
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03, y: -2 }} 
            whileTap={{ scale: 0.97 }}
            className="btn-presidential"
          >
            <Button
              type="button"
              onClick={goToNextStep}
              isLoading={isSubmitting}
              size="default"
              className="px-8 py-3 shadow-lg hover:shadow-xl relative overflow-hidden group text-base font-medium rounded-xl border-0"
            >
              <span className="relative z-10 flex items-center text-white">
                {isLastStep ? 'Complete Registration' : 'Continue'}
                {!isLastStep && (
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowRight className="ml-2.5 h-5 w-5 inline-block" />
                  </motion.div>
                )}
              </span>
              
              {/* Button gradient background with animation */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500"
                style={{ backgroundSize: '200% 200%' }}
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
            </Button>
          </motion.div>
        </CardFooter>
      </form>
    </Card>
  );
}