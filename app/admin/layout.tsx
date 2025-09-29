"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, FileText, Settings, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Function to check screen size
    const checkScreenSize = () => {
      // Define your small screen breakpoint (e.g., 768px for 'md' in Tailwind CSS)
      const smallScreenBreakpoint = 768;
      const currentIsSmallScreen = window.innerWidth < smallScreenBreakpoint;
      setIsSmallScreen(currentIsSmallScreen);

      // If it's a small screen, force sidebar to be collapsed
      if (currentIsSmallScreen) {
        setSidebarExpanded(false);
      } else {
        // On larger screens, restore the user's preference or default to expanded
        const savedSidebar = localStorage.getItem("sidebarExpanded");
        setSidebarExpanded(savedSidebar === "true"); // Default to false if not in localStorage
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    // Only save sidebar state if it's not a small screen
    if (!isSmallScreen) {
      localStorage.setItem("sidebarExpanded", sidebarExpanded.toString());
    }
  }, [sidebarExpanded, isSmallScreen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const sidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/admin" },
    { id: "clients", label: "Clients", icon: <Users className="h-5 w-5" />, href: "/admin/clients" },
    { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" />, href: "/admin/documents" },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" />, href: "/admin/settings" },
  ];

  // Determine if the sidebar is functionally expanded (only if not a small screen)
  const isSidebarFunctionallyExpanded = sidebarExpanded && !isSmallScreen;

  return (
    <div className="min-h-screen flex bg-gray-60 z-auto">
      {/* Sidebar */}
      <motion.aside
        // Use isSidebarFunctionallyExpanded for width class
        className={`${isSidebarFunctionallyExpanded ? "w-64" : "w-15"} bg-white border-r border-gray-100 shadow-sm h-screen sticky top-0 flex flex-col transition-all duration-300`}
      >
        <div className={`flex ${isSidebarFunctionallyExpanded ? "justify-between px-5" : "justify-center"} py-6`}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {/* Only show "Admin Panel" text if sidebar is functionally expanded */}
            {isSidebarFunctionallyExpanded && <span className="ml-3 font-semibold text-gray-800">Admin Panel</span>}
          </div>
          {/* Toggle button only visible and functional on larger screens */}
          {!isSmallScreen && (
            <motion.button
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isSidebarFunctionallyExpanded ? "" : "rotate-180"}`}>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </motion.button>
          )}
        </div>

        <div className={`flex-1 flex flex-col ${isSidebarFunctionallyExpanded ? "items-start px-3" : "items-center"} py-6 space-y-2`}>
          {sidebarItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`${isSidebarFunctionallyExpanded ? "w-full justify-start px-4" : "w-14 flex-col"} h-12 flex items-center rounded-xl text-sm transition-all ${
                activeSidebarItem === item.id ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setActiveSidebarItem(item.id)}
            >
              {/* Adjust icon and label positioning based on functional expansion */}
              <span className={`${isSidebarFunctionallyExpanded ? "mr-3" : "mb-1"}`}>{item.icon}</span>
              <span className={`${isSidebarFunctionallyExpanded ? "text-sm" : "text-[8px]"} font-medium`}>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className={`${isSidebarFunctionallyExpanded ? "px-3" : "flex justify-center"} pb-6`}>
          <button className={`${isSidebarFunctionallyExpanded ? "w-full justify-start px-4" : "w-14 flex-col"} h-12 flex items-center text-sm`} onClick={handleLogout}>
            {/* Adjust icon and label positioning based on functional expansion */}
            <LogOut className={`${isSidebarFunctionallyExpanded ? "mr-3" : "mb-1"} h-5 w-5`} />
            <span className={`${isSidebarFunctionallyExpanded ? "text-sm" : "text-[10px]"} font-medium`}>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 sm:p-6 p-2 overflow-auto">{children}</main>
    </div>
  );
}