"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
  variant?: "blue" | "gold" | "emerald";
  label?: string;
  helperText?: string;
  isValid?: boolean;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type, 
    icon: Icon, 
    error, 
    variant = "blue", 
    label, 
    helperText,
    isValid,
    ...props 
  }, ref) => {

  // Track focus only from user interaction
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

    // Get colors based on variant
    const getColors = () => {
      switch (variant) {
        case "blue":
          return {
            border: "border-blue-100",
            focusBorder: "border-blue-400",
            focusRing: "ring-blue-300",
            iconColor: "text-blue-500",
            labelColor: "text-blue-600",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200",
            validBorder: "border-green-300",
            validRing: "ring-green-200"
          };
        case "gold":
          return {
            border: "border-amber-100",
            focusBorder: "border-amber-400",
            focusRing: "ring-amber-300",
            iconColor: "text-amber-500",
            labelColor: "text-amber-600",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200",
            validBorder: "border-green-300",
            validRing: "ring-green-200"
          };
        case "emerald":
          return {
            border: "border-emerald-100",
            focusBorder: "border-emerald-400",
            focusRing: "ring-emerald-300",
            iconColor: "text-emerald-500",
            labelColor: "text-emerald-600",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200",
            validBorder: "border-green-300",
            validRing: "ring-green-200"
          };
        default:
          return {
            border: "border-blue-100",
            focusBorder: "border-blue-400",
            focusRing: "ring-blue-300",
            iconColor: "text-blue-500",
            labelColor: "text-blue-600",
            errorBorder: "border-red-300",
            errorRing: "ring-red-200",
            validBorder: "border-green-300",
            validRing: "ring-green-200"
          };
      }
    };
    
    const colors = getColors();
    
    // Handle input change to track if input has value
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      // SSN mask: only allow digits, auto-insert dashes at 3 and 5
      if (props.id === 'ssn') {
        value = value.replace(/[^\d]/g, ''); // Remove non-digits
        if (value.length > 9) value = value.slice(0, 9);
        if (value.length > 5) value = value.replace(/(\d{3})(\d{2})(\d{0,4})/, '$1-$2-$3');
        else if (value.length > 3) value = value.replace(/(\d{3})(\d{0,2})/, '$1-$2');
        // Set value directly for controlled input
        if (e.target.value !== value) {
          // Create a synthetic event to pass to react-hook-form
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          nativeInputValueSetter?.call(e.target, value);
          const ev2 = new Event('input', { bubbles: true });
          e.target.dispatchEvent(ev2);
        }
      }
      setHasValue(!!value);
      if (props.onChange) {
        props.onChange(e);
      }
    };
    

  // Always show floating label above input, and show placeholder if no value
  const showFloatingLabel = true;
  const showPlaceholder = !hasValue;

    return (
      <div className="relative w-full">
        {/* Floating label: only show when focused by user or has value */}
        {label && (
          <motion.label
            htmlFor={props.id}
            className={`absolute left-5 pointer-events-none font-medium transition-all duration-200 ${
              error ? "text-red-500" : 
              isValid ? "text-green-500" : 
              colors.labelColor
            }`}
            initial={{
              top: '0.7rem',
              fontSize: '0.875rem',
              opacity: 0
            }}
            animate={{
              top: '-0.6rem',
              fontSize: '0.75rem',
              backgroundColor: '#fff',
              padding: '0 0.25rem',
              zIndex: 10,
              opacity: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.18 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {/* Icon */}
          {Icon && (
            <motion.div 
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                error ? "text-red-500" : 
                isValid ? "text-green-500" : 
                colors.iconColor
              }`}
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
              `flex h-10 w-full rounded-md border-slate-200 bg-white px-3 py-2 text-sm 
              placeholder:text-slate-400 focus:outline-none focus:ring-1 ring-blue-100 focus:ring-opacity-100 
              focus:border-blue-400 transition-all duration-200`,
              Icon ? "pl-9" : "pl-3",
              error ? "border-red-200 focus:ring-red-100 focus:border-red-400" : "",
              isValid ? "border-green-200 focus:ring-green-100 focus:border-green-400" : "",
              className
            )}
            ref={ref}
            onFocus={e => {
              setIsFocused(true);
              setHasUserInteracted(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            onChange={handleInputChange}
            placeholder={showPlaceholder ? props.placeholder : ''}
            {...props}
          />
          {/* Status icons removed as requested */}
        </div>
        {/* Helper text or error message */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p 
              key="error"
              initial={{ opacity: 0, y: -5, x: 0 }} 
              animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ 
                opacity: { duration: 0.2 },
                x: { duration: 0.4 }
              }}
              className="text-xs text-red-500 mt-1 pl-1"
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-gray-500 mt-1 pl-1"
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export default EnhancedInput;
