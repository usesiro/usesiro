"use client";

import Navbar from "@/components/Navbar";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function PricingPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white">
      <Navbar />

      {/* --- PRICING HEADER --- */}
      <div className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6"
          data-aos="fade-up"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-xs font-semibold tracking-wide">Simple Pricing</span>
        </div>
        
        <h1 
  className="text-5xl md:text-6xl lg:text-7xl font-fraunces font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]"
  data-aos="fade-up"
  data-aos-delay="100"
>
  One plan.<br />
  <span className="text-primary">Everything</span> included.
</h1>
        
        <p 
          className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed font-medium"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          No hidden fees, no complicated tiers. Get everything you need to stay tax-ready from day one.
        </p>
      </div>

      {/* --- PRICING CARDS GRID --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. FOUNDATION PLAN (ACTIVE) */}
          <div 
            className="border-2 border-primary bg-white rounded-3xl p-8 relative flex flex-col"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {/* Badge */}
            <div className="absolute top-8 right-8 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              Available Now
            </div>

            <div className="w-12 h-12 bg-blue-50 rounded-xl mb-6"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Foundation</h3>
            <p className="text-xs font-bold text-primary tracking-wide mb-6 uppercase">BETA ACCESS</p>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl py-3 px-4 mb-6 inline-block w-fit">
              <span className="text-xl font-bold text-primary">N 9,000.00</span>
              <span className="text-gray-500 text-sm font-medium">/month</span>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed h-14">
              Everything a growing Nigerian business needs to stay organized and tax-compliant all year round.
            </p>

            <div className="flex-grow">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">WHAT'S INCLUDED</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Auto transaction capture",
                  "Smart categorization",
                  "VAT tagging",
                  "Transaction reconciliation",
                  "VAT report export",
                  "Manual transaction entry",
                  "Tax readiness score",
                  "Compliance dashboard",
                  "Customer support"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full py-3.5 border border-primary text-primary font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-auto">
              Get Started <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* 2. GROWTH PLAN (COMING SOON) */}
          <div 
            className="border border-gray-200 bg-white/50 rounded-3xl p-8 relative flex flex-col opacity-80"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="absolute top-8 right-8 bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              Coming Soon
            </div>

            <div className="w-12 h-12 bg-gray-100 rounded-xl mb-6"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Growth</h3>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-6 uppercase">FOR SCALING BUSINESSES</p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-6 mb-6 inline-block w-fit">
              <span className="text-xl font-bold text-gray-900">-</span>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed h-14">
              For businesses with higher transaction volumes that need deeper compliance and reporting tools.
            </p>

            <div className="flex-grow">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">WHAT'S INCLUDED</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Everything in Foundation",
                  "Advanced reconciliation",
                  "Accountant - ready export",
                  "Compliance Checklist",
                  "Multi bank accounts",
                  "Priority support"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full py-3.5 border border-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed mt-auto">
              Coming Soon
            </button>
          </div>

          {/* 3. SCALE PLAN (COMING SOON) */}
          <div 
            className="border border-gray-200 bg-white/50 rounded-3xl p-8 relative flex flex-col opacity-80"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <div className="absolute top-8 right-8 bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
              Coming Soon
            </div>

            <div className="w-12 h-12 bg-gray-100 rounded-xl mb-6"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Scale</h3>
            <p className="text-xs font-bold text-gray-400 tracking-wide mb-6 uppercase">FOR LARGE BUSINESSES</p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 mb-6 inline-block w-fit">
              <span className="text-xl font-bold text-gray-900">Custom</span>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed h-14">
              For large businesses expecting audits, with multi-bank accounts and multi-user team access.
            </p>

            <div className="flex-grow">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">WHAT'S INCLUDED</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Everything in Growth",
                  "Audit trail log",
                  "Role based access",
                  "Audit pack generator",
                  "Dedicated account manager"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full py-3.5 border border-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed mt-auto">
              Coming Soon
            </button>
          </div>

        </div>
      </div>

      {/* --- TRUST / CANCEL ANYTIME --- */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium mb-32" data-aos="fade-in">
        <LockClosedIcon className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-bold">No hidden fees.</span> Cancel anytime. Your data is always yours.
      </div>

      {/* --- PLAN EXPLAINED SECTION --- */}
      <div className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16" data-aos="fade-up">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">FOUNDATION PLAN</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-fraunces font-bold text-gray-900 mb-4 tracking-tight">
  Everything in your plan, explained.
</h2>
            <p className="text-gray-500 text-lg font-medium">
              No surprises. Here's exactly what you get from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Automatic Transaction Sync",
                desc: "Connect your bank account securely. Transactions pull in automatically on a weekly basis, with manual sync available anytime."
              },
              {
                title: "VAT Tagging",
                desc: "Every transaction is reviewed for VAT applicability. You see exactly what you've collected and what you owe."
              },
              {
                title: "Smart Categorization",
                desc: "Income and expenses are automatically sorted. Review, correct, and confirm with a single click."
              },
              {
                title: "Reconciliation",
                desc: "Match your transactions against records and flag any discrepancies before they become compliance issues."
              },
              {
                title: "VAT Report Export",
                desc: "Generate a clean, NRS-ready VAT report in seconds. Download and file without the last-minute scramble."
              },
              {
                title: "Manual Transactions",
                desc: "Add cash sales, POS settlements, and any transaction that doesn't go through your bank account."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl border border-gray-100 bg-white"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-12 h-12 bg-gray-50 rounded-full mb-6"></div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- IMPORTED SECTIONS --- */}
      <FAQ />
      <CallToAction />
      <Footer />
      
    </div>
  );
}