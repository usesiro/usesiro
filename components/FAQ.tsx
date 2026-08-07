"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "What exactly is Siro?",
    answer: "Siro is a tax compliance platform for Nigerian businesses. It connects to your bank account, automatically pulls your transactions, helps you tag your VAT, categorizes your income and expenses, and generates a clean NRS compliant report so when the NRS comes, your records are already ready. It is not an accounting software or a tax filing tool."
  },
  {
    question: "Is my financial data safe with Siro?",
    answer: "Yes. All data is encrypted and we connect to your bank through regulated open banking infrastructure. We have read only access. We cannot move money or make any changes to your account."
  },
  {
    question: "What types of businesses is Siro built for?",
    answer: "Siro is built for Nigerian businesses like retailers, hotels, restaurants, lounges, pharmacies, service providers, logistics companies, and more. If your business has regular transactions and tax obligations, Siro is for you."
  },
  {
    question: "What happens to my records if I join Siro after the year has started?",
    answer: "Upload a CSV, XLSX, or digital PDF statement for the period you want to review. Direct bank syncing is still being prepared."
  },
  {
    question: "Can I still add transactions manually?",
    answer: "Yes! While we focus on automation, you can easily add cash transactions or manual entries for anything that does not go through your bank."
  },
  {
    question: "Does access renew automatically?",
    answer: "No. The current beta payment gives you 30 days of access and does not renew automatically."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div 
          className="text-center max-w-2xl mx-auto mb-16"
          data-aos="fade-up"
        >
          <div className="text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-fraunces font-bold text-gray-900 mb-4 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            These are some of the questions that users frequently ask and we have answered them here.
          </p>
        </div>

        {/* FAQ GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="border border-gray-100 rounded-2xl p-6 transition-colors duration-200 cursor-pointer bg-white hover:border-gray-200"
              onClick={() => toggleFAQ(index)}
            >
              <button 
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className={`text-base font-semibold pr-4 transition-colors ${
                  openIndex === index ? "text-primary" : "text-gray-900"
                }`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUpIcon className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {/* Answer */}
              {openIndex === index && (
                <div className="mt-3 text-gray-500 text-sm leading-relaxed animate-in fade-in duration-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
