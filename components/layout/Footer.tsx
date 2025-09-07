"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <span className="ml-3 font-bold text-xl text-white">
                Finance Solutions
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Providing trusted financial solutions since 2010. We help our clients achieve their financial goals with personalized funding options.
            </p>
            <div className="flex space-x-4">
              <SocialLink icon={<Facebook size={18} />} href="#" />
              <SocialLink icon={<Twitter size={18} />} href="#" />
              <SocialLink icon={<Instagram size={18} />} href="#" />
              <SocialLink icon={<Linkedin size={18} />} href="#" />
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <FooterLink href="/" label="Home" />
              <FooterLink href="#about" label="About Us" />
              <FooterLink href="#services" label="Services" />
              <FooterLink href="#testimonials" label="Testimonials" />
              <FooterLink href="/register" label="Get Started" />
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <ul className="space-y-4">
              <FooterLink href="#" label="Personal Loans" />
              <FooterLink href="#" label="Business Funding" />
              <FooterLink href="#" label="Mortgage Solutions" />
              <FooterLink href="#" label="Financial Planning" />
              <FooterLink href="#" label="Investment Advice" />
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-500 mr-3 mt-0.5" />
                <span className="text-gray-400">123 Finance Street, New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-400">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-emerald-500 mr-3" />
                <span className="text-gray-400">info@financesolutions.example</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Subscribe to Our Newsletter</h3>
            <p className="text-gray-400 text-center mb-4">Stay updated with our latest news and offers</p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium rounded-md hover:shadow-lg transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Finance Solutions. All rights reserved.
          </p>
          <div className="flex mt-4 sm:mt-0 space-x-6 text-sm">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Social Media Link
const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -3 }}
      className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-blue-500 hover:text-white transition-colors"
    >
      {icon}
    </motion.a>
  );
};

// Footer Link
const FooterLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-400 hover:text-emerald-500 transition-colors"
      >
        {label}
      </Link>
    </li>
  );
};

