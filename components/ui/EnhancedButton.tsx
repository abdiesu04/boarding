"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "blue" | "gold" | "emerald";
  isLoading?: boolean;
  size?: "sm" | "default" | "lg";
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  outlined?: boolean;
  glassmorphism?: boolean;
  rippleEffect?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    children, 
    variant = "blue", 
    isLoading = false, 
    size = "default", 
    iconLeft,
    iconRight,
    outlined = false,
    glassmorphism = false,
    rippleEffect = true,
    ...props 
  }, ref) => {
    // Get background gradient based on variant
    const getGradient = () => {
      if (outlined) return "transparent";
      
      if (glassmorphism) {
        return "white";
      }
      
      switch (variant) {
        case "blue":
          return "#3b82f6";
        case "gold":
          return "#f59e0b";
        case "emerald":
          return "#10b981";
        default:
          return "#3b82f6";
      }
    };
    
    // Get text color based on variant
    const getTextColor = () => {
      if (outlined) {
        switch (variant) {
          case "blue": return "text-blue-600";
          case "gold": return "text-amber-600";
          case "emerald": return "text-emerald-600";
          default: return "text-blue-600";
        }
      }
      
      if (glassmorphism) {
        switch (variant) {
          case "blue": return "text-blue-600";
          case "gold": return "text-amber-600";
          case "emerald": return "text-emerald-600";
          default: return "text-blue-600";
        }
      }
      
      switch (variant) {
        case "blue": return "text-white";
        case "gold": return "text-gray-900";
        case "emerald": return "text-white";
        default: return "text-white";
      }
    };
    
    // Get border color based on variant
    const getBorderColor = () => {
      if (!outlined) return "border-transparent";
      
      switch (variant) {
        case "blue": return "border-blue-200";
        case "gold": return "border-amber-200";
        case "emerald": return "border-emerald-200";
        default: return "border-blue-200";
      }
    };
    
    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case "sm": return "py-1.5 px-3 text-sm";
        case "lg": return "py-3 px-8 text-lg";
        default: return "py-2.5 px-6 text-base";
      }
    };
    
    // Get shadow color based on variant
    const getShadowColor = () => {
      return "rgba(0, 0, 0, 0.08)";
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          `relative overflow-hidden rounded-md font-medium ${getTextColor()} ${getBorderColor()} border
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400
          transition-all duration-200 ${getSizeClasses()}`,
          glassmorphism ? "bg-white/90" : "",
          isLoading ? "opacity-80 cursor-not-allowed" : "",
          className
        )}
        style={{
          background: getGradient(),
          boxShadow: `0 1px 3px ${getShadowColor()}`
        }}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Simple background */}
        {glassmorphism && (
          <div className="absolute inset-0 bg-white/90 rounded-md z-0" />
        )}
        
        {/* Button content */}
        <div className="relative flex items-center justify-center z-10">
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          
          {!isLoading && iconLeft && (
            <span className="mr-2">{iconLeft}</span>
          )}
          
          <span>{children}</span>
          
          {!isLoading && iconRight && (
            <span className="ml-2">{iconRight}</span>
          )}
        </div>
        
        {/* Subtle hover effect handled by CSS */}
      </button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export default EnhancedButton;
