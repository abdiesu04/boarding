"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { formatSSN, formatPhone, formatCurrency } from "@/lib/formatters";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedButton from "@/components/ui/EnhancedButton";
import EnhancedInput from "@/components/ui/EnhancedInput";
import FloatingElements from "@/components/ui/FloatingElements";
import { Toggle } from "@/components/ui/toggle";
import { User, Phone, Home, DollarSign, CreditCard, Calendar, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Shield, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

// Personal info schema
const personalInfoSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip: z.string().min(1, { message: "ZIP code is required" }),
  ssn: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, { message: "SSN must be in the format XXX-XX-XXXX" })
    .min(1, { message: "SSN is required" }),
  dob: z.string().min(1, { message: "Date of birth is required" }),
  phone: z
    .string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, { message: "Phone number must be in format (XXX) XXX-XXXX" })
    .min(1, { message: "Phone number is required" }),
  hasMortgage: z.boolean(),
  fundingAmount: z
    .string()
    .min(1, { message: "Funding amount is required" })
    .refine((val) => !isNaN(Number(val.replace(/[^0-9.-]+/g, ""))), {
      message: "Please enter a valid amount",
    }),
  monthlyIncome: z
    .string()
    .min(1, { message: "Monthly income is required" })
    .refine((val) => !isNaN(Number(val.replace(/[^0-9.-]+/g, ""))), {
      message: "Please enter a valid amount",
    }),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// Step definitions for the personal info form
const STEPS = [
  {
    id: "address",
    title: "What's your address?",
    description: "Please provide your current residential address",
    fields: ["address", "city", "state", "zip"],
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
    title: "What's your phone number?",
    description: "We'll use this to contact you if needed",
    fields: ["phone"],
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
    fields: ["fundingAmount"],
  },
  {
    id: "financialIncome",
    title: "What's your monthly income?",
    description: "Please provide your pre-tax monthly income",
    fields: ["monthlyIncome"],
  },
];

export default function EnhancedPersonalInfoForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [mounted, setMounted] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Fetch client info to pre-populate phone number
    const fetchClientInfo = async () => {
      try {
        let token = '';
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token') || '';
          if (!token) {
            const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
            if (match) token = match[1];
          }
        }

        if (token) {
          const response = await fetch('/api/client/info', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setClientInfo(data.client);
          }
        }
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };

    fetchClientInfo();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, dirtyFields },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: {
      hasMortgage: false
    }
  });

  // Pre-populate phone number when clientInfo is available
  useEffect(() => {
    if (clientInfo?.phone) {
      setValue("phone", clientInfo.phone, { shouldValidate: false });
    }
  }, [clientInfo, setValue]);

  const watchHasMortgage = watch("hasMortgage");

  // Ensure step is within valid range
  const safeStep = Math.max(0, Math.min(step, STEPS.length - 1));
  const currentStepFields = STEPS[safeStep]?.fields || [];
  const isLastStep = safeStep === STEPS.length - 1;
  const progress = ((safeStep + 1) / STEPS.length) * 100;

  // Form submission handler
  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get token from localStorage or cookies
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
        if (!token) {
          // Try to get from cookies
          const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
          if (match) token = match[1];
        }
      }

      // Convert hasMortgage boolean to string for API
      const submitData = {
        ...data,
        hasMortgage: data.hasMortgage ? 'yes' : 'no'
      };

      const response = await fetch('/api/personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(submitData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const errorMessage = result.error || "Submission failed";
        if (errorMessage.includes('SSN') || errorMessage.includes('ssn')) {
          toast.error('This SSN is already registered. Please contact support if you need assistance.', {
            icon: <AlertCircle className="h-5 w-5" />
          });
        } else {
          toast.error(errorMessage, {
            icon: <AlertCircle className="h-5 w-5" />
          });
        }
        setIsSubmitting(false);
        return;
      }
      
      setIsSuccess(true);
      toast.success("Personal information submitted! Redirecting to credit report...");
      setTimeout(() => {
        window.location.href = "/credit-report";
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Submission failed",
        { icon: <AlertCircle className="h-5 w-5" /> }
      );
      setIsSubmitting(false);
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

  const handleCurrencyChange = (field: "fundingAmount" | "monthlyIncome") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    e.target.value = formatted;
    setValue(field, formatted, { shouldValidate: true });
  };

  // Validate current step before advancing
  const validateStep = async () => {
    const fieldsToValidate = currentStepFields as (keyof PersonalInfoFormData)[];
    const result = await trigger(fieldsToValidate);
    return result;
  };

  // Go to next step
  const goToNextStep = async () => {
    const isValid = await validateStep();
    if (!isValid) {
      toast.error("Please fill in all required fields correctly before continuing.", {
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 4000
      });
      return false;
    }

    setDirection("forward");
    if (isLastStep) {
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
  };

  // Go to previous step
  const goToPrevStep = () => {
    if (step > 0) {
      setDirection("backward");
      setStep((prev) => prev - 1);
    }
  };

  // Animation variants
  const slideVariants = {
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
  const renderField = (field: keyof PersonalInfoFormData) => {
    const isFieldDirty = dirtyFields[field];
    const hasError = !!errors[field];

    switch (field) {
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

      case "hasMortgage":
        return (
          <div className="mb-3 flex flex-col items-center justify-center">
            <p className="text-center text-gray-700 mb-3">Do you currently have a mortgage?</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex flex-col items-center">
                <Toggle
                  className={`w-16 h-8`}
                  {...register("hasMortgage")}
                />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {watchHasMortgage ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        );

      case "fundingAmount":
        return (
          <EnhancedInput
            id="fundingAmount"
            label="How Much Do You Need?"
            placeholder="$0.00"
            icon={DollarSign}
            error={errors.fundingAmount?.message?.toString()}
            isValid={isFieldDirty && !hasError}
            variant="blue"
            helperText="Enter the amount you're looking to secure"
            {...register("fundingAmount")}
            onChange={handleCurrencyChange("fundingAmount")}
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

  if (!mounted) return null;

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
              Personal Information Complete!
            </h2>

            <p className="text-lg mb-2 text-slate-600">
              Thank you for completing your personal information.
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
    <div className="flex flex-col lg:flex-row max-w-4xl mx-auto relative px-4 py-8">
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

            <form onSubmit={handleSubmit((data) => onSubmit(data))}>
              <div className="p-6">
                {/* Step title and description */}
                <div className="mb-6 text-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-blue-700 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                    {STEPS[safeStep].title}
                  </h3>
                  <p className="text-gray-600 text-base max-w-md mx-auto">
                    {STEPS[safeStep].description}
                  </p>
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    Step 2 of 4 - Personal Information
                  </div>
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
                        const fieldKey = field as keyof PersonalInfoFormData;
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
                    {isLastStep ? 'Complete Personal Info' : 'Continue'}
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
