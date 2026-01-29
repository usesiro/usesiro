"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  CpuChipIcon, 
  LinkIcon, 
  ExclamationCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckCircleIcon,
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

export default function Automation() {
  
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // New state for success message

  // Mock Categories
  const categories = ["Sales", "Utilities", "Salary", "Repairs", "Logistics", "Internet & Comm"];
  
  // Mock Data
  const pendingTransactions = Array(10).fill(null).map((_, i) => ({
    id: i,
    description: "Payment from XYZ Ltd",
    amount: "18,765.00",
    date: "07,Jan 2026",
    source: "POS",
    status: "Uncategorized"
  }));

  // --- ACTIONS ---
  const handleFixClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
    setSelectedCategory("");
    setIsSuccess(false); // Reset success state when opening
  };

  const handleSubmit = () => {
    if (!selectedCategory) return; // Prevent empty submit
    
    // 1. Show Success State
    setIsSuccess(true);

    // 2. Close Modal automatically after 1.5 seconds
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSuccess(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        
        {/* --- TOP STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Automation Coverage</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <CpuChipIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">68%</h3>
            <p className="text-xs text-blue-500 font-medium">Automatically Captured Transactions</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Connected Sources</span>
              <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">2 Active</h3>
            <p className="text-xs text-blue-500 font-medium">Bank & Alerts Connected</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Action Required</span>
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                <ExclamationCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-dark mb-1">17 Transactions</h3>
            <p className="text-xs text-red-500 font-medium">Needs Review or Categorization</p>
          </div>
        </div>

        {/* --- AUTOMATION METHODS --- */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4 px-1">Automation Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-dark mb-6">Bank Integration</h3>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">Connected</span>
                    <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <p className="text-sm text-gray-500 font-medium">Details:</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Sync</span>
                    <span className="text-gray-600">Today, 10:42AM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Coverage</span>
                    <span className="text-gray-600">52%</span>
                  </div>
                </div>
              </div>
              <button className="bg-primary text-white text-sm font-medium py-2 px-6 rounded-lg w-fit hover:bg-blue-700 transition">
                Manage
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-dark mb-6">Email Forwarding</h3>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">Connected</span>
                    <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <p className="text-sm text-gray-500 font-medium">Details:</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Sync</span>
                    <span className="text-gray-600">Today, 10:42AM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Coverage</span>
                    <span className="text-gray-600">30%</span>
                  </div>
                </div>
              </div>
              <button className="bg-primary text-white text-sm font-medium py-2 px-6 rounded-lg w-fit hover:bg-blue-700 transition">
                Manage
              </button>
            </div>

            <button className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary hover:text-primary hover:bg-blue-50/30 transition h-full min-h-[300px] md:min-h-0">
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                <PlusIcon className="w-8 h-8" />
              </div>
              <span className="font-medium">Add Automation Method</span>
            </button>
          </div>
        </div>

        {/* --- PENDING REVIEW TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Pending Review</h2>

          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>Source</option>
                  <option>POS</option>
                  <option>Bank</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>Status</option>
                  <option>Uncategorized</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="relative w-full md:w-64">
               <button className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-left text-gray-500 flex items-center justify-between">
                 <span>2026-01-20 &rarr; 2026-04-02</span>
                 <CalendarIcon className="w-4 h-4" />
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold tracking-wide border-b border-gray-100">
                  <th className="py-4 px-4 rounded-tl-lg">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4 rounded-tr-lg text-right md:text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingTransactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition duration-150 group">
                    <td className="py-4 px-4 text-sm font-medium text-dark">{t.description}</td>
                    <td className="py-4 px-4 text-sm font-bold text-dark">{t.amount}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{t.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{t.source}</td>
                    <td className="py-4 px-4 flex items-center justify-end md:justify-start gap-4">
                      <span className="text-sm text-gray-500">{t.status}</span>
                      <button 
                        onClick={() => handleFixClick(t)} 
                        className="bg-red-50 text-red-500 text-xs font-bold px-4 py-1.5 rounded-md hover:bg-red-100 transition"
                      >
                        Fix
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center mt-8 gap-2">
            {[1, 2, 3, 4, 5].map((page) => (
               <button key={page} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 text-sm hover:border-primary hover:text-primary transition">
                 {page}
               </button>
            ))}
          </div>
        </div>

        {/* --- MODAL POPUP --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            
            {/* Darker Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fade-in-up">
              
              {/* SUCCESS STATE (Visible only after Submit) */}
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 animate-bounce">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">Categorized Successfully!</h3>
                    <p className="text-gray-500 mt-1">The transaction has been updated.</p>
                  </div>
                </div>
              ) : (
                
                /* INPUT STATE (Visible by default) */
                <>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-bold text-dark">Uncategorized Transaction</h3>
                     <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                       <XMarkIcon className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="space-y-6">
                    {/* Info Block */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm space-y-2">
                       <div className="flex justify-between">
                         <span className="text-gray-500 font-medium">Description</span>
                         <span className="text-dark font-bold">{selectedTransaction?.description}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-500 font-medium">Amount</span>
                         <span className="text-dark font-bold">{selectedTransaction?.amount}</span>
                       </div>
                    </div>

                    {/* Clean Dropdown */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <div className="relative">
                        <select 
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-blue-50 outline-none appearance-none bg-white text-dark transition-all cursor-pointer"
                        >
                          <option value="" disabled>Select Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <ChevronDownIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      onClick={handleSubmit}
                      className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}