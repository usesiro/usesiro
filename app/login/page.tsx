"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // API States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.type === "email" ? "email" : "password"]: e.target.value });
    setErrorMsg("");
  };

  const isValid = formData.email && formData.password;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");

      // 1. Save the token
      localStorage.setItem("siro_access_token", data.accessToken);
      
      // 2. Redirect to dashboard
      router.push("/dashboard");

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark mb-2">Login To Your Account</h1>
        <p className="text-gray-500 text-sm">Welcome back! Input your login details</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Email</label>
          <div className="relative">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="email" value={formData.email} onChange={handleChange} placeholder="Enter Email" className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-dark mb-1.5 ml-1">Password</label>
          <div className="relative">
            <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Enter Password" className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark bg-white" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-primary text-xs font-semibold hover:underline">Forgot Password?</Link>
          </div>
        </div>

        <button type="submit" disabled={!isValid || isLoading} className={`w-full py-3 rounded-lg font-semibold text-sm text-white transition mt-4 ${isValid && !isLoading ? "bg-primary hover:bg-blue-700 shadow-lg cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
          {isLoading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}