"use client";

import { motion } from "framer-motion";

interface FloatingElementsProps {
  variant?: "light" | "dark" | "blue" | "emerald" | "gold";
  density?: "low" | "medium" | "high";
}

export default function FloatingElements({
  variant = "light",
  density = "medium"
}: FloatingElementsProps) {
  // Determine number of elements based on density
  const getElementCount = () => {
    switch (density) {
      case "low": return 5;
      case "high": return 15;
      default: return 10;
    }
  };
  
  // Get colors based on variant
  const getColors = () => {
    switch (variant) {
      case "dark":
        return ["bg-gray-700/10", "bg-gray-800/10", "bg-gray-900/10"];
      case "blue":
        return ["bg-blue-300/10", "bg-blue-400/10", "bg-blue-500/10"];
      case "emerald":
        return ["bg-emerald-300/10", "bg-emerald-400/10", "bg-emerald-500/10"];
      case "gold":
        return ["bg-amber-200/10", "bg-amber-300/10", "bg-yellow-400/10"];
      default:
        return ["bg-gray-100/20", "bg-gray-200/20", "bg-gray-300/20"];
    }
  };
  
  const elementCount = getElementCount();
  const colors = getColors();
  
  // Generate random elements
  const elements = Array.from({ length: elementCount }).map((_, index) => {
    // Random position
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    
    // Random size (weighted toward smaller elements)
    const size = Math.random() * Math.random() * 300 + 50;
    
    // Random shape (circle or rounded square)
    const isCircle = Math.random() > 0.3;
    const borderRadius = isCircle ? "9999px" : `${Math.random() * 40 + 20}%`;
    
    // Random color from our palette
    const colorClass = colors[Math.floor(Math.random() * colors.length)];
    
    // Random animation parameters
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 10;
    const yMovement = Math.random() * 15 - 7.5;
    const xMovement = Math.random() * 15 - 7.5;
    
    return (
      <motion.div
        key={index}
        className={`absolute rounded-[${borderRadius}] ${colorClass} backdrop-blur-3xl`}
        style={{
          top,
          left,
          width: size,
          height: size,
          borderRadius,
          filter: `blur(${Math.random() * 50 + 20}px)`,
          opacity: Math.random() * 0.4 + 0.1,
        }}
        initial={{ scale: 0.8 }}
        animate={{
          y: [0, yMovement, 0],
          x: [0, xMovement, 0],
          scale: [0.8, Math.random() * 0.4 + 0.8, 0.8],
          opacity: [0.1, Math.random() * 0.2 + 0.2, 0.1],
        }}
        transition={{
          repeat: Infinity,
          duration,
          ease: "easeInOut",
          delay,
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {elements}
    </div>
  );
}
