import { Mail, Lock, LogIn, AlertCircle, Link } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EnhancedInput from "@/components/ui/EnhancedInput";
import EnhancedButton from "@/components/ui/EnhancedButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
type LoginFormData = z.infer<typeof loginSchema>;
export default function LoginForm() {
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
            
            const isAdmin = result?.user?.role === 'ADMIN';
            const targetRoute = isAdmin ? '/admin' : '/dashboard';
            // Debug info
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
            console.log('Login success, preparing to redirect with token:', {
              tokenExists: !!result.token,
              tokenInLocalStorage: !!localStorage.getItem('token'),
              tokenInCookie: cookieExists('token'),
              userAuthenticated: sessionStorage.getItem('userAuthenticated') === 'true',
              redirectingTo: targetRoute
            });
            
            // Show a message before redirecting
            toast.success(isAdmin ? "Welcome Admin! Redirecting to Admin Page..." : "Login successful! Redirecting to your dashboard...");
     
            
            // Add a small delay to ensure toast is shown and cookies are set
            console.log("Starting redirection process...");
            setTimeout(() => {
              console.log("Final cookie check before redirect:");
              logAllCookies();
              
              console.log("Executing redirect to dashboard now...");
              // IMPORTANT: Force a hard redirect to dashboard
              try {
                console.log("Redirect initiated with window.location.href to /dashboard");
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
      
      // Check if user is already logged in and redirect to dashboard
      useEffect(() => {
        // Check for authentication token
        const token = localStorage.getItem('token');
        const isAuthenticated = sessionStorage.getItem('userAuthenticated');
        const lastActivity = sessionStorage.getItem('lastActivity');
        const role = sessionStorage.getItem('userRole');
        const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
        const targetRoute = isAdmin ? '/admin' : '/dashboard';
                
        
        // If we have a token and authentication, redirect to dashboard
        if (token && isAuthenticated === 'true') {
          console.log('User already logged in, redirecting to dashboard');
          window.location.replace(targetRoute);
        }
      }, []);
  return (
    <div className="w-full p-4 md:pr-8 mb-6 md:mb-0 order-2 md:order-1">
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
                    href="/register" 
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                >
                    Register now
                </Link>
                </div>
            </div>
            </form>
        </GlassCard>
        </div>
    );
}