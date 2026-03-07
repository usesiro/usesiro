"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout"; // Import the layout
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// --- DUMMY DATA ---
const faqs = {
  "Getting Started": [
    { question: "Is my financial data safe?", answer: "Yes. All data is encrypted, and we don't access your bank transactions." },
    { question: "Can I still add transactions manually?", answer: "Yes, you can easily add manual transactions via the dashboard." },
    { question: "Can this help me file taxes automatically?", answer: "We prepare reports that make filing seamless for you or your accountant." }
  ],
  "Connecting your Bank Account": [
    { question: "How do I link my business account?", answer: "Navigate to Settings > Bank Accounts and follow the prompts to authenticate securely." },
    { question: "Which banks are supported?", answer: "We support all major Nigerian banks through our secure open-banking partner." },
  ],
  "Troubleshooting": [
    { question: "Why didn't my recent transaction show up?", answer: "Transactions sync every 24 hours. You can force a manual sync from the Transactions tab." },
    { question: "I categorized something wrong, how do I fix it?", answer: "Go to the Transactions list, click the transaction, and select a new category from the dropdown." },
  ]
};

const tabs = ["All Topics", "Getting Started", "Connecting Bank Account", "Troubleshooting"];

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState("All Topics");
  const [openFaq, setOpenFaq] = useState<string | null>("Getting Started-0"); 

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="pb-12 max-w-7xl mx-auto">
        
        {/* --- BLUE SEARCH BANNER --- */}
        <div className="bg-[#4F75FF] rounded-3xl p-10 md:p-14 text-center mb-8 shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            How can we help you?
          </h2>
          <p className="text-blue-100 mb-8 font-medium">
            Search our help articles or browse by topic below
          </p>
          
          <div className="max-w-2xl mx-auto relative flex items-center bg-white rounded-xl p-1.5 shadow-md">
            <div className="pl-4 text-gray-400">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="e.g How do i connect my bank account?" 
              className="w-full px-4 py-3 bg-transparent focus:outline-none text-gray-700 text-sm"
            />
            <button className="bg-[#4F75FF] text-white px-8 py-3 rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex flex-wrap gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                activeTab === tab 
                  ? "bg-[#4F75FF] text-white border-[#4F75FF]" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: FAQ Sections */}
          <div className="lg:col-span-8 space-y-10">
            {Object.entries(faqs).map(([category, items]) => {
              if (activeTab !== "All Topics" && !category.includes(activeTab.split(' ')[0])) return null;

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100"></div>
                    <h3 className="font-bold text-gray-900 text-lg">{category}</h3>
                  </div>

                  {/* FAQ Items */}
                  <div className="space-y-3">
                    {items.map((faq, index) => {
                      const id = `${category}-${index}`;
                      const isOpen = openFaq === id;
                      return (
                        <div 
                          key={index} 
                          className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:border-gray-200 transition-colors"
                          onClick={() => toggleFaq(id)}
                        >
                          <div className="flex justify-between items-center gap-4">
                            <h4 className="font-bold text-gray-900 text-sm">{faq.question}</h4>
                            {isOpen ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          {isOpen && (
                            <p className="mt-4 text-sm text-gray-500 leading-relaxed pr-8 animate-in fade-in slide-in-from-top-2 duration-200">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Contact Form & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </p>

              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Message Sent!"); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" placeholder="Enter Full Name" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#4F75FF] focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" placeholder="Enter Email" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#4F75FF] focus:bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#4F75FF] focus:bg-white transition-colors appearance-none text-gray-500">
                      <option>Enquiries</option>
                      <option>Technical Support</option>
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Message</label>
                  <textarea rows={4} placeholder="How Can We Help" className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#4F75FF] focus:bg-white transition-colors resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-[#4F75FF] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors mt-2">
                  Submit
                </button>
              </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Common Quick Actions</h3>
              <div className="space-y-4">
                {[
                  "Connect Bank Account",
                  "Export VAT Report",
                  "Add Manual Transaction"
                ].map((action, idx) => (
                  <div key={idx} className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 -ml-2 rounded-xl transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0 group-hover:bg-blue-100 transition-colors"></div>
                    <span className="text-sm font-bold text-gray-900">{action}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}