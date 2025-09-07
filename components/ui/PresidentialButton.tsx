"use client";

import { ReactNode, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface PresidentialButtonProps extends Omit<HTMLMotionProps<"button">, "whileHover" | "whileTap"> {
  children: ReactNode;
  variant?: "gold" | "blue" | "patriotic";
  isLoading?: boolean;
  size?: "sm" | "default" | "lg";
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  outlined?: boolean;
}

const PresidentialButton = forwardRef<HTMLButtonElement, PresidentialButtonProps>(
  ({ 
    className, 
    children, 
    variant = "gold", 
    isLoading = false, 
    size = "default", 
    iconLeft,
    iconRight,
    outlined = false,
    ...props 
  }, ref) => {
    // Get background gradient based on variant
    const getGradient = () => {
      if (outlined) return "transparent";
      
      switch (variant) {
        case "gold":
          return "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)";
        case "blue":
          return "linear-gradient(135deg, #0A2463 0%, #3E92CC 50%, #0A2463 100%)";
        case "patriotic":
          return "linear-gradient(135deg, #B22234 0%, #3C3B6E 100%)";
        default:
          return "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)";
      }
    };
    
    // Get text color based on variant
    const getTextColor = () => {
      if (outlined) {
        switch (variant) {
          case "gold": return "text-amber-700";
          case "blue": return "text-blue-700";
          case "patriotic": return "text-blue-800";
          default: return "text-amber-700";
        }
      }
      
      switch (variant) {
        case "gold": return "text-gray-900";
        case "blue": return "text-white";
        case "patriotic": return "text-white";
        default: return "text-gray-900";
      }
    };
    
    // Get border color based on variant
    const getBorderColor = () => {
      if (!outlined) return "border-transparent";
      
      switch (variant) {
        case "gold": return "border-amber-400";
        case "blue": return "border-blue-400";
        case "patriotic": return "border-blue-500";
        default: return "border-amber-400";
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
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          `relative overflow-hidden rounded-lg font-medium ${getTextColor()} ${getBorderColor()} border-2
          shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
          transition-all duration-300 ${getSizeClasses()}`,
          isLoading ? "opacity-80 cursor-not-allowed" : "",
          className
        )}
        style={{
          background: getGradient(),
          backgroundSize: "200% 200%",
        }}
        disabled={isLoading || props.disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Background animation */}
        {!outlined && (
          <motion.div 
            className="absolute inset-0"
            style={{
              background: getGradient(),
              backgroundSize: "200% 200%",
              zIndex: -1
            }}
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        {/* Button content */}
        <div className="relative flex items-center justify-center">
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
        
        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            background: `radial-gradient(circle at center, ${
              variant === "gold" ? "rgba(255, 255, 255, 0.3)" : 
              variant === "blue" ? "rgba(255, 255, 255, 0.2)" : 
              "rgba(255, 255, 255, 0.2)"
            }, transparent)`,
          }}
        />
      </motion.button>
    );
  }
);

PresidentialButton.displayName = "PresidentialButton";

export default PresidentialButton;

