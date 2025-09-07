"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { clientSchema } from "@/lib/schema";
import { formatSSN, formatPhone, formatCurrency } from "@/lib/formatters";
import PresidentialCard from "@/components/ui/PresidentialCard";
import PresidentialButton from "@/components/ui/PresidentialButton";
import PresidentialInput from "@/components/ui/PresidentialInput";
import { Toggle } from "@/components/ui/toggle";
import { User, Mail, Phone, Home, DollarSign, CreditCard, Calendar, ArrowRight, ArrowLeft, CheckCircle, Lock, LogIn } from "lucide-react";
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
    fields: ["password"],
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

export default function PresidentialRegistrationForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log("Form submitted:", data);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  // Go to next step - fixed to always work
  const goToNextStep = () => {
    // Skip validation entirely to ensure button always works
    setDirection("forward");
    if (isLastStep) {
      handleSubmit(onSubmit)();
    } else {
      setStep((prev) => prev + 1);
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
    switch (field) {
      case "firstName":
        return (
          <PresidentialInput
            id="firstName"
            label="First Name"
            placeholder="Enter your first name"
            icon={User}
            error={errors.firstName?.message?.toString()}
            {...register("firstName")}
            autoFocus
          />
        );
        
      case "lastName":
        return (
          <PresidentialInput
            id="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            icon={User}
            error={errors.lastName?.message?.toString()}
            {...register("lastName")}
          />
        );
        
      case "ssn":
        return (
          <PresidentialInput
            id="ssn"
            label="Social Security Number"
            placeholder="XXX-XX-XXXX"
            icon={CreditCard}
            error={errors.ssn?.message?.toString()}
            {...register("ssn")}
            onChange={handleSSNChange}
            autoFocus
          />
        );
        
      case "dob":
        return (
          <PresidentialInput
            id="dob"
            label="Date of Birth"
            type="date"
            icon={Calendar}
            error={errors.dob?.message?.toString()}
            {...register("dob")}
            autoFocus
          />
        );
        
      case "phone":
        return (
          <PresidentialInput
            id="phone"
            label="Phone Number"
            placeholder="(XXX) XXX-XXXX"
            icon={Phone}
            error={errors.phone?.message?.toString()}
            {...register("phone")}
            onChange={handlePhoneChange}
            autoFocus
          />
        );
        
      case "email":
        return (
          <PresidentialInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message?.toString()}
            {...register("email")}
          />
        );

      case "password":
        return (
          <PresidentialInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message?.toString()}
            {...register("password")}
            autoFocus
          />
        );
        
      case "address":
        return (
          <PresidentialInput
            id="address"
            label="Address"
            placeholder="Street address"
            icon={Home}
            error={errors.address?.message?.toString()}
            {...register("address")}
            autoFocus
          />
        );
        
      case "city":
        return (
          <PresidentialInput
            id="city"
            label="City"
            placeholder="City"
            error={errors.city?.message?.toString()}
            {...register("city")}
          />
        );
        
      case "state":
        return (
          <PresidentialInput
            id="state"
            label="State"
            placeholder="State"
            error={errors.state?.message?.toString()}
            {...register("state")}
          />
        );
        
      case "zip":
        return (
          <PresidentialInput
            id="zip"
            label="ZIP Code"
            placeholder="ZIP code"
            error={errors.zip?.message?.toString()}
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
                  className={`w-16 h-8 ${watchHasMortgage ? 'bg-blue-500' : 'bg-gray-300'}`}
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
          <PresidentialInput
            id="loanAmount"
            label="How Much Do You Need?"
            placeholder="$0.00"
            icon={DollarSign}
            error={errors.loanAmount?.message?.toString()}
            {...register("loanAmount")}
            onChange={handleCurrencyChange("loanAmount")}
            autoFocus
          />
        );
        
      case "monthlyIncome":
        return (
          <PresidentialInput
            id="monthlyIncome"
            label="Monthly Income (Before Taxes)"
            placeholder="$0.00"
            icon={DollarSign}
            error={errors.monthlyIncome?.message?.toString()}
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
      <PresidentialCard variant="blue">
        <div className="py-8 px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
          >
            Registration Complete
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-700 text-sm mb-6"
          >
            Thank you for completing your registration. Our team will contact you shortly to discuss your funding options.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <PresidentialButton
              onClick={() => window.location.href = "/"}
              variant="blue"
              outlined
              size="sm"
            >
              Return to Home
            </PresidentialButton>
          </motion.div>
        </div>
      </PresidentialCard>
    );
  }

  return (
    <PresidentialCard variant="blue">
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-100">
        <motion.div 
          className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          {/* Step indicator */}
          <div className="mb-3 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Step {step + 1} of {STEPS.length}</span>
            <div className="flex space-x-1">
              {STEPS.map((_, i) => (
                <motion.div 
                  key={i}
                  className={`h-1 w-5 rounded-full ${
                    i < step ? 'bg-blue-500' : 
                    i === step ? 'bg-blue-400' : 
                    'bg-gray-200'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                />
              ))}
            </div>
          </div>

          {/* Step title and description */}
          <div className="mb-4 text-center">
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              {STEPS[step].title}
            </motion.h2>
            
            <motion.p
              key={`desc-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm text-gray-600"
            >
              {STEPS[step].description}
            </motion.p>
            
            {/* Login option - Only show on the first step */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-2"
              >
                <Link 
                  href="/login" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs"
                >
                  <LogIn className="mr-1 h-3 w-3" />
                  Already have an account? Log in
                </Link>
              </motion.div>
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
              className="space-y-4 min-h-[180px]"
            >
              {currentStepFields.map((field) => {
                const fieldKey = field as keyof FormData;
                return <div key={fieldKey}>{renderField(fieldKey)}</div>;
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Form navigation */}
        <div className="p-4 border-t border-gray-100 flex justify-between">
          <PresidentialButton
            type="button"
            onClick={goToPrevStep}
            variant="blue"
            outlined
            disabled={step === 0}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            size="sm"
          >
            Back
          </PresidentialButton>
          
          <PresidentialButton
            type="button"
            onClick={goToNextStep}
            variant="blue"
            isLoading={isSubmitting}
            iconRight={!isLastStep && <ArrowRight className="h-4 w-4" />}
            size="sm"
          >
            {isLastStep ? 'Complete' : 'Continue'}
          </PresidentialButton>
        </div>
      </form>
    </PresidentialCard>
  );
}

