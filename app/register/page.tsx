"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useNotification } from "@/context/NotificationContext";
import { 
  UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon 
} from "@heroicons/react/24/outline";

export default function Register() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // States for API calls
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false); // NEW: Track resend state
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // NEW: For resend success feedback
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "",
    otp: "", 
    businessName: "", businessType: "", industry: "", tin: "", annualTurnover: "", fixedAssets: "", isProfessionalServices: false
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
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
        body: JSON.stringify({ email: formData.email, password: formData.password, firstName: formData.firstName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setStep(2);
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" || err.name === "TypeError"
        ? "Your connection has been cut off. Please check your internet and try again later."
        : err.message;
      setErrorMsg(msg);
      showNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Resend OTP Logic
  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/v1/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      
      setSuccessMsg("A new code has been sent to your email.");
      showNotification("OTP resent successfully", "success");
      
      // Clear current OTP input
      setFormData(prev => ({ ...prev, otp: "" }));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" || err.name === "TypeError"
        ? "Network error. Check your connection."
        : err.message;
      setErrorMsg(msg);
      showNotification(msg, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const verifyRes = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Invalid OTP");

      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error("Auto-login failed. Please go to login page.");

      setStep(3);
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" || err.name === "TypeError"
        ? "Your connection has been cut off. Please check your internet and try again later."
        : err.message;
      setErrorMsg(msg);
      showNotification(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/business", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.businessName,
          type: formData.businessType,
          industry: formData.industry,
          tin: formData.tin || undefined,
          annualTurnover: Number(formData.annualTurnover || 0),
          fixedAssets: Number(formData.fixedAssets || 0),
          isProfessionalServices: formData.isProfessionalServices,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create business");
      
      router.push("/pricing");
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" || err.name === "TypeError"
        ? "Your connection has been cut off. Please check your internet and try again later."
        : err.message;
      setErrorMsg(msg);
      showNotification(msg, "error");
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
      
      {successMsg && step === 2 && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center">
          {successMsg}
        </div>
      )}

      {/* --- STEP 1 --- */}
      {step === 1 && (
        <form className="space-y-4" onSubmit={handleStep1}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Create A New Account</h1>
            <p className="text-gray-500 text-sm">Input your personal details</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Annual Turnover (NGN)</label>
              <input name="annualTurnover" min="0" type="number" value={formData.annualTurnover} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Fixed Assets (NGN)</label>
              <input name="fixedAssets" min="0" type="number" value={formData.fixedAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input name="isProfessionalServices" type="checkbox" checked={formData.isProfessionalServices} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary" />
            This business provides professional services
          </label>
          
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
          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-primary font-bold hover:underline">Login</Link>
          </div>
        </form>
      )}

      {/* --- STEP 2 --- */}
      {step === 2 && (
        <form className="space-y-6" onSubmit={handleStep2}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Verify Email</h1>
            <p className="text-gray-500 text-sm">Enter the 6-digit code sent to {formData.email}</p>
          </div>

          <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input key={index} ref={(el) => { inputRefs.current[index] = el }} type="text" maxLength={1} value={formData.otp[index] || ""} onChange={(e) => handleOtpChange(index, e)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-10 h-10 md:w-12 md:h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-xl font-bold bg-white text-dark shadow-sm transition-all"/>
              ))}
          </div>
          
          <button type="submit" disabled={!isStep2Valid || isLoading} className={`w-full py-3 rounded-lg font-semibold text-white transition ${isStep2Valid && !isLoading ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          {/* NEW: Resend OTP Block */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
            <button 
              type="button" 
              onClick={handleResendOtp}
              disabled={isResending || isLoading}
              className="text-primary font-bold text-sm hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {/* --- STEP 3 --- */}
      {step === 3 && (
        <form className="space-y-5" onSubmit={handleStep3}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-dark mb-2">Business Details</h1>
            <p className="text-gray-500 text-sm">Set up your workspace</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Business Name</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} type="text" placeholder="Enter Business Name" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
          </div>
          <div>
            <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Business Type</label>
            <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-gray-500">
              <option value="">Pick Business Type</option>
              <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="LIMITED_LIABILITY">Limited Liability</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Industry</label>
            <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-gray-500">
              <option value="">Pick Industry</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Automotive">Automotive</option>
              <option value="Beauty & Personal Care">Beauty & Personal Care</option>
              <option value="Construction">Construction</option>
              <option value="Consulting">Consulting</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Education">Education</option>
              <option value="Energy & Power">Energy & Power</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Fashion & Textiles">Fashion & Textiles</option>
              <option value="Finance & Banking">Finance & Banking</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Hospitality & Tourism">Hospitality & Tourism</option>
              <option value="Insurance">Insurance</option>
              <option value="Legal Services">Legal Services</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Media & Advertising">Media & Advertising</option>
              <option value="Mining & Quarrying">Mining & Quarrying</option>
              <option value="Non-Profit & NGO">Non-Profit & NGO</option>
              <option value="Oil & Gas">Oil & Gas</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Real Estate & Property">Real Estate & Property</option>
              <option value="Retail">Retail</option>
              <option value="Technology">Technology</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Transportation">Transportation</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Wholesale & Distribution">Wholesale & Distribution</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Annual Turnover (NGN)</label>
              <input name="annualTurnover" min="0" type="number" value={formData.annualTurnover} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Fixed Assets (NGN)</label>
              <input name="fixedAssets" min="0" type="number" value={formData.fixedAssets} onChange={handleChange} placeholder="0" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary bg-white text-dark" />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input name="isProfessionalServices" type="checkbox" checked={formData.isProfessionalServices} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary" />
            This business provides professional services
          </label>
          <button type="submit" disabled={!isStep3Valid || isLoading} className={`w-full py-3 rounded-lg font-semibold text-white transition mt-2 ${isStep3Valid && !isLoading ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
             {isLoading ? "Finalizing..." : "Complete Setup"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
