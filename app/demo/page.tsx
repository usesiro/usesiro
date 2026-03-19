"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InlineWidget } from "react-calendly";

export default function DemoPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        
        {/* HEADER */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-primary text-xs font-semibold tracking-wide">1-on-1 Walkthrough</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-fraunces font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]">
            See Siro in <span className="text-primary italic">action</span>
          </h1>
          
          <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Pick a time that works for you. We'll show you how Siro can automate your tax compliance and save you hours every month.
          </p>
        </div>

        {/* CALENDLY EMBED */}
        <div 
          className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden relative"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {/* The InlineWidget automatically handles loading states and responsiveness */}
          <InlineWidget 
            url="https://calendly.com/usesironow/30min" 
            styles={{ height: '700px', width: '100%' }}
            pageSettings={{
              backgroundColor: 'ffffff',
              hideEventTypeDetails: false,
              hideLandingPageDetails: false,
              primaryColor: '2F6EF6', // Matches your Siro primary blue
              textColor: '111827'
            }}
          />
        </div>

      </main>

      <Footer />
    </div>
  );
}