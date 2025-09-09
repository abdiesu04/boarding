"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FloatingElementsProps {
  variant?: "light" | "dark" | "blue" | "emerald" | "gold";
  density?: "low" | "medium" | "high";
}

interface ElementConfig {
  top: string;
  left: string;
  size: number;
  borderRadius: string;
  colorClass: string;
  duration: number;
  delay: number;
  yMovement: number;
  xMovement: number;
  blur: number;
  opacity: number;
  scaleAnimation: number;
  opacityAnimation: number;
}

export default function FloatingElements({
  variant = "light",
  density = "medium"
}: FloatingElementsProps) {
  const [elements, setElements] = useState<ElementConfig[]>([]);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    
    const elementCount = getElementCount();
    const colors = getColors();
    
    // Generate random elements on client side only
    const generatedElements = Array.from({ length: elementCount }).map(() => {
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
      const blur = Math.random() * 50 + 20;
      const opacity = Math.random() * 0.4 + 0.1;
      const scaleAnimation = Math.random() * 0.4 + 0.8;
      const opacityAnimation = Math.random() * 0.2 + 0.2;
      
      return {
        top,
        left,
        size,
        borderRadius,
        colorClass,
        duration,
        delay,
        yMovement,
        xMovement,
        blur,
        opacity,
        scaleAnimation,
        opacityAnimation,
      };
    });
    
    setElements(generatedElements);
  }, [variant, density]);

  // Don't render anything during SSR to avoid hydration mismatch
  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.colorClass} backdrop-blur-3xl`}
          style={{
            top: element.top,
            left: element.left,
            width: element.size,
            height: element.size,
            borderRadius: element.borderRadius,
            filter: `blur(${element.blur}px)`,
            opacity: element.opacity,
          }}
          initial={{ scale: 0.8 }}
          animate={{
            y: [0, element.yMovement, 0],
            x: [0, element.xMovement, 0],
            scale: [0.8, element.scaleAnimation, 0.8],
            opacity: [0.1, element.opacityAnimation, 0.1],
          }}
          transition={{
            repeat: Infinity,
            duration: element.duration,
            ease: "easeInOut",
            delay: element.delay,
          }}
        />
      ))}
    </div>
  );
}
