"use client";

import { useEffect, useState } from "react";
import EnhancedPersonalInfoForm from "@/components/forms/EnhancedPersonalInfoForm";

export default function PersonalInfoPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-slate-50/30 z-0"></div>
      
      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <div className="inline-block mb-6">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-blue-600">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(37, 99, 235, 0.1)" />
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 text-slate-800">
          Complete Your Profile
        </h1>
        
        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto">
          Please provide your personal information to continue
        </p>
      </div>
      
      {/* Main content */}
      <div className="w-full max-w-5xl mx-auto">
        <EnhancedPersonalInfoForm />
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center relative z-10">
        <div className="flex items-center justify-center space-x-6 mb-4">
          <div className="flex items-center text-xs text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            256-bit encryption
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Privacy protected
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            50,000+ clients
          </div>
        </div>
        <div className="text-xs text-slate-400">
          © 2023 Premium Financial Services. All rights reserved.
        </div>
      </div>
    </div>
  );
}
