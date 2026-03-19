"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import FAQ from "@/components/FAQ";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";

export default function PricingPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans selection:bg-primary selection:text-white flex flex-col">
      <Navbar />

      {/* --- PRICING HEADER --- */}
      <div className="pt-32 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 mb-6"
          data-aos="fade-up"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary text-xs font-semibold tracking-wide">Simple Pricing</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-fraunces font-bold text-gray-900 tracking-tight mb-6 leading-[1.15]">
          One plan.<br />
          <span className="text-primary italic">Everything</span> included.
        </h1>
        
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed" data-aos="fade-up" data-aos-delay="100">
          No hidden fees, no complicated tiers. Get everything you need to stay tax-ready from day one.
        </p>
      </div>

      {/* --- SINGLE PRICING CARD --- */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 mb-8 w-full" data-aos="fade-up" data-aos-delay="200">
        <div className="border-2 border-primary bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-blue-500/5 flex flex-col">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl mb-4"></div>
              <h3 className="text-3xl font-semibold text-gray-900 mb-1">Beta Plan</h3>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase">FULL ACCESS • ALL FEATURES</p>
            </div>
            <div className="text-left md:text-right">
              <span className="text-5xl font-fraunces font-bold text-primary block mb-1">₦9,000</span>
              <span className="text-gray-500 text-sm">per month</span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100">
            Everything your business needs to stay tax-ready. Automatic bank sync, VAT tagging, categorization, reconciliation, and clean NRS-compliant reports. No limits, no upgrades required.
          </p>

          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">WHAT'S INCLUDED</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10">
            {[
              "Automatic transaction sync", 
              "VAT tagging",
              "Smart categorization", 
              "Manual transaction entry",
              "VAT report export (PDF & CSV)", 
              "Customer support",
              "Transaction reconciliation", 
              "Compliance dashboard",
              "Tax readiness score",
              "Unlimited historical data"
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/waitlist" className="w-full md:w-2/3 mx-auto py-4 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-500/30">
            Join the waitlist
          </Link>
        </div>
      </div>

      {/* --- TRUST / CANCEL ANYTIME --- */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-sm text-gray-500 mb-32 px-6 text-center" data-aos="fade-in">
        <div className="flex items-center gap-2">
          <LockClosedIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-semibold whitespace-nowrap">No hidden fees.</span>
        </div>
        <span className="whitespace-nowrap">Cancel anytime. Your data is always yours.</span>
      </div>

      {/* --- EVERYTHING EXPLAINED (6 Cards) --- */}
      <div className="bg-white py-20 md:py-32 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-4">FOUNDATION PLAN</div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-fraunces font-bold text-gray-900 mb-4 tracking-tight">Everything in your plan, explained.</h2>
            <p className="text-gray-500">No surprises. Here's exactly what you get from day one.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {title: "Automatic Transaction Sync", desc: "Connect your bank account securely. Transactions pull in automatically on a weekly basis, with manual sync available anytime."}, 
              {title: "VAT Tagging", desc: "Every transaction is reviewed for VAT applicability. You see exactly what you've collected and what you owe."}, 
              {title: "Smart Categorization", desc: "Income and expenses are automatically sorted. Review, correct, and confirm with a single click."}, 
              {title: "Reconciliation", desc: "Match your transactions against records and flag any discrepancies before they become compliance issues."},
              {title: "VAT Report Export", desc: "Generate a clean, NRS-ready VAT report in seconds. Download and file without the last-minute scramble."},
              {title: "Manual Transactions", desc: "Add cash sales, POS settlements, and any transaction that doesn't go through your bank account."}
            ].map((item, index) => (
              <div key={index} className="p-8 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 transition-colors" data-aos="fade-up" data-aos-delay={index * 50}>
                <div className="w-10 h-10 bg-blue-50 rounded-full mb-6"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
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