"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface EnhancedBackgroundProps {
  variant?: "blue" | "gold" | "emerald";
  intensity?: number;
  density?: "low" | "medium" | "high";
}

export default function EnhancedBackground({
  variant = "blue",
  intensity = 1,
  density = "medium"
}: EnhancedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  // Handle window resize
  useEffect(() => {
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
  
  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Get colors based on variant
    const getColors = () => {
      switch (variant) {
        case "blue":
          return {
            primary: "rgba(10, 36, 99, 0.8)",
            secondary: "rgba(62, 146, 204, 0.6)",
            accent: "rgba(216, 225, 233, 0.4)",
            highlight: "rgba(234, 242, 248, 0.2)"
          };
        case "gold":
          return {
            primary: "rgba(212, 175, 55, 0.8)",
            secondary: "rgba(255, 215, 0, 0.6)",
            accent: "rgba(255, 248, 220, 0.4)",
            highlight: "rgba(245, 245, 220, 0.2)"
          };
        case "emerald":
          return {
            primary: "rgba(4, 120, 87, 0.8)",
            secondary: "rgba(16, 185, 129, 0.6)",
            accent: "rgba(209, 250, 229, 0.4)",
            highlight: "rgba(236, 253, 245, 0.2)"
          };
        default:
          return {
            primary: "rgba(10, 36, 99, 0.8)",
            secondary: "rgba(62, 146, 204, 0.6)",
            accent: "rgba(216, 225, 233, 0.4)",
            highlight: "rgba(234, 242, 248, 0.2)"
          };
      }
    };
    
    const colors = getColors();
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      opacity: number;
      speed: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width || 1000);
        this.y = Math.random() * (canvas?.height || 800);
        this.z = Math.random() * 1000;
        this.size = Math.random() * 5 + 1;
        
        const colorRand = Math.random();
        if (colorRand < 0.3) {
          this.color = colors.primary;
        } else if (colorRand < 0.6) {
          this.color = colors.secondary;
        } else if (colorRand < 0.9) {
          this.color = colors.accent;
        } else {
          this.color = colors.highlight;
        }
        
        this.opacity = Math.random() * 0.6 + 0.2;
        this.speed = Math.random() * 0.5 + 0.2;
      }
      
      update() {
        this.z -= this.speed;
        
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * (canvas?.width || 1000);
          this.y = Math.random() * (canvas?.height || 800);
        }
      }
      
      draw() {
        const scale = 1000 / (this.z);
        const x = this.x * scale;
        const y = this.y * scale;
        const s = this.size * scale;
        
        ctx!.globalAlpha = this.opacity * (1 - this.z / 1000);
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(x, y, s, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    
    // Floating element class
    class FloatingElement {
      x: number;
      y: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      shape: "circle" | "square" | "triangle" | "ring";
      color: string;
      opacity: number;
      speedX: number;
      speedY: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width || 1000);
        this.y = Math.random() * (canvas?.height || 800);
        this.size = Math.random() * 80 + 40;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
        
        const shapes = ["circle", "square", "triangle", "ring"] as const;
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const colorRand = Math.random();
        if (colorRand < 0.3) {
          this.color = colors.primary;
        } else if (colorRand < 0.6) {
          this.color = colors.secondary;
        } else if (colorRand < 0.9) {
          this.color = colors.accent;
        } else {
          this.color = colors.highlight;
        }
        
        this.opacity = Math.random() * 0.15 + 0.05;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Bounce off edges
        if (this.x < -this.size) this.x = (canvas?.width || 1000) + this.size;
        if (this.x > (canvas?.width || 1000) + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = (canvas?.height || 800) + this.size;
        if (this.y > (canvas?.height || 800) + this.size) this.y = -this.size;
      }
      
      draw() {
        ctx!.save();
        ctx!.globalAlpha = this.opacity;
        ctx!.translate(this.x, this.y);
        ctx!.rotate(this.rotation * Math.PI / 180);
        
        switch (this.shape) {
          case "circle":
            ctx!.beginPath();
            ctx!.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx!.fillStyle = this.color;
            ctx!.fill();
            break;
            
          case "square":
            ctx!.fillStyle = this.color;
            ctx!.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            break;
            
          case "triangle":
            ctx!.beginPath();
            ctx!.moveTo(0, -this.size / 2);
            ctx!.lineTo(this.size / 2, this.size / 2);
            ctx!.lineTo(-this.size / 2, this.size / 2);
            ctx!.closePath();
            ctx!.fillStyle = this.color;
            ctx!.fill();
            break;
            
          case "ring":
            ctx!.beginPath();
            ctx!.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx!.strokeStyle = this.color;
            ctx!.lineWidth = this.size / 10;
            ctx!.stroke();
            break;
        }
        
        ctx!.restore();
      }
    }
    
    // Create particles
    const getParticleCount = () => {
      const baseCount = Math.floor((dimensions.width * dimensions.height) / 15000);
      switch (density) {
        case "low": return baseCount * 0.5;
        case "high": return baseCount * 2;
        default: return baseCount;
      }
    };
    
    const particles: Particle[] = [];
    const particleCount = getParticleCount();
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Create floating elements
    const getElementCount = () => {
      switch (density) {
        case "low": return 3;
        case "high": return 10;
        default: return 5;
      }
    };
    
    const floatingElements: FloatingElement[] = [];
    const elementCount = getElementCount();
    
    for (let i = 0; i < elementCount; i++) {
      floatingElements.push(new FloatingElement());
    }
    
    // Draw background gradient
    const drawBackground = () => {
      // Mouse-following gradient
      const gradient = ctx.createRadialGradient(
        mousePosition.x * (canvas?.width || 1000),
        mousePosition.y * (canvas?.height || 800),
        0,
        mousePosition.x * (canvas?.width || 1000),
        mousePosition.y * (canvas?.height || 800),
        (canvas?.width || 1000) * 0.8
      );
      
      switch (variant) {
        case "blue":
          gradient.addColorStop(0, `rgba(216, 225, 233, ${0.2 * intensity})`);
          gradient.addColorStop(0.3, `rgba(62, 146, 204, ${0.15 * intensity})`);
          gradient.addColorStop(0.6, `rgba(10, 36, 99, ${0.1 * intensity})`);
          gradient.addColorStop(1, `rgba(5, 18, 50, ${0.05 * intensity})`);
          break;
          
        case "gold":
          gradient.addColorStop(0, `rgba(255, 248, 220, ${0.2 * intensity})`);
          gradient.addColorStop(0.3, `rgba(255, 215, 0, ${0.15 * intensity})`);
          gradient.addColorStop(0.6, `rgba(212, 175, 55, ${0.1 * intensity})`);
          gradient.addColorStop(1, `rgba(85, 70, 25, ${0.05 * intensity})`);
          break;
          
        case "emerald":
          gradient.addColorStop(0, `rgba(209, 250, 229, ${0.2 * intensity})`);
          gradient.addColorStop(0.3, `rgba(16, 185, 129, ${0.15 * intensity})`);
          gradient.addColorStop(0.6, `rgba(4, 120, 87, ${0.1 * intensity})`);
          gradient.addColorStop(1, `rgba(2, 44, 34, ${0.05 * intensity})`);
          break;
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas?.width || 1000, canvas?.height || 800);
    };
    
    // Draw grid pattern
    const drawGrid = () => {
      ctx.strokeStyle = variant === "blue" 
        ? `rgba(62, 146, 204, ${0.05 * intensity})`
        : variant === "gold"
          ? `rgba(212, 175, 55, ${0.05 * intensity})`
          : `rgba(16, 185, 129, ${0.05 * intensity})`;
      
      ctx.lineWidth = 1;
      
      const gridSize = 30;
      for (let x = 0; x < (canvas?.width || 1000); x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas?.height || 800);
        ctx.stroke();
      }
      
      for (let y = 0; y < (canvas?.height || 800); y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas?.width || 1000, y);
        ctx.stroke();
      }
    };
    
    // Main render function
    const render = () => {
      ctx.clearRect(0, 0, canvas?.width || 1000, canvas?.height || 800);
      
      // Draw background
      drawBackground();
      
      // Draw grid
      drawGrid();
      
      // Draw floating elements
      floatingElements.forEach(element => {
        element.update();
        element.draw();
      });
      
      // Draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
    };
    
    // Animation loop
    let animationId: number;
    
    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, mousePosition, variant, intensity, density]);
  
  // Get overlay gradient based on variant
  const getOverlayGradient = () => {
    switch (variant) {
      case "blue":
        return "radial-gradient(circle at 50% 50%, rgba(62, 146, 204, 0.1) 0%, transparent 70%)";
      case "gold":
        return "radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)";
      case "emerald":
        return "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)";
      default:
        return "radial-gradient(circle at 50% 50%, rgba(62, 146, 204, 0.1) 0%, transparent 70%)";
    }
  };
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Light beam effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(255, 255, 255, 0.8) 0%, 
            transparent 20%)`,
          transition: "background 0.3s ease"
        }}
      />
      
      {/* Animated overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.05, 0.08, 0.05],
          background: getOverlayGradient()
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut"
        }}
      />
      
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.15) 100%)"
        }}
      />
    </div>
  );
}
