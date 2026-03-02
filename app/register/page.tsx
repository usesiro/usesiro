"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { 
  UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon 
} from "@heroicons/react/24/outline";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // New States for API calls
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "",
    otp: "", 
    businessName: "", businessType: "", industry: "", tin: "" // Added tin to match schema
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); // Clear errors on typing
  };

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    let otpArray = formData.otp.padEnd(6, " ").split("");
    otpArray[index] = value;
    setFormData({ ...formData, otp: otpArray.join("").trim() });
    setErrorMsg("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isStep1Valid = formData.firstName && formData.email && formData.password && formData.password === formData.confirmPassword;
  const isStep2Valid = formData.otp.length === 6;
  const isStep3Valid = formData.businessName && formData.businessType && formData.industry;

  // --- API CALLS ---

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only sending the fields Zod expects
        body: JSON.stringify({ email: formData.email, password: formData.password, firstName: formData.firstName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      // 1. Verify the OTP
      const verifyRes = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Invalid OTP");

      // 2. AUTO-LOGIN to get the JWT token for Step 3
      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error("Auto-login failed. Please go to login page.");

      // Save token securely
      localStorage.setItem("siro_access_token", loginData.accessToken);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("siro_access_token");
      const res = await fetch("/api/v1/business", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: formData.businessName,
          type: formData.businessType,
          industry: formData.industry,
          tin: formData.tin || undefined // Send undefined if empty
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create business");
      
      // Success! Send them to the dashboard
      router.push("/welcome"); 
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full bg-gray-100 h-1 rounded-full mb-8 overflow-hidden">
        <div className="bg-primary h-full transition-all duration-300" style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}></div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* --- STEP 1 --- */}
      {step === 1 && (
        <form className="space-y-4" onSubmit={handleStep1}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Create A New Account</h1>
            <p className="text-gray-500 text-sm">Input your personal details</p>
          </div>
          {/* ... Keep your existing Step 1 inputs here ... */}
          
          {/* Example of one input for brevity, KEEP yours */}
          <div className="relative">
            <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="First Name" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
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

          <button type="submit" disabled={!isStep1Valid || isLoading} className={`w-full py-3 rounded-lg font-semibold text-white transition mt-2 ${isStep1Valid && !isLoading ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
            {isLoading ? "Processing..." : "Continue"}
          </button>
        </form>
      )}

      {/* --- STEP 2 --- */}
      {step === 2 && (
        <form className="space-y-6" onSubmit={handleStep2}>
          {/* ... Keep your existing OTP header/icons ... */}
          <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input key={index} ref={(el) => { inputRefs.current[index] = el }} type="text" maxLength={1} value={formData.otp[index] || ""} onChange={(e) => handleOtpChange(index, e)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-10 h-10 md:w-12 md:h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-xl font-bold bg-white text-dark shadow-sm transition-all"/>
              ))}
          </div>
          <button type="submit" disabled={!isStep2Valid || isLoading} className={`w-full py-3 rounded-lg font-semibold text-white transition ${isStep2Valid && !isLoading ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>
      )}

      {/* --- STEP 3 --- */}
      {step === 3 && (
        <form className="space-y-5" onSubmit={handleStep3}>
          {/* ... Keep your existing headers ... */}
          <div>
            <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Business Name</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} type="text" placeholder="Enter Business Name" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Business Type</label>
            <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-gray-500">
              <option value="">Pick Business Type</option>
              {/* FIXED ENUM VALUES HERE */}
              <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="LIMITED_LIABILITY">Limited Liability</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Industry</label>
            <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-gray-500">
              <option value="">Pick Industry</option>
              <option value="Fashion">Fashion</option>
              <option value="Retail">Retail</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
          <button type="submit" disabled={!isStep3Valid || isLoading} className={`w-full py-3 rounded-lg font-semibold text-white transition mt-2 ${isStep3Valid && !isLoading ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
             {isLoading ? "Finalizing..." : "Complete Setup"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}