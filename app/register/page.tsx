"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from "@heroicons/react/24/outline";

export default function Register() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. STATE: Track inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "", 
    businessName: "",
    businessType: "",
    industry: ""
  });

  // OTP REFS (Moved to top level to fix focus bug)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // OTP Handlers
  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    let otpArray = formData.otp.padEnd(6, " ").split("");
    otpArray[index] = value;
    setFormData({ ...formData, otp: otpArray.join("").trim() });

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- VALIDATION ---
  const isStep1Valid = 
    formData.firstName && formData.lastName && formData.phone && 
    formData.email && formData.password && formData.confirmPassword;

  const isStep2Valid = formData.otp.length === 6;

  const isStep3Valid = 
    formData.businessName && formData.businessType && formData.industry;

  return (
    <AuthLayout>
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-in-out" 
          style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
        ></div>
      </div>

      {/* --- STEP 1: PERSONAL DETAILS --- */}
      {step === 1 && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Create A New Account</h1>
            <p className="text-gray-500 text-sm">Input your personal details</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if(isStep1Valid) setStep(2); }}>
            <div className="relative">
              <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="First Name" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
            </div>
            <div className="relative">
              <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" placeholder="Last Name" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
            </div>
            <div className="relative">
              <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Phone Number" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
            </div>
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter Email" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
            </div>
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? "text" : "password"} placeholder="Enter Password" className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" placeholder="Confirm Password" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
            </div>

            <button 
              type="submit" 
              disabled={!isStep1Valid}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 mt-2
                ${isStep1Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}
            >
              Continue
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Do you have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Login</Link>
            </p>
          </form>
        </>
      )}

      {/* --- STEP 2: OTP --- */}
      {step === 2 && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Verify Your Email</h1>
            <p className="text-gray-500 text-sm">Input the code that was sent to your mail inbox</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-primary border border-blue-100">
              <EnvelopeIcon className="h-7 w-7" />
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if(isStep2Valid) setStep(3); }}>
            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  maxLength={1}
                  value={formData.otp[index] || ""}
                  onChange={(e) => handleOtpChange(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-10 h-10 md:w-12 md:h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-xl font-bold bg-white text-dark shadow-sm transition-all"
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={!isStep2Valid}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200
                ${isStep2Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}
            >
              Verify
            </button>
            <p className="text-center text-gray-900 font-medium text-sm">0:56</p>
          </form>
        </>
      )}

      {/* --- STEP 3: BUSINESS INFO --- */}
      {step === 3 && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Business Information</h1>
            <p className="text-gray-500 text-sm">Input your business details</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Account Created Successfully!"); }}>
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Business Name</label>
              <input name="businessName" value={formData.businessName} onChange={handleChange} type="text" placeholder="Enter Business Name" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Business Type</label>
              <div className="relative">
                <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option value="">Pick Business Type</option>
                  <option value="sole">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="limited">Limited Liability</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Industry</label>
              <div className="relative">
                <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option value="">Pick Industry</option>
                  <option value="fashion">Fashion</option>
                  <option value="retail">Retail</option>
                  <option value="tech">Technology</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isStep3Valid}
              className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 mt-2
                ${isStep3Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}
            >
              Continue
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}