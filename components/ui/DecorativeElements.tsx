"use client";

import { motion } from "framer-motion";

interface DecorativeElementsProps {
  variant?: "default" | "blue" | "emerald" | "gold";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "all";
}

export default function DecorativeElements({
  variant = "default",
  position = "all",
}: DecorativeElementsProps) {
  // Get gradient colors based on variant
  const getGradient = () => {
    switch (variant) {
      case "blue":
        return "from-blue-300/20 via-blue-500/10 to-blue-700/5";
      case "emerald":
        return "from-emerald-300/20 via-emerald-500/10 to-emerald-700/5";
      case "gold":
        return "from-amber-200/20 via-yellow-500/10 to-amber-700/5";
      default:
        return "from-gray-200/20 via-gray-300/10 to-gray-400/5";
    }
  };

  // Determine which corners to render elements in
  const shouldRenderIn = (corner: string) => {
    if (position === "all") return true;
    return position === corner;
  };

  const gradient = getGradient();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Top left corner */}
      {shouldRenderIn("top-left") && (
        <motion.div
          className={`absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br ${gradient} rounded-full opacity-80 blur-3xl`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0, 0.8, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Top right corner */}
      {shouldRenderIn("top-right") && (
        <motion.div
          className={`absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-bl ${gradient} rounded-full opacity-70 blur-2xl`}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ 
            scale: [0.7, 1.1, 0.7],
            opacity: [0, 0.7, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      )}

      {/* Bottom left corner */}
      {shouldRenderIn("bottom-left") && (
        <motion.div
          className={`absolute -bottom-30 -left-30 w-70 h-70 bg-gradient-to-tr ${gradient} rounded-full opacity-60 blur-3xl`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ 
            scale: [0.6, 1, 0.6],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      )}

      {/* Bottom right corner */}
      {shouldRenderIn("bottom-right") && (
        <motion.div
          className={`absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tl ${gradient} rounded-full opacity-50 blur-3xl`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [0.5, 0.9, 0.5],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "easeInOut",
            delay: 8,
          }}
        />
      )}

      {/* Center accent (subtle) */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-1/2 opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle, ${variant === "blue" ? "rgba(59, 130, 246, 0.2)" : 
                                               variant === "emerald" ? "rgba(16, 185, 129, 0.2)" :
                                               variant === "gold" ? "rgba(245, 158, 11, 0.2)" :
                                               "rgba(156, 163, 175, 0.2)"} 0%, transparent 70%)`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
