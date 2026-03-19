"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    businessName: "",
    businessType: "",
    state: "",
    referralSource: ""
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValid = formData.fullName && formData.email && formData.businessName && formData.businessType && formData.state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white flex flex-col">
      
      {/* --- MINIMAL HEADER --- */}
      <nav className="w-full h-24 flex items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto">
        <Link href="/">
          <Image src="/logo.png" width={80} height={34} alt="Siro Logo" className="object-contain" />
        </Link>
        <Link 
          href="/" 
          className="text-gray-500 hover:text-gray-900 text-sm font-medium border-b border-gray-300 hover:border-gray-900 pb-0.5 transition-colors"
        >
          &larr; Back to home
        </Link>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Hero Text */}
        <div className="text-center max-w-2xl mx-auto mt-8 mb-12" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-semibold tracking-wide">Beta coming soon</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-fraunces font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]">
            Get early access <br className="hidden md:block" />
            to <span className="text-primary italic">Siro.</span>
          </h1>
          
          <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-xl mx-auto">
            No more tax season scrambles. Join the waitlist and be among the first Nigerian businesses to go fully tax-ready.
          </p>
        </div>

        {/* Form Container */}
        <div 
          className="bg-white w-full max-w-3xl p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {status === "success" ? (
            <div className="text-center py-12 px-4 animate-fade-in-up">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-fraunces font-bold text-gray-900 mb-4">You're on the list!</h3>
              <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
                Keep an eye on <strong>{formData.email}</strong>. We've sent a confirmation email and will reach out the moment your spot opens up.
              </p>
              <button onClick={() => setStatus("idle")} className="text-primary font-bold text-sm hover:underline">
                Submit another response
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-xl text-gray-900 mb-8">Fill the form to join the waitlist</h3>
              
              {status === "error" && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl mb-6">
                  {errorMessage}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                    <input name="fullName" required value={formData.fullName} onChange={handleChange} type="text" placeholder="Enter Full Name" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                    <input name="email" required value={formData.email} onChange={handleChange} type="email" placeholder="Enter Email" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors" />
                  </div>
                </div>

                {/* Row 2: Business Name (Full Width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Business Name</label>
                  <input name="businessName" required value={formData.businessName} onChange={handleChange} type="text" placeholder="Enter Business Name" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors" />
                </div>

                {/* Row 3: Business Type & State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Business Type</label>
                    <div className="relative">
                      <select name="businessType" required value={formData.businessType} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none text-gray-500 transition-colors">
                        <option value="">Select Type</option>
                        <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                        <option value="PARTNERSHIP">Partnership</option>
                        <option value="LIMITED_LIABILITY">Limited Liability (LLC)</option>
                      </select>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">State</label>
                    <div className="relative">
                       {/* You can replace this with a proper dropdown of Nigerian states if you prefer */}
                      <select name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none text-gray-500 transition-colors">
                        <option value="">Select State</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja (FCT)</option>
                        <option value="Oyo">Oyo</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Kano">Kano</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Referral Source (Full Width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">How Did You Hear About Siro</label>
                  <div className="relative">
                    <select name="referralSource" value={formData.referralSource} onChange={handleChange} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none text-gray-500 transition-colors">
                      <option value="">Select One</option>
                      <option value="TWITTER">Twitter / X</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="FRIEND">Word of Mouth</option>
                      <option value="SEARCH">Google Search</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={!isValid || status === "submitting"} 
                    className={`px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-colors w-full sm:w-auto shadow-sm ${(!isValid || status === "submitting") ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-blue-700 shadow-blue-500/30"}`}
                  >
                    {status === "submitting" ? "Joining waitlist..." : "Join the waitlist"}
                  </button>
                </div>

              </form>
            </>
          )}
        </div>
      </main>

    </div>
  );
}