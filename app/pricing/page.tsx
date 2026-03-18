"use client";

import Navbar from "@/components/Navbar";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-primary selection:text-white">
      <Navbar />

      {/* --- PRICING HEADER --- */}
      <div className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6"
          data-aos="fade-up"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-xs font-semibold tracking-wide">Simple Pricing</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-fraunces font-bold text-gray-900 tracking-tight mb-6 leading-[1.15]">
          One plan.<br />
          <span className="text-primary">Everything</span> included.
        </h1>
        
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed font-medium" data-aos="fade-up" data-aos-delay="200">
          No hidden fees, no complicated tiers. Get everything you need to stay tax-ready from day one.
        </p>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Foundation */}
          <div className="border-2 border-primary bg-white rounded-3xl p-8 relative flex flex-col" data-aos="fade-up" data-aos-delay="300">
            <div className="absolute top-8 right-8 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">Available Now</div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Foundation</h3>
            <p className="text-xs font-bold text-primary tracking-wide mb-6 uppercase">BETA ACCESS</p>
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl py-3 px-4 mb-6 inline-block w-fit">
              <span className="text-xl font-bold text-primary">N 9,000.00</span>
              <span className="text-gray-500 text-sm font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {["Auto transaction capture", "Smart categorization", "VAT tagging", "VAT report export", "Tax readiness score"].map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 font-medium">{f}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3.5 border border-primary text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              Get Started <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Growth & Scale remain unchanged except for px-6 wrapper above */}
          <div className="border border-gray-200 bg-white/50 rounded-3xl p-8 relative flex flex-col opacity-80" data-aos="fade-up" data-aos-delay="400">
             <div className="absolute top-8 right-8 bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">Coming Soon</div>
             <h3 className="text-2xl font-bold text-gray-900 mb-1">Growth</h3>
             <p className="text-gray-400 text-sm mt-4">Advanced tools for scaling businesses.</p>
          </div>
          <div className="border border-gray-200 bg-white/50 rounded-3xl p-8 relative flex flex-col opacity-80" data-aos="fade-up" data-aos-delay="500">
             <div className="absolute top-8 right-8 bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">Coming Soon</div>
             <h3 className="text-2xl font-bold text-gray-900 mb-1">Scale</h3>
             <p className="text-gray-400 text-sm mt-4">Enterprise compliance for large teams.</p>
          </div>
        </div>
      </div>

      {/* --- TRUST / CANCEL ANYTIME (Straight line fix) --- */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-sm text-gray-500 font-medium mb-32 px-6 text-center" data-aos="fade-in">
        <div className="flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-bold whitespace-nowrap">No hidden fees.</span>
        </div>
        <span className="whitespace-nowrap">Cancel anytime. Your data is always yours.</span>
      </div>

      <div className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-fraunces font-bold text-gray-900 mb-4 tracking-tight">Everything in your plan, explained.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[{title: "Auto Sync", desc: "Securely link your bank."}, {title: "VAT Tags", desc: "Automated applicability review."}, {title: "Smart Sorting", desc: "AI-driven categorization."}, {title: "Reports", desc: "FIRS-ready exports."}].map((item, index) => (
              <div key={index} className="p-8 rounded-2xl border border-gray-100 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FAQ />
      <CallToAction />
      <Footer />
    </div>
  );
}