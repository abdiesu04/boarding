"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navbar and footer on the home page only
  const isHomePage = pathname === "/";
  
  if (isHomePage) {
    return <main className="flex-grow">{children}</main>;
  }
  
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
