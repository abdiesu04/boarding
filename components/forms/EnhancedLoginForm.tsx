"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedInput from "@/components/ui/EnhancedInput";
import EnhancedButton from "@/components/ui/EnhancedButton";
import AnimatedTypography from "@/components/ui/AnimatedTypography";
import toast from "react-hot-toast";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function EnhancedLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  
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
      
      // Decide target route by role
      const isAdmin = result?.user?.role === 'ADMIN' || result?.user?.role === 'SUPER_ADMIN';
      const targetRoute = isAdmin ? '/admin' : '/dashboard';

      // Debug info
      console.log('Login success, preparing to redirect with token:', {
        tokenExists: !!result.token,
        tokenInLocalStorage: !!localStorage.getItem('token'),
        tokenInCookie: cookieExists('token'),
        userAuthenticated: sessionStorage.getItem('userAuthenticated') === 'true',
        role: result?.user?.role,
        redirectingTo: targetRoute
      });
      
      // Show a message before redirecting
      toast.success(isAdmin ? "Welcome Admin! Redirecting to dashboard..." : "Login successful! Redirecting to your dashboard...");
      
      // Add a small delay to ensure toast is shown and cookies are set
      console.log("Starting redirection process...");
      setTimeout(() => {
        console.log("Final cookie check before redirect:");
        logAllCookies();
        
        console.log("Executing redirect now...", targetRoute);
        // IMPORTANT: Force a hard redirect to dashboard
        try {
          console.log("Redirect initiated with window.location.href to", targetRoute);
          window.location.href = targetRoute;
          
          // Fallback if the first redirect doesn't work
          setTimeout(() => {
            console.log("Fallback redirect with replace...");
            window.location.replace(targetRoute);
          }, 1000);
        } catch (e) {
          console.error("Redirect error:", e);
          alert("Redirect failed. Please click OK to try again.");
          window.location.href = targetRoute;
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

  return (
    <div className="flex flex-col md:flex-row items-center max-w-4xl mx-auto">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 p-4 md:pr-8 mb-6 md:mb-0 order-2 md:order-1">
        <GlassCard variant="blue">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              
              <p className="text-gray-600">
                Sign in to access your account
              </p>
            </div>
            
            <div className="space-y-6">
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
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <Link 
                    href="#" 
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <EnhancedInput
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  variant="blue"
                  error={errors.password?.message}
                  isValid={!!dirtyFields.password && !errors.password}
                  {...register("password")}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <EnhancedButton
                type="submit"
                variant="blue"
                isLoading={isLoading}
                className="w-full"
                iconLeft={<LogIn className="h-4 w-4" />}
              >
                Sign In
              </EnhancedButton>
              
              <div className="mt-6 text-center">
                <span className="text-gray-600 text-sm">Don't have an account?</span>{" "}
                <Link 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                >
                  Register now
                </Link>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
      
      {/* Right side - Decorative content */}
      <div className="w-full md:w-1/2 p-4 order-1 md:order-2">
        <div className="relative">
          {/* Decorative static elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 backdrop-blur-md" />
          
          <div className="absolute -bottom-5 -left-5 w-24 h-24 rounded-lg bg-blue-600/10 backdrop-blur-md" />
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl backdrop-blur-lg shadow-xl">
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-700">
              Premium Financial Services
            </h3>
            
            <p className="mb-6 text-gray-600">
              Access your account to manage your applications, track funding status, and explore new financial opportunities.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Secure Access</h3>
                  <p className="text-xs text-gray-500">Bank-level security with 256-bit encryption</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Real-time Updates</h3>
                  <p className="text-xs text-gray-500">Get instant notifications on application status</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Financial Dashboard</h3>
                  <p className="text-xs text-gray-500">Comprehensive view of your financial portfolio</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="mt-8 bg-white/80 backdrop-blur-sm p-4 rounded-xl">
              <p className="text-xs italic text-gray-600 mb-2">
                "The platform has completely transformed how we manage our business finances. The application process was seamless, and funding was approved within days."
              </p>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full mr-2"></div>
                <div>
                  <p className="text-xs font-medium">Sarah Johnson</p>
                  <p className="text-[10px] text-gray-500">CEO, Innovate Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
