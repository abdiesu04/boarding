"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Home, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import FloatingElements from "@/components/ui/FloatingElements";
import { Toggle } from "@/components/ui/toggle";

const fundingSchema = z.object({
  loanAmount: z.string().min(1, { message: "Requested amount is required" }),
  monthlyIncome: z.string().min(1, { message: "Monthly income is required" }),
  hasMortgage: z.boolean(),
});

type FundingFormData = z.infer<typeof fundingSchema>;

export default function FundingDetailsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
    watch,
  } = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    mode: "onChange",
    defaultValues: { hasMortgage: false },
  });

  const watchHasMortgage = watch("hasMortgage");

    const onSubmit = async (data: FundingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/funding-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }
      setIsSuccess(true);
      // Notify dashboard to refresh client info
      localStorage.setItem('fundingDetailsUpdated', Date.now().toString());
      toast.success("Funding details submitted! Redirecting...");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Submission failed",
        { icon: <AlertCircle className="h-5 w-5" /> }
      );
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        window.location.replace('/dashboard');
      }, 1800);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <FloatingElements variant="blue" density="low" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="py-8 shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-md">
            <CardContent className="text-center p-8">
              <motion.div
                className="mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-emerald-500 text-center">
                  Funding Details Submitted
                </h2>
                <p className="text-gray-600 text-lg">
                  Thank you for providing your funding details.
                </p>
                <p className="text-gray-500 mt-2">
                  You will be redirected to your dashboard shortly.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <FloatingElements variant="blue" density="low" />
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="overflow-hidden shadow-2xl border-0 rounded-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="bg-gradient-to-r text-white text-center px-6">
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-5 w-5 mr-2" />
              Funding Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount" className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                      How Much Do You Need?
                  </Label>
                  <Input
                    id="loanAmount"
                    placeholder="$0.00"
                    error={errors.loanAmount?.message}
                    {...register("loanAmount")}
                    className="h-11 rounded-lg shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.loanAmount && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.loanAmount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome" className="text-sm font-medium text-gray-700 flex items-center">
                    <Home className="h-4 w-4 mr-2 text-blue-500" />
                    Monthly Income
                  </Label>
                  <Input
                    id="monthlyIncome"
                    placeholder="$0.00"
                    error={errors.monthlyIncome?.message}
                    {...register("monthlyIncome")}
                    className="h-11 rounded-lg shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.monthlyIncome && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.monthlyIncome.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Label htmlFor="hasMortgage" className="text-sm font-medium text-gray-700 flex items-center">
                    <Home className="h-4 w-4 mr-2 text-blue-500" />
                    Has Mortgage
                  </Label>
                  <Toggle
                    id="hasMortgage"
                    checked={watchHasMortgage}
                    onChange={(event) => setValue("hasMortgage", event.target.checked, { shouldValidate: true })}
                  />
                  <span className={watchHasMortgage ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {watchHasMortgage ? "Yes" : "No"}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md mt-6"
                >
                  {isSubmitting ? "Submitting..." : "Submit Funding Details"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
