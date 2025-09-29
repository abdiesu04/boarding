"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { User, FileText, CreditCard, DollarSign, Bell, LogOut, Settings, Download, Shield, CheckCircle, Clock, ChevronRight, Calendar, Wallet, Home, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import FloatingElements from "@/components/ui/FloatingElements";

export default function DashboardPage() {
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  useEffect(() => {
    console.log("Dashboard page mounted");
    setMounted(true);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const isAuthenticated = sessionStorage.getItem('userAuthenticated');
    const lastActivity = sessionStorage.getItem('lastActivity');
    const documentSigned = localStorage.getItem('documentSigned');
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Function to log all cookies for debugging
    const logAllCookies = () => {
      console.log("==== DASHBOARD COOKIES ====");
      const cookiesArray = document.cookie.split(';').map(cookie => cookie.trim());
      if (cookiesArray.length === 0 || (cookiesArray.length === 1 && cookiesArray[0] === '')) {
        console.log("No cookies found in dashboard");
      } else {
        cookiesArray.forEach(cookie => {
          const [name, value] = cookie.split('=');
          console.log(`Cookie: ${name} = ${value ? value.substring(0, 20) + (value.length > 20 ? '...' : '') : 'empty'}`);
        });
      }
      console.log("=======================");
    };
    
    // Log cookies immediately
    console.log("Checking cookies in dashboard on mount:");
    logAllCookies();
    
    // Check for token in cookies as well (for middleware compatibility)
    const getCookieValue = (name: string): string | null => {
      console.log(`Looking for cookie: ${name}`);
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          const value = cookie.substring(name.length + 1);
          console.log(`Found cookie ${name}: ${value ? value.substring(0, 20) + '...' : 'empty'}`);
          return value;
        }
      }
      console.log(`Cookie ${name} not found`);
      return null;
    };
    
    const cookieToken = getCookieValue('token');
    console.log(`Cookie token exists: ${!!cookieToken}`);
    console.log(`LocalStorage token exists: ${!!token}`);
    
    // If token exists in localStorage but not in cookie, set it in cookie
    if (token && !cookieToken) {
      console.log("Token found in localStorage but not in cookie, setting cookie");
      try {
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Strict`;
        console.log("Cookie set, verifying...");
        
        // Verify cookie was set
        setTimeout(() => {
          const checkCookie = getCookieValue('token');
          console.log(`Cookie verification: ${checkCookie ? 'SUCCESS' : 'FAILED'}`);
          logAllCookies();
        }, 100);
      } catch (e) {
        console.error("Error setting cookie:", e);
      }
    }
    
    console.log("Raw authentication data:", {
      localStorageToken: token ? "exists" : "missing",
      cookieToken: cookieToken ? "exists" : "missing",
      isAuthenticated,
      lastActivity,
      documentSigned
    });
    
    // Check if session is still valid
    const isSessionValid = isAuthenticated === 'true' && 
                          lastActivity && 
                          (Date.now() - parseInt(lastActivity)) < SESSION_TIMEOUT;
    
    // Log authentication state for debugging
    console.log('Auth state evaluation:', { 
      tokenExists: !!token, 
      isAuthenticated, 
      lastActivity: lastActivity ? new Date(parseInt(lastActivity)).toISOString() : null,
      isSessionValid,
      documentSigned,
      currentUrl: window.location.href
    });
    
    if (!token && !isSessionValid && !documentSigned) {
      console.log('No valid authentication found, redirecting to login');
      // Redirect to login if not authenticated and no valid session
      toast.error("Authentication required. Please log in.");
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      return;
    }
    
    // Force token refresh if we have a valid session but no token
    // This can happen if the token was cleared but session is still valid
    if (!token && isSessionValid) {
      console.log('Session valid but no token, refreshing authentication');
      toast.error('Your session needs to be refreshed. Please log in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      return;
    }
    
    console.log("Authentication validated successfully, proceeding with dashboard load");
    
    // Update last activity timestamp
    sessionStorage.setItem('lastActivity', Date.now().toString());
    
    // If we have a document signed flag but no token, we need to fetch user info differently
    const hasDocumentSignedOnly = documentSigned === 'true' && !token;
    
    // Fetch client information
    const fetchClientInfo = async () => {
      try {
        if (!token) {
          console.error('No token available for API request');
          toast.error('Authentication token missing. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        console.log('Fetching client info with token');
        const response = await fetch('/api/client/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Log response status for debugging
        console.log('Client info API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Client info loaded successfully');
          console.log(data)
          setClientInfo(data.client);
          
          // If we got here from document signing, clear the flag
          if (documentSigned === 'true') {
            localStorage.removeItem('documentSigned');
          }
        } else if (response.status === 401) {
          // Token is invalid, clear it and redirect to login
          console.error('Token unauthorized (401). Clearing auth data.');
          localStorage.removeItem('token');
          sessionStorage.removeItem('userAuthenticated');
          toast.error('Your session has expired. Please log in again.');
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        } else {
          console.error('Failed to fetch client info:', response.status);
          toast.error('Failed to load your information. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching client info:', error);
        toast.error('Error loading your information. Please refresh the page.');
      }
    };
    
    // Fetch client documents
    const fetchDocuments = async () => {
      try {
        if (!token) {
          console.error('No token available for documents API request');
          return;
        }
        
        const response = await fetch('/api/client/documents', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDocuments(data.documents);
        } else if (response.status === 401) {
          // Handle unauthorized silently as fetchClientInfo will handle the redirect
          console.error('Unauthorized for documents');
        } else {
          console.error('Failed to fetch documents');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    
    Promise.all([fetchClientInfo(), fetchDocuments()])
      .finally(() => setIsLoading(false));
      
  }, []);
  
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mb-4 shadow-md"></div>
          <div className="h-5 w-48 bg-blue-100 rounded-md mb-3"></div>
          <div className="h-4 w-32 bg-gray-100 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  const handleLogout = () => {
    console.log("Logging out user");
    
    // Log current auth state before logout
    console.log("Auth state before logout:", {
      token: !!localStorage.getItem('token'),
      cookieToken: document.cookie.includes('token='),
      isAuthenticated: sessionStorage.getItem('userAuthenticated'),
      lastActivity: sessionStorage.getItem('lastActivity'),
      userRole: sessionStorage.getItem('userRole')
    });
    
    // Clear all authentication data
    localStorage.removeItem('token');
    sessionStorage.removeItem('userAuthenticated');
    sessionStorage.removeItem('lastActivity');
    sessionStorage.removeItem('userRole');
    
    // Clear the cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    
    // Verify data is cleared
    console.log("Auth state after logout:", {
      token: !!localStorage.getItem('token'),
      cookieToken: document.cookie.includes('token='),
      isAuthenticated: sessionStorage.getItem('userAuthenticated'),
      lastActivity: sessionStorage.getItem('lastActivity'),
      userRole: sessionStorage.getItem('userRole')
    });
    
    console.log("All authentication data cleared, redirecting to login");
    window.location.href = '/login';
  };
  
  // Function to calculate application progress percentage
  const calculateProgress = () => {
    let steps = 3;
    let completed = 0;
    if (clientInfo?.user?.email) completed++;
    if (clientInfo?.creditReportCompleted) completed++;
    if (clientInfo?.documentsSigned) completed++;
    return Math.round((completed / steps) * 100);
  };
  
  // Sidebar navigation items
  const sidebarItems = [
    { id: "dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { id: "documents", icon: <FileText className="h-5 w-5" />, label: "Documents" },
    { id: "funding", icon: <DollarSign className="h-5 w-5" />, label: "Funding" },
    { id: "profile", icon: <User className="h-5 w-5" />, label: "Profile" },
    { id: "settings", icon: <Settings className="h-5 w-5" />, label: "Settings" }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside 
        className={`${sidebarExpanded ? 'w-64' : 'w-20'} bg-white border-r border-gray-100 shadow-sm h-screen sticky top-0 z-50 hidden lg:flex lg:flex-col transition-all duration-300`}
        initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`flex ${sidebarExpanded ? 'justify-between px-5' : 'justify-center'} py-6`}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {sidebarExpanded && (
              <span className="ml-3 font-semibold text-gray-800">Dashboard</span>
            )}
          </div>
          
            <motion.button 
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${sidebarExpanded ? '' : 'rotate-180'}`}
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
            </motion.button>
        </div>
            
        <div className={`flex-1 flex flex-col ${sidebarExpanded ? 'items-start px-3' : 'items-center'} py-6 space-y-2`}>
          {sidebarItems.map((item) => (
            <motion.button 
              key={item.id}
              className={`${sidebarExpanded ? 'w-full justify-start px-4' : 'w-14 flex-col'} h-12 flex items-center rounded-xl text-sm transition-all ${
                activeSidebarItem === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveSidebarItem(item.id)}
              whileHover={sidebarExpanded ? { x: 3 } : { y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`${sidebarExpanded ? 'mr-3' : 'mb-1'} ${activeSidebarItem === item.id ? "text-blue-600" : ""}`}>
                {item.icon}
              </span>
              <span className={`${sidebarExpanded ? 'text-sm' : 'text-[10px]'} font-medium`}>{item.label}</span>
              {activeSidebarItem === item.id && (
                <motion.div
                  className={`${sidebarExpanded ? 'right-0 w-1 h-5' : 'bottom-0 w-1 h-1'} absolute bg-blue-500 rounded-full`}
                  layoutId="activeIndicatorDot"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        <div className={`pb-6 ${sidebarExpanded ? 'px-3' : 'flex justify-center'}`}>
          <motion.button
            className={`${sidebarExpanded ? 'w-full justify-start px-4' : 'w-14 flex-col'} h-12 flex items-center rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all`}
                onClick={handleLogout}
            whileHover={sidebarExpanded ? { x: 3 } : { y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={sidebarExpanded ? 'mr-3' : 'mb-1'}>
              <LogOut className="h-5 w-5" />
            </span>
            <span className={`${sidebarExpanded ? 'text-sm' : 'text-[10px]'} font-medium`}>Logout</span>
          </motion.button>
        </div>
      </motion.aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <motion.button 
            className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 text-gray-600"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
            </motion.button>
        </div>
      
      {/* Main content area */}
      <main className="flex-1 p-6 overflow-auto bg-gray-50/50">
        {/* Dashboard overview */}
        <div className="max-w-7xl mx-auto">
          {/* Stats overview */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {/* Application Status Card */}
              <motion.div 
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                    <Clock className="h-6 w-6 text-blue-600" />
            </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                   {clientInfo.fundingStatus}
                  </span>
              </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Application Status</h3>
                <div className="flex items-center mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2 mr-2 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                      initial={{ width: '0%' }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    ></motion.div>
            </div>
                  <span className="text-sm font-medium text-gray-500">{calculateProgress()}%</span>
        </div>
            </motion.div>
        
              {/* Funding Amount Card */}
            <motion.div
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
        </div>
                    </div>
                <p className="text-sm text-gray-500 mb-1">Requested Amount</p>
                <h3 className="text-2xl font-bold text-gray-800">{clientInfo?.loanAmount || '$0'}</h3>
              </motion.div>
      
              {/* Monthly Income Card */}
          <motion.div
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl">
                    <Wallet className="h-6 w-6 text-purple-600" />
            </div>
                    </div>
                <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
                <h3 className="text-2xl font-bold text-gray-800">{clientInfo?.monthlyIncome || '$0'}</h3>
            </motion.div>
            
              {/* Documents Card */}
            <motion.div
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-xl">
                    <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
                <p className="text-sm text-gray-500 mb-1">Documents</p>
                <h3 className="text-2xl font-bold text-gray-800">{documents?.length || 0}</h3>
              </motion.div>
          </motion.div>
        </div>
        
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left column - Application progress and personal info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Progress */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100/80">
                  <h2 className="font-semibold text-gray-800 flex items-center">
                    <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    Application Progress
                  </h2>
                  <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Progress steps */}
                    <div className="relative">
                      {/* Progress line */}
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                      
                      {/* Step 1 */}
                      <div className="relative flex items-start mb-8">
                        <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                          ${clientInfo?.user?.email ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {clientInfo?.user?.email ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <span className="text-xs font-medium">1</span>
                        )}
                    </div>
                        <div className="ml-4">
                          <h3 className={`text-base font-medium ${clientInfo?.user?.email ? 'text-green-700' : 'text-gray-700'}`}>
                            Registration Complete
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Your account has been created successfully.
                      </p>
                    </div>
                  </div>
                      
                      {/* Step 2 - Personal Information */}
                      <div className="relative flex items-start mb-8">
                        <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                          ${clientInfo?.address && clientInfo?.ssn ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {clientInfo?.address && clientInfo?.ssn ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <span className="text-xs font-medium">2</span>
                        )}
                      </div>
                        <div className="ml-4">
                          <h3 className={`text-base font-medium ${clientInfo?.address && clientInfo?.ssn ? 'text-green-700' : 'text-gray-700'}`}>
                            Personal Information
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {clientInfo?.address && clientInfo?.ssn ? 
                              'Your personal information has been submitted successfully.' : 
                              'Complete your profile with personal information.'}
                          </p>
                          {!(clientInfo?.address && clientInfo?.ssn) && (
                    <Button
                      variant="outline"
                      size="sm"
                              className="mt-3 text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
                      onClick={() => window.location.href = '/personal-info'}
                    >
                              Complete Profile
                    </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Step 3 - Credit Report */}
                      <div className="relative flex items-start mb-8">
                        <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                          ${clientInfo?.creditReportCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {clientInfo?.creditReportCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <span className="text-xs font-medium">3</span>
                        )}
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-base font-medium ${clientInfo?.creditReportCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                            Credit Report Submitted
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {clientInfo?.creditReportCompleted ? 
                              'Your credit report has been submitted and is under review.' : 
                              'Submit your credit report information to proceed.'}
                          </p>
                          {!clientInfo?.creditReportCompleted && !(clientInfo?.address && clientInfo?.ssn) && (
                            <p className="mt-1 text-xs text-amber-600">
                              Complete your personal information first
                            </p>
                          )}
                          {!clientInfo?.creditReportCompleted && (clientInfo?.address && clientInfo?.ssn) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
                              onClick={() => window.location.href = '/credit-report'}
                            >
                              Submit Now
                            </Button>
                          )}
                      </div>
                      </div>
                      
                      {/* Step 4 - Funding Agreement */}
                      <div className="relative flex items-start mb-8">
                        <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                          ${clientInfo?.documentsSigned ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {clientInfo?.documentsSigned ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <span className="text-xs font-medium">4</span>
                        )}
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-base font-medium ${clientInfo?.documentsSigned ? 'text-green-700' : 'text-gray-700'}`}>
                            Funding Agreement Signed
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {clientInfo?.documentsSigned ? 
                              'Your funding agreement has been signed successfully.' : 
                              'Sign your funding agreement to complete your application.'}
                        </p>
                      </div>
          </div>
          
                      {/* Step 5 */}
                      <div className="relative flex items-start">
                        <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-600 shadow-sm">
                          <span className="text-xs font-medium">5</span>
                    </div>
                        <div className="ml-4">
                          <h3 className="text-base font-medium text-blue-700">
                            Application Review
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Our team will review your application and get back to you shortly.
                          </p>
                    </div>
                  </div>
                      </div>
                  </div>
                      </div>
                    </motion.div>
                    
              {/* Personal Information */}
                    <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100/80">
                  <h2 className="font-semibold text-gray-800 flex items-center">
                    <div className="p-1.5 bg-indigo-100 rounded-lg mr-3">
                      <User className="h-4 w-4 text-indigo-600" />
                      </div>
                    Personal Information
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => window.location.href = '/personal-info'}
                  >
                    <Settings className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                      </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-blue-100/50 rounded-lg mr-2.5">
                          <User className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">{clientInfo?.user?.firstName} {clientInfo?.user?.lastName}</p>
                    </div>
                    
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-purple-100/50 rounded-lg mr-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                      </div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                  </div>
                      <p className="font-medium text-gray-900 pl-7">{clientInfo?.user?.email}</p>
                </div>
                    
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-green-100/50 rounded-lg mr-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                  </div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">{clientInfo?.phone || 'Not provided'}</p>
                    </div>
                    
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-amber-100/50 rounded-lg mr-2.5">
                          <Home className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">
                        {clientInfo?.address ? 
                          `${clientInfo?.address}, ${clientInfo?.city}, ${clientInfo?.state} ${clientInfo?.zip}` : 
                          'Not provided'}
                    </p>
                  </div>
                    
                    {/* Financial Info */}
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-emerald-100/50 rounded-lg mr-2.5">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                        <p className="text-sm font-medium text-gray-500">Funding Amount</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">
                        {clientInfo?.loanAmount ? 
                          `$${clientInfo.loanAmount}` : 
                          'Not specified'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-indigo-100/50 rounded-lg mr-2.5">
                          <Wallet className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">
                        {clientInfo?.monthlyIncome ? 
                          `$${clientInfo.monthlyIncome}` : 
                          'Not provided'}
                      </p>
                      </div>
                      
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-blue-100/50 rounded-lg mr-2.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">
                        {clientInfo?.dob ? 
                          new Date(clientInfo.dob).toLocaleDateString() : 
                          'Not provided'}
                      </p>
                      </div>
                      
                    <div className="bg-gray-50/70 p-4 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-red-100/50 rounded-lg mr-2.5">
                          <Home className="h-3.5 w-3.5 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Mortgage Status</p>
                      </div>
                      <p className="font-medium text-gray-900 pl-7">
                        {clientInfo?.hasMortgage === true ? 'Has Mortgage' : 
                         clientInfo?.hasMortgage === false ? 'No Mortgage' : 
                         'Not specified'}
                        </p>
                      </div>
                    </div>
              </div>
          </motion.div>
            </div>
          
            {/* Right column - Documents and funding details */}
            <div className="space-y-6">
              {/* Documents */}
          <motion.div
                initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100/80">
                  <h2 className="font-semibold text-gray-800 flex items-center">
                    <div className="p-1.5 bg-amber-100 rounded-lg mr-3">
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                  Documents
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    View All
                  </Button>
                </div>
                
                <div className="p-6">
                  {/* Funding Agreement Document (Always shown if document is signed) */}
                  {clientInfo?.documentsSigned && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Signed Agreement</h3>
                      <motion.div 
                        className="flex items-center justify-between p-3.5 bg-blue-50/70 rounded-xl hover:bg-blue-100/50 transition-all border border-blue-100/50"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-center">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Funding Agreement</p>
                            <p className="text-xs text-gray-500">
                              {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <motion.a
                          href="/api/documents/download/funding-agreement"
                          download="funding_agreement.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-100/50 rounded-lg flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Download className="h-4 w-4" />
                        </motion.a>
                      </motion.div>
                    </div>
                  )}
                  
                  {/* Other Documents */}
                  {clientInfo?.documentsSigned && <h3 className="text-sm font-medium text-gray-700 mb-3">Other Documents</h3>}
                  
                {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc, index) => (
                      <motion.div 
                        key={doc.id} 
                          className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-xl hover:bg-gray-100/80 transition-all"
                          initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + (index * 0.1) }}
                          whileHover={{ x: 2 }}
                      >
                        <div className="flex items-center">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                              <FileText className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                              <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                              <p className="text-xs text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                          
                        <motion.a
                          href={doc.downloadUrl || doc.cloudinaryUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                            className="p-2 text-amber-600 hover:bg-amber-100/50 rounded-lg flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Download className="h-4 w-4" />
                        </motion.a>
                      </motion.div>
                    ))}
                      
                      {documents.length > 3 && (
                        <div className="text-center pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50/50"
                          >
                            View {documents.length - 3} more documents
                          </Button>
                        </div>
                      )}
                  </div>
                ) : (
                    <div className={`py-8 text-center ${clientInfo?.documentsSigned ? '' : 'py-10'}`}>
                      <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full flex items-center justify-center mb-3 shadow-sm">
                        <FileText className="h-6 w-6 text-amber-500" />
                      </div>
                      <p className="text-gray-700 font-medium">No additional documents yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Documents will appear here once available
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Funding Details */}
                    <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="px-6 py-5 flex justify-between items-center border-b border-gray-100/80">
                  <h2 className="font-semibold text-gray-800 flex items-center">
                    <div className="p-1.5 bg-green-100 rounded-lg mr-3">
                      <Wallet className="h-4 w-4 text-green-600" />
                  </div>
                    Funding Details
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3.5 bg-gray-50/70 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Requested Amount</p>
                      </div>
                      <p className="font-semibold text-gray-900">{clientInfo?.loanAmount || '$0'}</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3.5 bg-gray-50/70 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Monthly Income</p>
                      </div>
                      <p className="font-semibold text-gray-900">{clientInfo?.monthlyIncome || '$0'}</p>
                    </div>
                    
                    <div className="flex justify-between items-center p-3.5 bg-gray-50/70 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                          <Home className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Has Mortgage</p>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {clientInfo?.hasMortgage ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                            <CheckCircle className="h-3 w-3 mr-1" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 shadow-sm">
                            No
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm"
                      onClick={() => window.location.href = '/funding-details'}
                    >
                      View Funding Details
                  </Button>
                  </div>
                </div>
                </motion.div>
              
              {/* Next Steps Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl flex items-center justify-center shadow-sm">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-800">Next Steps</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Our team is reviewing your application. You'll be notified once we have an update.
                      </p>
                      
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm"
                        >
                          Check Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
          </motion.div>
            </div>
          
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
