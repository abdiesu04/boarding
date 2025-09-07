"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PresidentialCardProps {
  children: ReactNode;
  variant?: "gold" | "blue" | "patriotic";
  className?: string;
}

export default function PresidentialCard({ 
  children, 
  variant = "gold",
  className = ""
}: PresidentialCardProps) {
  // Get border gradient based on variant
  const getBorderGradient = () => {
    switch (variant) {
      case "gold":
        return "linear-gradient(135deg, #D4AF37 0%, #FFD700 25%, #FFF8DC 50%, #FFD700 75%, #D4AF37 100%)";
      case "blue":
        return "linear-gradient(135deg, #0A2463 0%, #3E92CC 50%, #D8E1E9 75%, #3E92CC 100%)";
      case "patriotic":
        return "linear-gradient(135deg, #B22234 0%, #FFFFFF 33%, #3C3B6E 66%, #FFFFFF 100%)";
      default:
        return "linear-gradient(135deg, #D4AF37 0%, #FFD700 25%, #FFF8DC 50%, #FFD700 75%, #D4AF37 100%)";
    }
  };
  
  // Get background style based on variant
  const getBackgroundStyle = () => {
    switch (variant) {
      case "gold":
        return "bg-gradient-to-b from-white via-white to-amber-50";
      case "blue":
        return "bg-gradient-to-b from-white via-white to-blue-50";
      case "patriotic":
        return "bg-gradient-to-b from-white via-white to-slate-50";
      default:
        return "bg-gradient-to-b from-white via-white to-amber-50";
    }
  };
  
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Border effect */}
      <div 
        className="absolute -inset-[2px] rounded-3xl blur-[2px]"
        style={{ background: getBorderGradient(), backgroundSize: "200% 200%" }}
      >
        <motion.div
          className="w-full h-full"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ background: getBorderGradient(), backgroundSize: "200% 200%" }}
        />
      </div>
      
      {/* Main card */}
      <div className={`relative rounded-3xl ${getBackgroundStyle()} backdrop-blur-md shadow-xl overflow-hidden`}>
        {/* Inner highlight effect */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -inset-[100%] opacity-10"
            animate={{
              top: ["100%", "-100%"],
              left: ["100%", "-100%"]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 50%)",
              width: "200%",
              height: "200%"
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

