"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  variant?: "blue" | "gold" | "emerald";
  className?: string;
  intensity?: number;
  hoverEffect?: boolean;
  glareEffect?: boolean;
}

export default function GlassCard({
  children,
  variant = "blue",
  className = "",
  intensity = 1,
  hoverEffect = true,
  glareEffect = true
}: GlassCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // Get border gradient based on variant
  const getBorderGradient = () => {
    switch (variant) {
      case "blue":
        return "linear-gradient(to right, rgba(219, 234, 254, 1) 0%, rgba(191, 219, 254, 1) 50%, rgba(219, 234, 254, 1) 100%)";
      case "gold":
        return "linear-gradient(to right, rgba(254, 243, 199, 1) 0%, rgba(253, 230, 138, 1) 50%, rgba(254, 243, 199, 1) 100%)";
      case "emerald":
        return "linear-gradient(to right, rgba(209, 250, 229, 1) 0%, rgba(167, 243, 208, 1) 50%, rgba(209, 250, 229, 1) 100%)";
      default:
        return "linear-gradient(to right, rgba(219, 234, 254, 1) 0%, rgba(191, 219, 254, 1) 50%, rgba(219, 234, 254, 1) 100%)";
    }
  };
  
  // Get glass background style based on variant
  const getGlassBackground = () => {
    return "white";
  };
  
  // Get shadow color based on variant
  const getShadowColor = () => {
    return "rgba(0, 0, 0, 0.08)";
  };
  
  // Handle mouse movement for glare effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!glareEffect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const card = document.getElementById("glass-card");
      if (card) {
        setDimensions({
          width: card.offsetWidth,
          height: card.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  
  return (
    <div
      id="glass-card"
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      {/* Subtle border */}
      <div 
        className="absolute -inset-[1px] rounded-xl"
        style={{ background: getBorderGradient() }}
      />
      
      {/* Card content */}
      <div 
        className="relative rounded-xl overflow-hidden"
        style={{ 
          background: "white",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Subtle top highlight */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-50" />
          
          {/* Subtle glare effect */}
          {glareEffect && (
            <div
              className="absolute -inset-full opacity-10"
              style={{
                top: isHovering ? `${mousePosition.y * 100}%` : "50%",
                left: isHovering ? `${mousePosition.x * 100}%` : "50%",
                background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)",
                width: "200%",
                height: "200%",
                transform: "translate(-50%, -50%)",
                transition: "top 0.5s ease, left 0.5s ease"
              }}
            />
          )}
        </div>
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
