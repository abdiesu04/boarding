"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, LogIn, ExternalLink, AlertCircle, CreditCard, Lock, Shield, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import EnhancedInput from "@/components/ui/EnhancedInput";

// Schema for credit report form
const creditReportSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type CreditReportFormData = z.infer<typeof creditReportSchema>;

export default function CreditReportContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = useForm<CreditReportFormData>({
    resolver: zodResolver(creditReportSchema),
    mode: "onChange",
  });
  
  useEffect(() => {
    setMounted(true);

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const isAuthenticated = sessionStorage.getItem('userAuthenticated');
      const lastActivity = sessionStorage.getItem('lastActivity');
      const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    // Check if session is still valid
    const isSessionValid = isAuthenticated === 'true' && 
                          lastActivity && 
                          (Date.now() - parseInt(lastActivity)) < SESSION_TIMEOUT;
    
    if (!token || !isSessionValid) {
      console.log('No valid authentication found, redirecting to login');
      // Redirect to login if not authenticated
        window.location.replace('/login');
        return;
      }
    
    // Update last activity timestamp
      sessionStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  if (!mounted) return null;
  
  const onSubmit = async (data: CreditReportFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
        if (!token) {
        throw new Error('Authentication required');
      }
      
      // Send data to API endpoint
      const response = await fetch('/api/credit-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }
      
      console.log("Credit report credentials submitted:", result);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Update session data
      sessionStorage.setItem('userAuthenticated', 'true');
      sessionStorage.setItem('lastActivity', Date.now().toString());
      sessionStorage.setItem('creditReportSubmitted', 'true');
      
      // Show success toast
      toast.success('Credit report submitted successfully!', {
        duration: 3000,
      });
      
      // Redirect to funding agreement page after success
      setTimeout(() => {
        window.location.href = '/funding-agreement';
      }, 2000);
      
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Submission failed: ${errorMessage}`);
    }
  };
  
  if (isSuccess) {
    return (
      <div className="bg-white/70 p-4 rounded-lg mx-auto max-w-6xl w-full">
        <div className="p-2 md:px-8">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                  Credit Report Submitted
                </h2>
            <p className="text-gray-600 text-sm">
              Thank you for providing your credit report information
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-8 bg-emerald-100 rounded-full p-5 w-24 h-24 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Success!
            </h3>
            
            <p className="text-gray-600 mb-2 text-center">
              Your credit report information has been successfully submitted.
            </p>
            
            <p className="text-gray-500 text-sm mb-8 text-center">
                  You will be redirected to the next step shortly.
                </p>
                
                  <Button 
              className="px-8 h-12 text-base font-medium bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
              onClick={() => window.location.href = '/funding-agreement'}
                  >
                    Continue to Funding Agreement
              <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <div className="p-1 bg-blue-50 rounded-full mr-2">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <span>Your information is securely encrypted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 p-4 rounded-lg mx-auto max-w-6xl w-full">
      <div className="p-2 md:px-8">
        {/* Back to Dashboard Link */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
          Credit Report Information
          </h2>
          <p className="text-gray-600 text-sm">
            Please provide your SmartCredit username and password to continue
          </p>
        </div>
        
        {/* Progress indicator */}
            <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Application Progress</p>
            <p className="text-sm font-medium text-blue-600">Step 3 of 4</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="ml-2 text-xs text-gray-500">Registration</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="ml-2 text-xs text-gray-500">Personal Info</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <span className="text-xs">3</span>
              </div>
              <span className="ml-2 text-xs text-gray-500">Credit Report</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                <span className="text-xs">4</span>
              </div>
              <span className="ml-2 text-xs text-gray-500">Agreement</span>
            </div>
                </div>
              </div>
              
        {/* Instructions */}
        <div className="mb-8 bg-blue-50/40 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">Important Instructions</h3>
          </div>
          <p className="text-blue-900 mb-4">
            Visit <a href="https://smartcredit.com/palmettostartups" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline decoration-2 underline-offset-2 decoration-blue-400 hover:decoration-blue-600 transition-all">SmartCredit.com/palmettostartups</a> to get your credit report. The cost is $24.
          </p>
          <Link href="https://smartcredit.com/palmettostartups" target="_blank" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open SmartCredit
          </Link>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <EnhancedInput
                      id="username"
                  label="SmartCredit Username"
                      placeholder="Enter your username"
                  icon={User}
                      error={errors.username?.message}
                  isValid={!!dirtyFields.username && !errors.username}
                  variant="blue"
                      {...register("username")}
                      autoFocus
                />
                  </div>
              <div>
                <EnhancedInput
                      id="password"
                  label="SmartCredit Password"
                  placeholder="Enter your password"
                      type="password"
                  icon={Lock}
                      error={errors.password?.message}
                  isValid={!!dirtyFields.password && !errors.password}
                  variant="blue"
                      {...register("password")}
                />
              </div>
            </div>
                  </div>
                  
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-20"></div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                className="w-full relative h-12 text-base font-medium bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 py-2.5"
                    >
                      {isSubmitting ? (
                  <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                    Processing...
                        </span>
                      ) : (
                  <span>Submit Credit Report</span>
                      )}
                    </Button>
                </div>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <div className="p-1 bg-blue-50 rounded-full mr-2">
                  <Shield className="h-4 w-4 text-blue-600" />
            </div>
                <span>Your information is securely encrypted</span>
          </div>
          </div>
        </div>
        </form>
        </div>
    </div>
  );
}