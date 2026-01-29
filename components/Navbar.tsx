"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // <--- Added this back
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section - RESTORED TO IMAGE */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <Image 
                src="/logo.svg" 
                alt="Siro Logo" 
                width={100} 
                height={40} 
                className="object-contain h-8 w-auto" 
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-600 hover:text-primary font-medium transition">
              Home
            </Link>
            <Link href="/#features" className="text-gray-600 hover:text-primary font-medium transition">
              Features
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary font-medium transition">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary font-medium transition">
              Contact Us
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/login" 
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
            >
              Sign In/Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary">
              {isOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              href="/" 
              className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/#features" 
              className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/about" 
              className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="block px-3 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
            <div className="pt-4">
              <Link 
                href="/login"
                className="block w-full text-center py-3 bg-primary text-white font-bold rounded-xl"
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