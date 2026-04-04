"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { ShieldExclamationIcon, EnvelopeIcon, LockClosedIcon, UserIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function AdminSetupClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      // Redirect to Admin OTP verification instead of login
      router.push(`/admin/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leftContent = {
    title: "Genesis System Initialization",
    description: "The platform has detected zero administrative accounts. Create the first SuperAdmin to unlock the master dashboard.",
    icon: <ShieldExclamationIcon className="w-48 h-48 text-white opacity-20" />
  };

  return (
    <AuthLayout leftContent={leftContent}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-md">First Signup Permitted</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Initialize SuperAdmin</h1>
        <p className="text-gray-500 text-sm font-medium">Configure the root authority for Siro Tech.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
              <div className="relative">
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  required
                  type="text" 
                  value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Admin" 
                  className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-gray-900 bg-gray-50/50 transition-all font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
              <input 
                required
                type="text" 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="User" 
                className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-gray-900 bg-gray-50/50 transition-all font-medium"
              />
            </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Admin Email</label>
          <div className="relative">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              required
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••••••" 
              className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-gray-900 bg-gray-50/50 transition-all font-mono"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-4 bg-primary hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 mt-4 active:scale-[0.98]"
        >
          {loading ? "Establishing Authority..." : "Initialize SuperAdmin"}
        </button>
      </form>
    </AuthLayout>
  );
}
