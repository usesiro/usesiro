"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { useNotification } from "@/context/NotificationContext";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ChevronLeftIcon 
} from "@heroicons/react/24/outline";

export default function ForgotPassword() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(""); // Clear errors when typing
  };

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    let otpArray = formData.otp.padEnd(6, " ").split("");
    otpArray[index] = value;
    setFormData({ ...formData, otp: otpArray.join("").trim() });
    setErrorMessage("");

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- API CALLS ---
  const requestOtp = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setTimeLeft(60);
        setIsTimerActive(true);
        setSuccessMessage("Verification code has been sent to your email");
        showNotification("Verification code sent to your email", "success");
        setTimeout(() => setSuccessMessage(""), 5000); // Hide toast after 5s
      } else {
        setErrorMessage(data.error || "Failed to send code.");
        showNotification(data.error || "Failed to send code.", "error");
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndGoToStep3 = () => {
    // We don't hit the DB yet, we just move to step 3 to get the new password
    // We will send the OTP and the New Password to the backend together.
    setStep(3);
  };

  const submitNewPassword = async () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp, 
          newPassword: formData.password 
        }),
      });
      const data = await res.json();

      if (res.ok) {
        showNotification("Password Reset Successful! You can now log in.", "success");
        router.push("/login");
      } else {
        setErrorMessage(data.error || "Failed to reset password.");
        showNotification(data.error || "Failed to reset password.", "error");
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  // --- VALIDATION ---
  const isStep1Valid = formData.email.length > 0;
  const isStep2Valid = formData.otp.length === 6;
  const isStep3Valid = formData.password && formData.confirmPassword;

  return (
    <AuthLayout>
      {/* Success Toast */}
      {successMessage && (
        <div className="absolute top-4 right-4 md:right-8 bg-blue-50 text-primary px-4 py-2 rounded-lg text-xs font-medium flex items-center shadow-sm border border-blue-100 animate-fade-in z-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {successMessage}
        </div>
      )}

      {/* Global Error Display */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* --- STEP 1: EMAIL --- */}
      {step === 1 && (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/login" className="text-gray-400 hover:text-gray-800 transition">
                <ChevronLeftIcon className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">Input your registered email</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); requestOtp(); }}>
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5 ml-1">Email</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  placeholder="Enter Email" 
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-gray-800 bg-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isStep1Valid || isLoading}
              className={`w-full py-3 rounded-lg font-bold text-sm text-white transition duration-200
                ${(!isStep1Valid || isLoading) ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer"}`}
            >
              {isLoading ? "Sending..." : "Continue"}
            </button>
          </form>
        </>
      )}

      {/* --- STEP 2: OTP --- */}
      {step === 2 && (
        <>
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-800 transition">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Verify Email</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">Input the code that was sent to your inbox</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-primary border border-blue-100">
              <EnvelopeIcon className="h-7 w-7" />
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); verifyOtpAndGoToStep3(); }}>
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
                  className="w-10 h-10 md:w-12 md:h-12 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-lg font-bold bg-white text-gray-800 shadow-sm" 
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={!isStep2Valid}
              className={`w-full py-3 rounded-lg font-bold text-sm text-white transition duration-200
                ${isStep2Valid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary/50 cursor-not-allowed"}`}
            >
              Verify
            </button>
            
            <div className="text-center text-sm font-medium">
              {isTimerActive ? (
                <p className="text-gray-800">{formatTime(timeLeft)}</p>
              ) : (
                <button type="button" onClick={requestOtp} className="text-primary hover:underline">
                  Resend Code
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {/* --- STEP 3: NEW PASSWORD --- */}
      {step === 3 && (
        <>
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-800 transition">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">Input a new secure login password</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submitNewPassword(); }}>
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Password" 
                  className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-gray-800 bg-white" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-800 mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-gray-800 bg-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isStep3Valid || isLoading}
              className={`w-full py-3 rounded-lg font-bold text-sm text-white transition duration-200 mt-2
                ${(!isStep3Valid || isLoading) ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer"}`}
            >
              {isLoading ? "Saving..." : "Confirm & Login"}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}