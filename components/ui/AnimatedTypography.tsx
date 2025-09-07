"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedTypographyProps {
  children: ReactNode;
  variant?: "title" | "subtitle" | "heading" | "body";
  color?: "blue" | "gold" | "emerald" | "default";
  animation?: "fade" | "slide" | "reveal" | "none";
  delay?: number;
  className?: string;
}

export default function AnimatedTypography({
  children,
  variant = "body",
  color = "default",
  animation = "fade",
  delay = 0,
  className = ""
}: AnimatedTypographyProps) {
  // Get typography styles based on variant
  const getTypographyClasses = () => {
    switch (variant) {
      case "title":
        return "text-3xl md:text-4xl font-bold tracking-tight";
      case "subtitle":
        return "text-xl md:text-2xl font-medium";
      case "heading":
        return "text-lg md:text-xl font-semibold";
      case "body":
      default:
        return "text-base";
    }
  };
  
  // Get color styles based on color
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent";
      case "gold":
        return "bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent";
      case "emerald":
        return "bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent";
      case "default":
      default:
        return "text-gray-800";
    }
  };
  
  // Get animation variants based on animation type
  const getAnimationVariants = () => {
    switch (animation) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case "slide":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        };
      case "reveal":
        return {
          hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
          visible: { opacity: 1, clipPath: "inset(0 0% 0 0)" }
        };
      case "none":
      default:
        return {
          hidden: {},
          visible: {}
        };
    }
  };
  
  // Get transition based on animation type
  const getTransition = () => {
    switch (animation) {
      case "fade":
        return { duration: 0.6, delay };
      case "slide":
        return { 
          duration: 0.6, 
          delay, 
          type: "spring" as const, 
          stiffness: 100, 
          damping: 15 
        };
      case "reveal":
        return { duration: 0.8, delay, ease: "easeInOut" as const };
      case "none":
      default:
        return { duration: 0 };
    }
  };
  
  return (
    <motion.div
      className={`${getTypographyClasses()} ${getColorClasses()} ${className}`}
      initial="hidden"
      animate="visible"
      variants={getAnimationVariants()}
      transition={getTransition()}
    >
      {children}
    </motion.div>
  );
}
