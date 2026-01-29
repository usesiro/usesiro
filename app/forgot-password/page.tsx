"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ChevronLeftIcon 
} from "@heroicons/react/24/outline";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  
  // 1. TRACK INPUTS
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
  const isStep1Valid = formData.email.length > 0;
  const isStep2Valid = formData.otp.length === 6;
  const isStep3Valid = formData.password && formData.confirmPassword;

  return (
    <AuthLayout>
      {/* Success Toast */}
      {step === 3 && (
        <div className="absolute top-4 right-4 md:right-8 bg-blue-50 text-primary px-4 py-2 rounded-lg text-xs font-medium flex items-center shadow-sm border border-blue-100 animate-fade-in">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Verification code has been sent to your email
        </div>
      )}

      {/* --- STEP 1: EMAIL --- */}
      {step === 1 && (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/login" className="text-gray-400 hover:text-dark transition">
                <ChevronLeftIcon className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-dark">Forgot Password</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">Input your registered email</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if(isStep1Valid) setStep(2); }}>
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Email</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  placeholder="Enter Email" 
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isStep1Valid}
              className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition duration-200
                ${isStep1Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}
            >
              Continue
            </button>
          </form>
        </>
      )}

      {/* --- STEP 2: OTP --- */}
      {step === 2 && (
        <>
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-dark transition">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-dark">Forgot Password</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">Input the code that was sent to your mail inbox</p>
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
                  className="w-10 h-10 md:w-12 md:h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-lg font-bold bg-white text-dark shadow-sm" 
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={!isStep2Valid}
              className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition duration-200
                ${isStep2Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}
            >
              Verify
            </button>
            <p className="text-center text-gray-900 font-medium text-sm">0:56</p>
          </form>
        </>
      )}

      {/* --- STEP 3: NEW PASSWORD --- */}
      {step === 3 && (
        <>
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-dark transition">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-dark">Set Up A New Password</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">Input a new login password</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Password Reset Successful!"); }}>
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Password" 
                  className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isStep3Valid}
              className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition duration-200 mt-2
                ${isStep3Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}
            >
              Confirm
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}