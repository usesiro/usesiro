"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  ChevronDownIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    topic: "",
    message: ""
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValid = formData.fullName && formData.email && formData.topic && formData.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setStatus("success");
      setFormData({ fullName: "", email: "", topic: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white flex flex-col">
      <Navbar />

      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow">
        
        {/* HEADER */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-semibold tracking-wide">Contact Us</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-fraunces font-bold text-gray-900 tracking-tight">
            We're a <span className="text-primary italic">message</span> away
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: INFO CARDS */}
          <div className="lg:col-span-4 space-y-6" data-aos="fade-right" data-aos-delay="100">
            {/* Direct Channel Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Direct Channel</h3>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">info@usesiro.com</span>
                </li>
                <li className="flex items-center gap-4 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">usesironow@gmail.com</span>
                </li>
                <li className="flex items-center gap-4 text-gray-600">
                  <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">+234 902 886 7544</span>
                </li>
              </ul>
            </div>

            {/* Book a Demo Card */}
            <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
              <h3 className="font-bold text-lg mb-3">Book a Demo</h3>
              <p className="text-white/80 text-sm mb-8 leading-relaxed font-medium">
                Get a guided walkthrough of how the platform works and see how Siro can automate your tax compliance.
              </p>
              <button 
  data-cal-link="use-siro/30min"
  data-cal-config='{"layout":"month_view"}'
  className="bg-white text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors w-max inline-block shadow-sm"
>
  Book a Demo
</button>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="lg:col-span-8" data-aos="fade-left" data-aos-delay="200">
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm h-full hover:border-blue-100 transition-colors">
              
              {status === "success" ? (
                <div className="text-center py-12 px-4 animate-fade-in-up h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <CheckCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
                    Thanks for reaching out. Our team will get back to you shortly.
                  </p>
                  <button onClick={() => setStatus("idle")} className="text-primary font-bold text-sm hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-lg text-gray-900 mb-8">Send us a Message</h3>
                  
                  {status === "error" && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl mb-6">
                      {errorMessage}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                          name="fullName" 
                          value={formData.fullName} 
                          onChange={handleChange} 
                          type="text" 
                          placeholder="Enter Full Name" 
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white text-sm transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          type="email" 
                          placeholder="Enter Email" 
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white text-sm transition-colors" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                      <div className="relative">
                        <select 
                          name="topic" 
                          value={formData.topic} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white text-sm appearance-none text-gray-500 transition-colors"
                        >
                          <option value="">Enquiries</option>
                          <option value="waitlist">Waitlist Questions</option>
                          <option value="support">Technical Support</option>
                          <option value="partnership">Partnerships</option>
                        </select>
                        <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                      <textarea 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange} 
                        placeholder="How Can We Help" 
                        rows={6} 
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white text-sm resize-none transition-colors"
                      ></textarea>
                    </div>

                    <div>
                      <button 
                        type="submit" 
                        disabled={!isValid || status === "submitting"} 
                        className={`px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-colors shadow-sm ${(!isValid || status === "submitting") ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-blue-700 cursor-pointer shadow-blue-500/30"}`}
                      >
                        {status === "submitting" ? "Sending..." : "Submit"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* IMPORTED SECTIONS */}
      <FAQ />
      <Footer />
    </div>
  );
}