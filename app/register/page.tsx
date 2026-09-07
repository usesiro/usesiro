"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useNotification } from "@/context/NotificationContext";
import { 
  UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon
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
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", otp: ""
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

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

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.password;
  const isStep2Valid = formData.otp.length === 6;

  const getOtpErrorMessage = (status: number, serverError?: string) => {
    const normalized = serverError?.toLowerCase() || "";
    if (normalized.includes("expired")) return "This verification code has expired. Please request a new code.";
    if (normalized.includes("invalid code") || normalized.includes("failed attempt")) return "That verification code is incorrect. Please check it and try again.";
    if (status === 429) return "Too many verification attempts. Please request a new code or try again later.";
    return "We could not verify the code. Please try again.";
  };

  // --- API CALLS ---

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setResendCooldown(60);
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
    if (resendCooldown > 0 || isResending) return;
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
      
      setSuccessMsg("A new verification code has been sent to your email.");
      showNotification("A new verification code has been sent to your email.", "success");
      setResendCooldown(60);
      
      // Clear current OTP input
      setFormData(prev => ({ ...prev, otp: "" }));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg = err.message === "Failed to fetch" || err.name === "TypeError"
        ? "We could not reach the server. Please check your connection and try again."
        : "We could not resend the verification code. Please try again.";
      setErrorMsg(msg);
      showNotification(msg, "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isResending) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const verifyRes = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(getOtpErrorMessage(verifyRes.status, verifyData.error));

      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error("Auto-login failed. Please go to login page.");

      router.push("/dashboard");
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
        <div className="bg-primary h-full transition-all duration-300" style={{ width: step === 1 ? "50%" : "100%" }}></div>
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
          <div className="relative">
            <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="First Name" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
          </div>
          <div className="relative">
            <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" placeholder="Last Name" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
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
            {isEditingEmail ? (
              <div className="mt-3 flex gap-2">
                <input value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} type="email" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" aria-label="New email address" />
                <button type="button" onClick={async () => {
                  const newEmail = emailDraft.trim().toLowerCase();
                  if (!newEmail || newEmail === formData.email) return;
                  setIsResending(true); setErrorMsg("");
                  try {
                    const res = await fetch("/api/v1/auth/resend-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.email, newEmail, password: formData.password }) });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Unable to change email");
                    setFormData((prev) => ({ ...prev, email: newEmail, otp: "" }));
                    setResendCooldown(60); setIsEditingEmail(false); setSuccessMsg("A new verification code has been sent to your email.");
                    showNotification("A new verification code has been sent to your email.", "success");
                  } catch { setErrorMsg("We could not change your email address. Please try again."); }
                  finally { setIsResending(false); }
                }} disabled={isResending || isLoading || !emailDraft.trim()} className="px-3 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-50">Update</button>
                <button type="button" onClick={() => setIsEditingEmail(false)} disabled={isResending} className="px-2 py-2 text-sm text-gray-500 disabled:opacity-50">Cancel</button>
              </div>
            ) : (
              <button type="button" onClick={() => { setEmailDraft(formData.email); setIsEditingEmail(true); }} className="mt-2 text-primary text-sm font-semibold hover:underline">Change email</button>
            )}
          </div>

          <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input key={index} ref={(el) => { inputRefs.current[index] = el }} type="text" maxLength={1} value={formData.otp[index] || ""} onChange={(e) => handleOtpChange(index, e)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-10 h-10 md:w-12 md:h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-xl font-bold bg-white text-dark shadow-sm transition-all"/>
              ))}
          </div>
          
          <button type="submit" disabled={!isStep2Valid || isLoading || isResending} className={`w-full py-3 rounded-lg font-semibold text-white transition ${isStep2Valid && !isLoading && !isResending ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          {/* NEW: Resend OTP Block */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
            <button 
              type="button" 
              onClick={handleResendOtp}
              disabled={isResending || isLoading || resendCooldown > 0}
              className="text-primary font-bold text-sm hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {isResending ? "Resending..." : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
            </button>
          </div>
        </form>
      )}

    </AuthLayout>
  );
}
