"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { ShieldCheckIcon, KeyIcon } from "@heroicons/react/24/outline";

function AdminVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/pigshit/auth");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/pigshit/auth?message=Verification successful. You can now log in.");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leftContent = {
    title: "Final Security Clearance",
    description: "Your administrative identity is being established. Please enter the 6-digit verification code sent to your inbox to activate the cluster.",
    icon: <ShieldCheckIcon className="w-48 h-48 text-white opacity-20" />
  };

  return (
    <AuthLayout leftContent={leftContent}>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
           <KeyIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Authority</h1>
        <p className="text-gray-500 text-sm font-medium">Enter the code sent to <span className="text-primary font-bold">{email}</span></p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-bold text-center">
          Code verified! Redirecting to login...
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">6-Digit Access Code</label>
          <input 
            required
            type="text" 
            maxLength={6}
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000" 
            className="w-full text-center px-4 py-5 text-3xl font-black tracking-[1em] border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-gray-900 bg-gray-50/50 transition-all font-mono placeholder:text-gray-200 placeholder:tracking-widest"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || otp.length !== 6 || success} 
          className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 mt-4 active:scale-[0.98]"
        >
          {loading ? "Validating..." : "Confirm Clearance"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense fallback={<div>Loading verification...</div>}>
      <AdminVerifyContent />
    </Suspense>
  );
}
