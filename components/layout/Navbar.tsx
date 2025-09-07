"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-sm backdrop-blur-md py-2" : "bg-transparent py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className={`ml-2 font-bold text-lg ${scrolled ? "text-gray-900" : "text-gray-800"}`}>
                Finance Solutions
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <NavLink href="/" label="Home" scrolled={scrolled} />
              <NavLink href="#services" label="Services" scrolled={scrolled} />
              <NavLink href="#about" label="About" scrolled={scrolled} />
              <NavLink href="#testimonials" label="Testimonials" scrolled={scrolled} />
              <NavLink href="#contact" label="Contact" scrolled={scrolled} />
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="hidden md:block">
            <Link 
              href="/register" 
              className={`
                px-5 py-2.5 rounded-md font-medium transition-all
                ${scrolled 
                  ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:shadow-md" 
                  : "bg-white text-gray-900 hover:bg-gray-50"}
              `}
            >
              Get Started
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pt-2 pb-5 space-y-1 sm:px-3">
              <MobileNavLink href="/" label="Home" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink href="#services" label="Services" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink href="#about" label="About" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink href="#testimonials" label="Testimonials" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink href="#contact" label="Contact" onClick={() => setIsMenuOpen(false)} />
              
              <div className="pt-4">
                <Link 
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Desktop Navigation Link
const NavLink = ({ href, label, scrolled }: { href: string; label: string; scrolled: boolean }) => {
  return (
    <Link 
      href={href}
      className={`
        relative font-medium hover:text-emerald-600 transition-colors group
        ${scrolled ? "text-gray-700" : "text-gray-800"}
      `}
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-0.5 bg-emerald-500 w-0 group-hover:w-full transition-all duration-300" />
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ href, label, onClick }: { href: string; label: string; onClick: () => void }) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
    >
      {label}
    </Link>
  );
};

