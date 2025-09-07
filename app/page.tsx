"use client";
import toast from "react-hot-toast";
import Link from "next/link";
import SimpleRegisterForm from "@/components/forms/SimpleRegisterForm";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star, ArrowRight, ChevronRight } from "lucide-react";
import LuxuryBackground from "@/components/ui/LuxuryBackground";
import FloatingElements from "@/components/ui/FloatingElements";
import DecorativeElements from "@/components/ui/DecorativeElements";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedInput from "@/components/ui/EnhancedInput";
import EnhancedButton from "@/components/ui/EnhancedButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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
      // Debug info
      console.log('Login success, preparing to redirect with token:', {
        tokenExists: !!result.token,
        tokenInLocalStorage: !!localStorage.getItem('token'),
        tokenInCookie: cookieExists('token'),
        userAuthenticated: sessionStorage.getItem('userAuthenticated') === 'true',
        redirectingTo: '/dashboard'
      });
      // Show a message before redirecting
      toast.success("Login successful! Redirecting to dashboard...");
      // Add a small delay to ensure toast is shown and cookies are set
      console.log("Starting redirection process...");
      setTimeout(() => {
        console.log("Final cookie check before redirect:");
        logAllCookies();
        console.log("Executing redirect to dashboard now...");
        // IMPORTANT: Force a hard redirect to dashboard
        try {
          console.log("Redirect initiated with window.location.href to /dashboard");
          window.location.href = '/dashboard';
          // Fallback if the first redirect doesn't work
          setTimeout(() => {
            console.log("Fallback redirect with replace...");
            window.location.replace('/dashboard');
          }, 1000);
        } catch (e) {
          console.error("Redirect error:", e);
          alert("Redirect failed. Please click OK to try again.");
          window.location.href = '/dashboard';
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

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    // Check for authentication token
    const token = localStorage.getItem('token');
    const isAuthenticated = sessionStorage.getItem('userAuthenticated');
    const lastActivity = sessionStorage.getItem('lastActivity');
    // If we have a token and authentication, redirect to dashboard
    if (token && isAuthenticated === 'true') {
      console.log('User already logged in, redirecting to dashboard');
      window.location.replace('/dashboard');
    }
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center overflow-hidden">
        {/* Premium Background Elements */}
        <LuxuryBackground variant="gold" intensity="subtle" />
        <FloatingElements variant="gold" density="medium" />
        <DecorativeElements variant="gold" position="all" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-5">
                <motion.h1 
                  className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  Financial Solutions<br />
                  <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                    Designed for You
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="max-w-xl text-base text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Start your funding journey with a trusted financial partner. 
                  We provide personalized solutions to help you achieve your financial goals.
                </motion.p>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="group inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500 rounded-md shadow-md hover:shadow-lg transition-all hover:brightness-105"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link 
                  href="#services" 
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all"
                >
                  Learn More
                </Link>
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <div className="flex items-center">
                  <div className="flex -space-x-2 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="inline-block h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-500"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-500">Trusted by thousands</span>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="ml-3 text-sm text-gray-500">5.0 rating</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="w-full p-4 md:pr-8 mb-6 md:mb-0 order-2 md:order-1">
                {showRegister ? (
                  <SimpleRegisterForm />
                ) : (
                  <GlassCard variant="blue">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r  from-emerald-500 to-blue-500 bg-clip-text text-transparent ">
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
                          
                          <EnhancedInput
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            variant="blue"
                            error={errors.password?.message}
                            isValid={!!dirtyFields.password && !errors.password}
                            {...register("password")}
                          />
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                              
                            </label>
                            <a 
                              href="#" 
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Forgot password?
                            </a>
                          </div>
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
                          <button
                            type="button"
                            onClick={() => setShowRegister(true)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                          >
                            Register now
                          </button>
                        </div>
                      </div>
                    </form>
                  </GlassCard>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-emerald-600 font-semibold text-sm uppercase tracking-wide"
            >
              Our Services
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              Financial Solutions That Work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-lg text-gray-600"
            >
              We offer a wide range of financial products designed to meet your unique needs and goals.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Personal Loans",
                description: "Get the funds you need with flexible terms and competitive rates.",
                icon: "💰"
              },
              {
                title: "Business Funding",
                description: "Grow your business with capital solutions designed for entrepreneurs.",
                icon: "🏢"
              },
              {
                title: "Mortgage Solutions",
                description: "Find the perfect home loan to make your dream home a reality.",
                icon: "🏠"
              },
              {
                title: "Financial Planning",
                description: "Create a personalized roadmap to achieve your financial goals.",
                icon: "📈"
              },
              {
                title: "Investment Advice",
                description: "Expert guidance to grow your wealth and secure your future.",
                icon: "📊"
              },
              {
                title: "Debt Consolidation",
                description: "Simplify your finances and potentially save with a single payment.",
                icon: "📝"
              }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <Link 
                  href="#" 
                  className="inline-flex items-center mt-4 text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Learn more 
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-emerald-600 font-semibold text-sm uppercase tracking-wide"
            >
              Simple Process
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-lg text-gray-600"
            >
              We've made the process quick and easy, so you can get the funding you need without the hassle.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Complete Registration",
                description: "Fill out our simple online form with your personal and financial information."
              },
              {
                step: "2",
                title: "Get Your Offer",
                description: "We'll review your application and present you with funding options within hours."
              },
              {
                step: "3",
                title: "Receive Your Funds",
                description: "Accept your offer and have funds deposited directly into your account."
              }
            ].map((step, index) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="relative"
              >
                <div className="absolute top-0 left-0 -mt-2 -ml-2 bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div className="bg-white p-8 pt-12 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 text-gray-300">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500 rounded-md shadow-md hover:shadow-lg transition-all hover:brightness-105"
            >
              Start Your Application
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-emerald-600 font-semibold text-sm uppercase tracking-wide"
            >
              Client Stories
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl"
            >
              What Our Clients Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-lg text-gray-600"
            >
              Don't just take our word for it. See what our clients have to say about their experience.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                title: "Small Business Owner",
                quote: "The business funding I received helped me expand my store and increase revenue by 40%. The process was quick and the terms were better than any other lender."
              },
              {
                name: "Michael Rodriguez",
                title: "First-time Homebuyer",
                quote: "As a first-time homebuyer, I was nervous about getting a mortgage. The team made it easy to understand and helped me find the perfect loan for my situation."
              },
              {
                name: "Jennifer Lee",
                title: "Financial Freedom Seeker",
                quote: "The debt consolidation loan simplified my finances and saved me over $200 per month. I'm now on track to be debt-free in half the time I expected."
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="bg-gray-50 p-8 rounded-xl relative"
              >
                <div className="absolute top-8 right-8 text-emerald-500">
                  <svg width="45" height="36" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27C20.9558 27 27 20.9558 27 13.5C27 6.04416 20.9558 0 13.5 0ZM40.5 0C33.0442 0 27 6.04416 27 13.5C27 20.9558 33.0442 27 40.5 27C42.6442 27 44.6558 26.4973 46.4413 25.6048C44.7952 29.4202 41.9385 32.4923 38.25 34.3845V36H40.5C47.9558 36 54 29.9558 54 22.5V13.5C54 6.04416 47.9558 0 40.5 0Z" fill="currentColor" fillOpacity="0.2"/>
                  </svg>
                </div>
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-emerald-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold sm:text-4xl"
            >
              Ready to Start Your Financial Journey?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg opacity-90"
            >
              Join thousands of satisfied clients who have found the financial solution that's right for them.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md shadow-lg bg-white text-emerald-600 hover:bg-gray-50 transition-all"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="#contact" 
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md bg-emerald-700/30 hover:bg-emerald-700/40 transition-all border border-white/20"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}