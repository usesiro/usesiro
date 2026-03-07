"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    topic: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValid = formData.fullName && formData.email && formData.topic && formData.message;

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white">
      <Navbar />

      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-semibold tracking-wide">Contact Us</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-fraunces font-bold text-gray-900 tracking-tight">
  We're a <span className="text-primary">message</span> away
</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: INFO CARDS */}
          <div className="lg:col-span-4 space-y-6" data-aos="fade-right" data-aos-delay="100">
            {/* Direct Channel Card */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Direct Channel</h3>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Support@loremipsum.com</span>
                </li>
                <li className="flex items-center gap-4 text-gray-600">
                  <EnvelopeIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Info@loremipsum.com</span>
                </li>
                <li className="flex items-center gap-4 text-gray-600">
                  <PhoneIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">+23400000000000</span>
                </li>
              </ul>
            </div>

            {/* Book a Demo Card */}
            <div className="bg-primary p-8 rounded-2xl text-white">
              <h3 className="font-bold text-lg mb-3">Book a Demo</h3>
              <p className="text-white/80 text-sm mb-8 leading-relaxed font-medium">
                Get a guided walkthrough of how the platform works
              </p>
              <button className="bg-white text-primary px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors w-max">
                Book a Demo
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM */}
          <div className="lg:col-span-8" data-aos="fade-left" data-aos-delay="200">
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 h-full">
              <h3 className="font-bold text-lg text-gray-900 mb-8">Send us a Message</h3>
              
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message Sent!"); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      type="text" 
                      placeholder="Enter Full Name" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors" 
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
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors" 
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
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm appearance-none text-gray-500 transition-colors"
                    >
                      <option value="">Select Topic</option>
                      <option value="inquiry">General Inquiry</option>
                      <option value="support">Technical Support</option>
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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none transition-colors"
                  ></textarea>
                </div>

                <div>
                  <button 
                    type="submit" 
                    disabled={!isValid} 
                    className={`px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-colors ${isValid ? "bg-primary hover:bg-blue-700 cursor-pointer" : "bg-primary/50 cursor-not-allowed"}`}
                  >
                    Submit
                  </button>
                </div>
              </form>
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