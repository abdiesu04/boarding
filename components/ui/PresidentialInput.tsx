"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface PresidentialInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  variant?: "gold" | "blue" | "patriotic";
  label?: string;
}

const PresidentialInput = forwardRef<HTMLInputElement, PresidentialInputProps>(
  ({ className, type, icon: Icon, error, variant = "gold", label, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    // Get colors based on variant
    const getColors = () => {
      switch (variant) {
        case "gold":
          return {
            border: "border-amber-200",
            focusBorder: "border-amber-400",
            focusRing: "ring-amber-300",
            iconColor: "text-amber-500",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200"
          };
        case "blue":
          return {
            border: "border-blue-100",
            focusBorder: "border-blue-400",
            focusRing: "ring-blue-300",
            iconColor: "text-blue-500",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200"
          };
        case "patriotic":
          return {
            border: "border-slate-200",
            focusBorder: "border-blue-500",
            focusRing: "ring-red-200",
            iconColor: "text-blue-600",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200"
          };
        default:
          return {
            border: "border-amber-200",
            focusBorder: "border-amber-400",
            focusRing: "ring-amber-300",
            iconColor: "text-amber-500",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200"
          };
      }
    };
    
    const colors = getColors();
    
    return (
      <div className="relative w-full">
        {label && (
          <motion.label
            htmlFor={props.id}
            className={`block text-xs font-medium mb-1 ${
              error ? "text-red-500" : "text-gray-700"
            }`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {/* Icon */}
          {Icon && (
            <motion.div 
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${colors.iconColor} transition-all duration-200`}
              animate={{ 
                scale: isFocused ? 1.1 : 1,
                x: isFocused ? 1 : 0
              }}
            >
              <Icon size={16} />
            </motion.div>
          )}
          
          {/* Input */}
          <input
            type={type}
            className={cn(
              `flex h-10 w-full rounded-lg ${colors.border} bg-white/80 backdrop-blur-sm px-3 py-2 text-sm 
              placeholder:text-gray-400 focus:outline-none focus:ring-2 ${colors.focusRing} focus:ring-opacity-50 
              focus:${colors.focusBorder} transition-all duration-300 shadow-sm`,
              Icon ? "pl-9" : "",
              error ? `${colors.errorBorder} focus:${colors.errorRing}` : "",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {/* Focus effect */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: `linear-gradient(to right, ${
                  variant === "gold" ? "rgba(255, 215, 0, 0.1)" : 
                  variant === "blue" ? "rgba(62, 146, 204, 0.1)" : 
                  "rgba(255, 255, 255, 0.1)"
                }, transparent)`,
                boxShadow: `0 0 15px ${
                  variant === "gold" ? "rgba(255, 215, 0, 0.2)" : 
                  variant === "blue" ? "rgba(62, 146, 204, 0.2)" : 
                  "rgba(255, 255, 255, 0.2)"
                }`
              }}
            />
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1 pl-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

PresidentialInput.displayName = "PresidentialInput";

export default PresidentialInput;

