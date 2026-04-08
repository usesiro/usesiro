"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { ShieldCheckIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function AdminAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Error code mapping for professional display
  const errorMap: Record<string, string> = {
    admin_detected: "Administrative account detected. Please sign in here to access the control center.",
    setup_completed: "System initialization is already complete. Please log in with your master credentials.",
    unauthorized_portal: "Access Denied: This portal is reserved for administrators only.",
    session_expired: "Your session has expired. Please log in again."
  };

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode && errorMap[errorCode]) {
      setError(errorMap[errorCode]);
      
      // Clean up the URL without refreshing to keep it looking premium
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, portal: "ADMIN" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.user.role === "USER") {
        throw new Error("Access Denied: This portal is for administrators only.");
      }

      router.push("/pigshit");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leftContent = {
    title: "Master Control Center",
    description: "Access the Siro platform core. Monitor system health, manage businesses, and oversee global revenue.",
    icon: <ShieldCheckIcon className="w-48 h-48 text-white" />
  };

  return (
    <AuthLayout leftContent={leftContent}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p className="text-gray-500 text-sm font-medium">Please enter your institutional credentials.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Admin Email</label>
          <div className="relative">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              required
              type="email" 
              value={formData.email} 
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="admin@usesiro.com" 
              className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-gray-900 bg-gray-50/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Master Password</label>
          <div className="relative">
            <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              required
              type={showPassword ? "text" : "password"} 
              value={formData.password} 
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••••••" 
              className="w-full pl-11 pr-12 py-3.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-gray-900 bg-gray-50/50 transition-all font-mono"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 mt-4 active:scale-[0.98]"
        >
          {loading ? "Authenticating Authority..." : "Initialize Session"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-primary/20 mx-auto mb-4 animate-pulse" />
          <p className="text-[11px] font-black text-gray-400 border-2 uppercase tracking-[0.3em]">Initializing Security Portal...</p>
        </div>
      </div>
    }>
      <AdminAuthContent />
    </Suspense>
  );
}
