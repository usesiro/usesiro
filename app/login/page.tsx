"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from "@heroicons/react/24/outline";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. TRACK INPUTS
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.type === "email" ? "email" : "password"]: e.target.value });
  };

  // 2. CHECK VALIDITY
  const isValid = formData.email && formData.password;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark mb-2">Login To Your Account</h1>
        <p className="text-gray-500 text-sm">Welcome back! Input your login details</p>
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Email</label>
          <div className="relative">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email" 
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" 
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Password</label>
          <div className="relative">
            <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password" 
              className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-primary text-xs font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* SMART BUTTON */}
        <button 
          type="submit" 
          disabled={!isValid}
          className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition duration-200 mt-4
            ${isValid 
              ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" 
              : "bg-primary opacity-50 cursor-not-allowed"
            }`}
        >
          Login
        </button>

        <p className="text-center text-gray-500 text-xs mt-6">
          Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Sign Up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}