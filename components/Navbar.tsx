"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Unified Scroll Function
  const handleScrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);

    const element = document.getElementById("features");
    
    if (pathname === "/") {
      // If on home page, just scroll
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If on another page, go home first then scroll
      router.push("/#features");
    }
  };

  // Helper to check if a link is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center w-40">
            <Link href="/">
              <Image 
                src="/logo.png" 
                alt="Siro Logo" 
                width={80} 
                height={34} 
                className="object-contain"
                priority // <-- FIX 1: Preloads the logo for faster LCP
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <Link 
              href="/" 
              className={`text-sm transition-colors ${isActive("/") ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900 font-medium"}`}
            >
              Home
            </Link>
            <button 
              onClick={handleScrollToFeatures}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Features
            </button>
            <Link 
              href="/pricing" 
              className={`text-sm transition-colors ${isActive("/pricing") ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900 font-medium"}`}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`text-sm transition-colors ${isActive("/about") ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900 font-medium"}`}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm transition-colors ${isActive("/contact") ? "text-primary font-semibold" : "text-gray-500 hover:text-gray-900 font-medium"}`}
            >
              Contact Us
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center justify-end w-auto">
            <Link 
              href="/waitlist" 
              className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Join the waitlist
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"} // <-- FIX 2: Accessibility for screen readers
              aria-expanded={isOpen} // <-- FIX 3: Accessibility state
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link 
              href="/" 
              className={`block px-4 py-3 text-sm rounded-lg transition-colors ${isActive("/") ? "font-semibold text-primary bg-blue-50" : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <button 
              onClick={handleScrollToFeatures}
              className="w-full text-left block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              Features
            </button>
            <Link 
              href="/pricing" 
              className={`block px-4 py-3 text-sm rounded-lg transition-colors ${isActive("/pricing") ? "font-semibold text-primary bg-blue-50" : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`block px-4 py-3 text-sm rounded-lg transition-colors ${isActive("/about") ? "font-semibold text-primary bg-blue-50" : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className={`block px-4 py-3 text-sm rounded-lg transition-colors ${isActive("/contact") ? "font-semibold text-primary bg-blue-50" : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
            <div className="pt-4 px-2">
              <Link 
                href="/waitlist"
                className="block w-full text-center py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => setIsOpen(false)}
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}