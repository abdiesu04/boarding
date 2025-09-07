"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface PresidentialBackgroundProps {
  variant?: "gold" | "blue" | "patriotic";
  intensity?: number;
}

export default function PresidentialBackground({
  variant = "gold",
  intensity = 1.0
}: PresidentialBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
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
        case "gold":
          return {
            primary: "#D4AF37",
            secondary: "#FFD700",
            accent: "#FFF8DC",
            highlight: "#F5F5DC"
          };
        case "blue":
          return {
            primary: "#0A2463",
            secondary: "#3E92CC",
            accent: "#D8E1E9",
            highlight: "#EAF2F8"
          };
        case "patriotic":
          return {
            primary: "#B22234", // Red
            secondary: "#3C3B6E", // Blue
            accent: "#FFFFFF", // White
            highlight: "#D8E1E9"
          };
        default:
          return {
            primary: "#D4AF37",
            secondary: "#FFD700",
            accent: "#FFF8DC",
            highlight: "#F5F5DC"
          };
      }
    };
    
    const colors = getColors();
    
    // Particles
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      
      constructor(x: number, y: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = color;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around screen
        if (this.x < 0) this.x = canvas?.width || 1000;
        if (this.x > (canvas?.width || 1000)) this.x = 0;
        if (this.y < 0) this.y = canvas?.height || 800;
        if (this.y > (canvas?.height || 800)) this.y = 0;
      }
      
      draw() {
        ctx!.globalAlpha = this.opacity;
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
    
    // Create particles
    const particleCount = Math.floor((dimensions.width * dimensions.height) / 15000);
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 5 + 1;
      const x = Math.random() * (canvas?.width || 1000);
      const y = Math.random() * (canvas?.height || 800);
      
      // Determine particle color based on variant
      let color;
      const colorRand = Math.random();
      if (variant === "patriotic") {
        if (colorRand < 0.33) {
          color = colors.primary;
        } else if (colorRand < 0.66) {
          color = colors.accent;
        } else {
          color = colors.secondary;
        }
      } else {
        if (colorRand < 0.4) {
          color = colors.primary;
        } else if (colorRand < 0.7) {
          color = colors.secondary;
        } else {
          color = colors.accent;
        }
      }
      
      particles.push(new Particle(x, y, size, color));
    }
    
    // Draw luxury background
    const drawBackground = () => {
      // Base gradient
      const gradient = ctx.createRadialGradient(
        (canvas?.width || 1000) * mousePosition.x,
        (canvas?.height || 800) * mousePosition.y,
        0,
        (canvas?.width || 1000) * 0.5,
        (canvas?.height || 800) * 0.5,
        (canvas?.width || 1000) * 0.8
      );
      
      if (variant === "patriotic") {
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.2 * intensity})`);
        gradient.addColorStop(0.3, `rgba(60, 59, 110, ${0.15 * intensity})`);
        gradient.addColorStop(0.6, `rgba(178, 34, 52, ${0.1 * intensity})`);
        gradient.addColorStop(1, `rgba(25, 25, 50, ${0.05 * intensity})`);
      } else if (variant === "gold") {
        gradient.addColorStop(0, `rgba(255, 248, 220, ${0.2 * intensity})`);
        gradient.addColorStop(0.3, `rgba(255, 215, 0, ${0.15 * intensity})`);
        gradient.addColorStop(0.6, `rgba(212, 175, 55, ${0.1 * intensity})`);
        gradient.addColorStop(1, `rgba(85, 70, 25, ${0.05 * intensity})`);
      } else {
        gradient.addColorStop(0, `rgba(216, 225, 233, ${0.2 * intensity})`);
        gradient.addColorStop(0.3, `rgba(62, 146, 204, ${0.15 * intensity})`);
        gradient.addColorStop(0.6, `rgba(10, 36, 99, ${0.1 * intensity})`);
        gradient.addColorStop(1, `rgba(5, 18, 50, ${0.05 * intensity})`);
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas?.width || 1000, canvas?.height || 800);
    };
    
    // Draw luxury pattern
    const drawPattern = () => {
      ctx.strokeStyle = variant === "gold" 
        ? `rgba(212, 175, 55, ${0.1 * intensity})`
        : variant === "patriotic"
          ? `rgba(255, 255, 255, ${0.1 * intensity})`
          : `rgba(62, 146, 204, ${0.1 * intensity})`;
      
      ctx.lineWidth = 1;
      
      // Grid pattern
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
    
    // Draw particles and connections
    const drawParticles = () => {
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Draw connections
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = variant === "gold" 
        ? "#D4AF37"
        : variant === "patriotic"
          ? "#FFFFFF"
          : "#3E92CC";
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Draw luxury shapes
    const drawLuxuryShapes = () => {
      // Draw luxury circles
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 200 + 50;
        
        const gradient = ctx.createRadialGradient(
          x, y, 0, x, y, radius
        );
        
        if (variant === "patriotic") {
          const rand = Math.random();
          if (rand < 0.33) {
            gradient.addColorStop(0, `rgba(178, 34, 52, ${0.1 * intensity})`);
            gradient.addColorStop(1, 'rgba(178, 34, 52, 0)');
          } else if (rand < 0.66) {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 * intensity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          } else {
            gradient.addColorStop(0, `rgba(60, 59, 110, ${0.1 * intensity})`);
            gradient.addColorStop(1, 'rgba(60, 59, 110, 0)');
          }
        } else if (variant === "gold") {
          gradient.addColorStop(0, `rgba(212, 175, 55, ${0.1 * intensity})`);
          gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        } else {
          gradient.addColorStop(0, `rgba(62, 146, 204, ${0.1 * intensity})`);
          gradient.addColorStop(1, 'rgba(62, 146, 204, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Main render function
    const render = () => {
      ctx.clearRect(0, 0, canvas?.width || 1000, canvas?.height || 800);
      drawBackground();
      drawPattern();
      drawLuxuryShapes();
      drawParticles();
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
  }, [dimensions, mousePosition, variant, intensity]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Overlay gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"
      />
      
      {/* Animated overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.05, 0.08, 0.05],
          background: variant === "gold" 
            ? "radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)"
            : variant === "patriotic"
              ? "radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(62, 146, 204, 0.1) 0%, transparent 70%)"
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

