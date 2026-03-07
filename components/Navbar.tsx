"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center w-40">
            <Link href="/">
              <Image 
                src="/logo.svg" 
                alt="Siro Logo" 
                width={80} 
                height={34} 
                className="object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <Link href="/" className="text-sm text-gray-900 font-semibold transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Contact Us
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center justify-end w-40">
            <Link 
              href="/login" 
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In/Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 transition-colors">
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
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
              className="block px-4 py-3 text-sm font-semibold text-gray-900 bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/#features" 
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
            <div className="pt-4 px-2">
              <Link 
                href="/login"
                className="block w-full text-center py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In/Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}