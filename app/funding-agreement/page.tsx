"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, Download, Pen, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';

// Schema for funding agreement form
const fundingAgreementSchema = z.object({
  signature: z.string().min(1, { message: "Signature is required" }),
});

type FundingAgreementFormData = z.infer<typeof fundingAgreementSchema>;

export default function FundingAgreementPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('funding_agreement.pdf');
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [signatureDataURL, setSignatureDataURL] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FundingAgreementFormData>({
    resolver: zodResolver(fundingAgreementSchema),
    mode: "onChange",
  });
  
  useEffect(() => {
    setMounted(true);
    
    // Initialize canvas when component mounts
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas to be responsive to device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Set canvas size based on display size
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // Scale the context to ensure correct drawing
        ctx.scale(dpr, dpr);
        
        // Set drawing styles
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'black';
        
        // Add meta tag to prevent zooming on mobile
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const isAuthenticated = sessionStorage.getItem('userAuthenticated');
    const lastActivity = sessionStorage.getItem('lastActivity');
    const creditReportSubmitted = sessionStorage.getItem('creditReportSubmitted');
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
    
    // Check if credit report was submitted
    if (!creditReportSubmitted && process.env.NODE_ENV === 'production') {
      console.log('Credit report not submitted, redirecting to credit report page');
      window.location.replace('/credit-report');
      return;
    }
    
    // Update last activity timestamp
    sessionStorage.setItem('lastActivity', Date.now().toString());
    
    // Fetch client information
    const fetchClientInfo = async () => {
      try {
        const response = await fetch('/api/client/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setClientInfo(data.client);
        } else {
          console.error('Failed to fetch client info');
        }
      } catch (error) {
        console.error('Error fetching client info:', error);
      }
    };
    
    fetchClientInfo();
  }, []);
  
  if (!mounted) return null;
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default behavior like scrolling on touch
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Prevent scrolling on touch devices
      e.stopPropagation();
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position with proper scaling
    const x = (clientX - rect.left) / (rect.width / canvas.width);
    const y = (clientY - rect.top) / (rect.height / canvas.height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent default behavior
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Prevent scrolling on touch devices
      e.stopPropagation();
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position with proper scaling
    const x = (clientX - rect.left) / (rect.width / canvas.width);
    const y = (clientY - rect.top) / (rect.height / canvas.height);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataURL('');
    setValue('signature', '');
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is empty
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get image data to check if canvas is empty
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const isEmpty = !imageData.some(channel => channel !== 0);
    
    if (isEmpty) {
      toast.error('Please sign before saving');
      return;
    }
    
    const dataURL = canvas.toDataURL('image/png');
    setSignatureDataURL(dataURL);
    setValue('signature', dataURL);
    toast.success('Signature saved!');
  };
  
  // Form submission handler
  const onSubmit = async (data: FundingAgreementFormData) => {
    if (!signatureDataURL) {
      toast.error('Please sign the agreement');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Send data to API endpoint
      const response = await fetch('/api/funding-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          signature: signatureDataURL,
          phone: clientInfo?.phone || ''
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }
      
      console.log("Funding agreement submitted:", result);
      setPdfUrl(result.pdfUrl);
      setPdfBase64(result.pdfBase64);
      if (result.fileName) {
        setPdfFileName(result.fileName);
      }
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Automatically download the signed document
      setTimeout(() => {
        if (result.pdfBase64) {
          // Create a download link for the base64 data
          const link = document.createElement('a');
          link.href = result.pdfBase64;
          link.download = result.fileName || 'funding_agreement.pdf';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
          toast.success('Agreement automatically downloaded!', {
            duration: 3000,
            icon: '📄'
          });
        } else if (result.pdfUrl) {
          // Fallback to Cloudinary URL if base64 is not available
          const link = document.createElement('a');
          link.href = result.pdfUrl;
          link.download = result.fileName || 'funding_agreement.pdf';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
          toast.success('Agreement automatically downloaded!', {
            duration: 3000,
            icon: '📄'
          });
        }
      }, 1000); // Small delay to ensure the UI has updated
      
      // Store additional session data to maintain login state
      sessionStorage.setItem('userAuthenticated', 'true');
      sessionStorage.setItem('lastActivity', Date.now().toString());
      sessionStorage.setItem('documentSigned', 'true');
      
      // Store token in localStorage to ensure it persists
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        // Make sure we keep the token for the dashboard
        localStorage.setItem('token', currentToken);
      }
      
      // Set a flag to indicate successful document signing
      localStorage.setItem('documentSigned', 'true');
      
      // Show success toast
      toast.success('Document signed successfully!', {
        duration: 3000,
      });
      
      // Redirect to dashboard after success
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      toast.error(`Submission failed: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };
  
  // Agreement text content
  const agreementContent = `
CLIENT FUNDING AGREEMENT

This agreement is made between:
Client Name: ${clientInfo?.user?.firstName || ''} ${clientInfo?.user?.lastName || ''}
Address: ${clientInfo?.address || ''}, ${clientInfo?.city || ''}, ${clientInfo?.state || ''} ${clientInfo?.zip || ''}
Phone: ${clientInfo?.phone || ''}   Email: ${clientInfo?.user?.email || ''}

AND

Service Provider: George Burgess   Contact Email: support@Un-Employed.io

1. Scope of Services
George The Credit Goat agrees to assist the Client in securing personal funding up to $50,000 through third-party lenders, based on the Client's qualifications.

2. Success Fee
Client agrees to pay a success fee of 10% of the total amount of funding received.

The success fee is due the same day funds are deposited into the Client's account.
Payment will be made via direct ACH withdrawal from the Client's account to George The Credit Goat.

Examples:
- If you receive $20,000, your success fee is $2,000 (10%).
- If you receive $40,000, your success fee is $4,000 (10%).

3. Authorization to Apply & Sign on Client's Behalf
By signing this agreement, the Client grants George The Credit Goat and its authorized representatives full permission to:
- Submit funding applications to third-party lenders on the Client's behalf.
- Review and sign loan-related documents necessary to secure funding.
- Communicate directly with lenders regarding the Client's application and required supporting information.

This authorization is strictly limited to activities related to securing personal and business funding.

4. Non-Payment Clause
If the success fee is not successfully collected via ACH on the day funding is received:
- The account will be turned over to our legal team at:

Love Law Group
331 E Main Street, Suite 200
Rock Hill, SC 29730

- Clients may be subject to legal action, including court costs, attorney's fees, and other enforcement measures as permitted by law.

5. Acknowledgment & Agreement
By signing below, the Client acknowledges they have read, understood, and agree to all terms of this agreement.
`;

  if (isSuccess) {
    return (
      <div className="bg-white/70 p-4 rounded-lg mx-auto max-w-6xl w-full">
        <div className="p-2 md:px-8">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
              Agreement Successfully Signed
            </h2>
            <p className="text-gray-600 text-sm">
              Thank you for signing the funding agreement
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
              Your funding agreement has been successfully signed.
            </p>
            
            <p className="text-gray-500 text-sm mb-8 text-center">
              The signed document has been automatically downloaded. You will be redirected to your dashboard shortly.
            </p>
            
            <div className="flex flex-col space-y-3 w-full max-w-md">
              {(pdfBase64 || pdfUrl) && (
                <Button
                  className="inline-flex items-center w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={() => {
                    // Prefer direct download using base64 data
                    if (pdfBase64) {
                      // Create a download link for the base64 data
                      const link = document.createElement('a');
                      link.href = pdfBase64;
                      link.download = pdfFileName;
                      document.body.appendChild(link);
                      link.click();
                      setTimeout(() => {
                        document.body.removeChild(link);
                      }, 100);
                    } else if (pdfUrl) {
                      // Fallback to Cloudinary URL if base64 is not available
                      window.open(pdfUrl, '_blank');
                      
                      // Create a fallback download link
                      const link = document.createElement('a');
                      link.href = pdfUrl;
                      link.download = pdfFileName;
                      link.target = '_blank';
                      document.body.appendChild(link);
                      link.click();
                      setTimeout(() => {
                        document.body.removeChild(link);
                      }, 100);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Agreement
                </Button>
              )}
              
              <Button
                className="inline-flex items-center w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                onClick={() => {
                  // Set the same flags as in the submission handler
                  sessionStorage.setItem('userAuthenticated', 'true');
                  sessionStorage.setItem('lastActivity', Date.now().toString());
                  sessionStorage.setItem('documentSigned', 'true');
                  
                  // Use href for more reliable navigation
                  window.location.href = '/dashboard';
                }}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Go to Dashboard Now
              </Button>
            </div>
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
            Funding Agreement
          </h2>
          <p className="text-gray-600 text-sm">
            Please review and sign the agreement below
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Application Progress</p>
            <p className="text-sm font-medium text-blue-600">Step 4 of 4</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="ml-2 text-xs text-gray-500">Step 1 - Register</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="ml-2 text-xs text-gray-500">Step 2 - Personal Info</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="ml-2 text-xs text-gray-500">Step 3 - Credit Report</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <span className="text-xs">4</span>
              </div>
              <span className="ml-2 text-xs text-gray-500">Step 4 - Document Sign</span>
            </div>
          </div>
        </div>
        
        {/* Agreement Text */}
        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 mb-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {agreementContent}
            </pre>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <Label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
              Your Signature
            </Label>
            <div className="border border-gray-300 rounded-lg p-2 bg-white">
              <div className="signature-container relative" style={{ touchAction: 'none' }}>
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 bg-white border border-gray-100 rounded"
                  width={500}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ touchAction: 'none' }}
                />
              </div>
              
              <input
                id="signature-input"
                type="hidden"
                {...register('signature')}
                value={signatureDataURL}
              />
              {errors.signature && (
                <p className="text-red-500 text-xs mt-1">{errors.signature.message}</p>
              )}
            </div>
            
            <div className="flex justify-between mt-2">
              <Button
                id="clear-signature"
                type="button"
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={clearSignature}
              >
                Clear
              </Button>
              <Button
                id="save-signature"
                type="button"
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={saveSignature}
              >
                Save Signature
              </Button>
            </div>
            
            {signatureDataURL && (
              <div className="mt-4 p-2 border border-green-200 bg-green-50 rounded-lg">
                <p className="text-green-700 text-xs flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Signature saved successfully
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-20"></div>
              <Button
                type="submit"
                disabled={isSubmitting || !signatureDataURL}
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
                  <span>Sign Agreement</span>
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