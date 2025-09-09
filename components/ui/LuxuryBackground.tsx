"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LuxuryBackgroundProps {
  variant?: "default" | "blue" | "emerald" | "gold";
  intensity?: "subtle" | "medium" | "high";
  animated?: boolean;
}

export default function LuxuryBackground({
  variant = "default",
  intensity = "medium",
  animated = true,
}: LuxuryBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  
  // Get colors based on variant
  const getColors = () => {
    switch (variant) {
      case "blue":
        return {
          primary: "rgba(37, 99, 235, 0.8)",
          secondary: "rgba(59, 130, 246, 0.4)",
          accent: "rgba(96, 165, 250, 0.2)",
          highlight: "rgba(147, 197, 253, 0.1)"
        };
      case "emerald":
        return {
          primary: "rgba(5, 150, 105, 0.8)",
          secondary: "rgba(16, 185, 129, 0.4)",
          accent: "rgba(52, 211, 153, 0.2)",
          highlight: "rgba(110, 231, 183, 0.1)"
        };
      case "gold":
        return {
          primary: "rgba(217, 119, 6, 0.8)",
          secondary: "rgba(245, 158, 11, 0.4)",
          accent: "rgba(252, 211, 77, 0.2)",
          highlight: "rgba(254, 240, 138, 0.1)"
        };
      default:
        return {
          primary: "rgba(17, 24, 39, 0.03)",
          secondary: "rgba(55, 65, 81, 0.04)",
          accent: "rgba(107, 114, 128, 0.03)",
          highlight: "rgba(156, 163, 175, 0.02)"
        };
    }
  };
  
  // Get opacity based on intensity
  const getOpacity = () => {
    switch (intensity) {
      case "subtle": return 0.4;
      case "high": return 1;
      default: return 0.7;
    }
  };

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const colors = getColors();
    const opacity = getOpacity();
    
    // Create gradient background
    const createGradient = () => {
      // Base gradient
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.3,
        0,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
      );
      
      gradient.addColorStop(0, colors.highlight);
      gradient.addColorStop(0.4, colors.accent);
      gradient.addColorStop(0.8, colors.secondary);
      gradient.addColorStop(1, colors.primary);
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = opacity;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    // Create soft shapes
    const createShapes = () => {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 300 + 100;
        
        const gradient = ctx.createRadialGradient(
          x, y, 0, x, y, radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.03 * opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Create noise texture
    const createNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 5;
        data[i] = noise;
        data[i+1] = noise;
        data[i+2] = noise;
        data[i+3] = noise * opacity * 10;
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
    
    // Draw luxury pattern
    const drawPattern = () => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * opacity})`;
      ctx.lineWidth = 0.5;
      
      // Grid pattern
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };
    
    // Initial render
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      createGradient();
      createShapes();
      drawPattern();
      if (variant === "default") {
        createNoise();
      }
    };
    
    render();
    
    // Animation loop
    let animationId: number;
    
    if (animated) {
      const animate = () => {
        render();
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [dimensions, variant, intensity, animated, mounted]);

  // Don't render during SSR to avoid hydration mismatch
  if (!mounted) {
    return <div className="absolute inset-0 -z-10 overflow-hidden" />;
  }

  return (
    <motion.div
      className="absolute inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5" />
    </motion.div>
  );
}
