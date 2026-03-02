"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChevronDownIcon,
  StarIcon 
} from "@heroicons/react/24/solid"; 
import { useState } from "react";

export default function PricingPage() {
  
  const faqs = [
    { question: "Is my financial data safe?", answer: "Yes. All data is encrypted, and we don't access your bank transactions." },
    { question: "Is there customer support if I get stuck?", answer: "Absolutely. We offer 24/7 email support and live chat for Pro and Enterprise users." },
    { question: "Can I access the platform on mobile?", answer: "Yes, our dashboard is fully responsive and works great on all mobile devices." },
    { question: "Can I still add transactions manually?", answer: "Yes, you can manually add cash or other offline transactions easily." },
    { question: "How much does the platform cost?", answer: "We offer plans starting from N2,499/month. See above for details." },
    { question: "Can this help me file taxes automatically?", answer: "We provide tax readiness reports that make filing easy for your accountant." },
    { question: "Do I need a business name or shop to start?", answer: "No, freelancers and sole proprietors can use Siro just as effectively." },
  ];

  return (
    <main className="bg-white min-h-screen font-sans">
      <Navbar />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-6">
            <CheckCircleIcon className="w-5 h-5" />
            Zero hidden fees
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose the plan <br className="md:hidden" /> 
            for your <span className="text-blue-600">business.</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Enim commodo donec et leo. Lorem ipsum dolor sit amet consectetur. Enim commodo donec et leo.
          </p>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          
          {/* STARTER PLAN */}
          <div className="border border-gray-200 rounded-3xl p-8 hover:border-blue-200 hover:shadow-lg transition duration-300">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <StarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Starter</h3>
            <p className="text-xs font-bold text-blue-600 tracking-wide mb-6">BASIC TOOLS</p>
            
            <div className="bg-gray-50 rounded-xl py-3 px-4 mb-6 text-center">
              <span className="text-2xl font-bold text-gray-900">N 2,499.00</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed h-16">
              Perfect for newly registered businesses with low transaction volume trying to get organized.
            </p>

            <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">FEATURES</p>
              {[
                { text: "Auto transaction capture", included: true },
                { text: "Smart categorization", included: true },
                { text: "Income vs expense reports", included: true },
                { text: "VAT tagging (basic)", included: true },
                { text: "Monthly financial summary", included: true },
                { text: "Business health snapshot", included: true },
                { text: "Reconciliation engine", included: false },
                { text: "Accountant-ready export", included: false },
                { text: "Compliance checklist (dynamic)", included: false },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
              Get Started <span>&rarr;</span>
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="border border-blue-200 bg-white rounded-3xl p-8 shadow-xl relative transform md:-translate-y-4 z-10">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <div className="flex"><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4 -ml-1" /></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Pro</h3>
            <p className="text-xs font-bold text-blue-600 tracking-wide mb-6">MOST POPULAR</p>
            
            <div className="bg-gray-100 rounded-xl py-3 px-4 mb-6 text-center">
              <span className="text-2xl font-bold text-gray-900">N 5,499.00</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed h-16">
              Perfect for growing business with higher transaction volume preparing for the tax season seriously.
            </p>

            <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">FEATURES</p>
              {[
                { text: "Everything in Starter", included: true },
                { text: "Reconciliation engine", included: true },
                { text: "Tax readiness score", included: true },
                { text: "Accountant-ready export", included: true },
                { text: "Compliance checklist (dynamic)", included: true },
                { text: "Full audit trail log", included: false },
                { text: "Role-based access", included: false },
                { text: "Accountant-ready export", included: false },
                { text: "Risk scanner (anomaly detection)", included: false },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {feature.included ? (
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
              Get Started <span>&rarr;</span>
            </button>
          </div>

          {/* ENTERPRISE PLAN */}
          <div className="border border-gray-200 rounded-3xl p-8 hover:border-blue-200 hover:shadow-lg transition duration-300">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
              <div className="flex"><StarIcon className="w-3 h-3" /><StarIcon className="w-3 h-3 -ml-1" /><StarIcon className="w-3 h-3 -ml-1" /></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Enterprise</h3>
            <p className="text-xs font-bold text-blue-600 tracking-wide mb-6">EVERYTHING INCLUDED</p>
            
            <div className="bg-gray-50 rounded-xl py-3 px-4 mb-6 text-center">
              <span className="text-2xl font-bold text-gray-900">CUSTOM</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>

            <p className="text-gray-500 text-sm mb-8 leading-relaxed h-16">
              Perfect for large scale business expecting audits, have multi banks and multi user teams.
            </p>

            <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">FEATURES</p>
              {[
                { text: "Everything in Control", included: true },
                { text: "Full audit trail log", included: true },
                { text: "Role-based access", included: true },
                { text: "Accountant-ready export", included: true },
                { text: "Risk scanner (anomaly detection", included: true },
                { text: "Audit pack generator", included: true },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
              Talk to a Representative
            </button>
          </div>

        </div>

        {/* FAQ SECTION */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-center text-gray-500 mb-12">
            These are some of the questions that users frequently asks and we have answered them here
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
          
          {/* I REMOVED THE DUPLICATE SOCIAL LINKS HERE */}

        </div>
      </div>
      
      <Footer />
    </main>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-gray-900 text-sm">{question}</h4>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && (
        <p className="mt-3 text-sm text-gray-500 leading-relaxed animate-fade-in">
          {answer}
        </p>
      )}
    </div>
  );
}