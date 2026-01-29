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

export default function Contact() {
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
    <main className="bg-white">
      <Navbar />

      {/* Reduced bottom padding to pull FAQ closer */}
      <section className="pt-32 pb-10 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          
          {/* HEADER */}
          <div className="text-center mb-16">
             {/* Increased margin-bottom to mb-10 */}
            <div className="inline-block bg-blue-50 text-primary px-6 py-2 rounded-full text-sm font-bold mb-10">
              Contact Us
            </div>
            <h1 className="text-4xl font-bold text-dark">
              Get in <span className="text-primary">Touch</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: INFO CARDS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-dark mb-6">Direct Channel</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Support@loremipsum.com</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Info@loremipsum.com</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                      <PhoneIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">+23400000000000</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary p-8 rounded-3xl text-white shadow-lg shadow-blue-500/20">
                <h3 className="font-bold text-lg mb-2">Book a Demo</h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Get a guided walkthrough of how the platform works
                </p>
                <button className="bg-white text-primary px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition">
                  Book a Demo
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: FORM */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm h-full">
                <h3 className="font-bold text-lg text-dark mb-8">Send us a Message</h3>
                
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message Sent!"); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-dark mb-2">Full Name</label>
                      <input name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="Enter Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-dark mb-2">Email</label>
                      <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter Email" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-dark mb-2">Topic</label>
                    <div className="relative">
                      <select name="topic" value={formData.topic} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary text-sm appearance-none text-gray-500">
                        <option value="">Select Topic</option>
                        <option value="inquiry">General Inquiry</option>
                        <option value="support">Technical Support</option>
                      </select>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-dark mb-2">Your Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} placeholder="How Can We Help" rows={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"></textarea>
                  </div>

                  <div>
                    <button type="submit" disabled={!isValid} className={`px-8 py-3 rounded-xl font-bold text-sm text-white transition duration-200 ${isValid ? "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30 cursor-pointer" : "bg-primary opacity-50 cursor-not-allowed"}`}>
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pull FAQ closer with negative margin */}
      <div className="-mt-0">
        <FAQ />
      </div>

      <Footer />
    </main>
  );
}