"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  DocumentMagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function Reconciliation() {
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- STATE FOR MODAL ---
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Mock Data
  const reconItems = [
    { id: 1, description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", status: "Uncategorized", issue: "Missing Category", risk: "Low" },
    { id: 2, description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "Cash", status: "Uncategorized", issue: "Missing Category", risk: "High" },
    { id: 3, description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", status: "Duplicate Alerts", issue: "Potential Duplicate", risk: "Low" },
    { id: 4, description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", status: "VAT Missing Flags", issue: "No VAT Detected", risk: "Low" },
    { id: 5, description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", status: "Uncategorized", issue: "Missing Category", risk: "Low" },
  ];

  // --- HANDLER ---
  const handleFixClick = (item: any) => {
    setSelectedTransaction(item);
    setIsDetailsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        
        {/* --- TOP STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Unmatched Transactions</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <DocumentMagnifyingGlassIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">5 to Review</h3>
            <p className="text-xs text-blue-500 font-medium">25% Higher Than Last Week</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Duplicate Alerts</span>
              <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg">
                <DocumentDuplicateIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">2 Alerts</h3>
            <p className="text-xs text-blue-500 font-medium">25% Higher Than Last Week</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm font-medium">Pending Documentation</span>
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">4 Pending</h3>
            <p className="text-xs text-blue-500 font-medium">25% Higher Than Last Week</p>
          </div>
        </div>

        {/* --- MAIN TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Pending Review</h2>

          {/* FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search" className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              {/* Dropdowns... */}
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>Source</option>
                  <option>POS</option>
                  <option>Bank</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><AdjustmentsHorizontalIcon className="w-4 h-4" /></div>
              </div>
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>Status</option>
                  <option>Uncategorized</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><AdjustmentsHorizontalIcon className="w-4 h-4" /></div>
              </div>
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"><ArrowDownTrayIcon className="w-4 h-4" /> Export</button>
               <button className="w-full md:w-auto px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-left text-gray-500 flex items-center justify-between gap-2"><span>2026-01-20 &rarr; 2026-04-02</span><CalendarIcon className="w-4 h-4" /></button>
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
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 rounded-tr-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reconItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{item.description}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-600">{item.amount}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{item.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{item.source}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.status}</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleFixClick(item)}
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
          
          {/* Pagination... */}
          <div className="flex justify-end items-center mt-8 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition"><ChevronLeftIcon className="w-4 h-4" /></button>
            {[1, 2, 3, 4, 5].map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-blue-50 text-primary border border-blue-100" : "border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>{page}</button>))}
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition"><ChevronRightIcon className="w-4 h-4" /></button>
          </div>
        </div>

        {/* --- TRANSACTION DETAILS MODAL (Now correctly placed here) --- */}
        {isDetailsModalOpen && selectedTransaction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-2xl w-full max-w-2xl p-0 animate-fade-in-up overflow-hidden max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Transaction Details</h3>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><XMarkIcon className="w-6 h-6" /></button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Top Summary Card */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-800">{selectedTransaction.source} Payment - {selectedTransaction.date}</span>
                    <span className="text-lg font-bold text-gray-800">₦ {selectedTransaction.amount}</span>
                  </div>
                  <p className="text-sm text-gray-500">Expense &gt;&gt; {selectedTransaction.description}</p>
                </div>

                {/* VAT Tag */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">VAT Tag</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary outline-none bg-white text-gray-700">
                    <option>None</option>
                    <option>7.5% (VAT)</option>
                    <option>5% (WHT)</option>
                  </select>
                </div>

                {/* Receipts */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-700">Receipts & Documents</label>
                    <button className="flex items-center gap-1 text-xs font-bold text-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                      <PlusIcon className="w-3 h-3" /> Attach File
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-gray-600">Invoice_12345.pdf</span>
                      </div>
                      <div className="flex gap-3 text-xs font-medium">
                        <button className="text-blue-500 hover:underline">View</button>
                        <button className="text-red-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reconciliation Status */}
                <div className="border border-green-100 bg-green-50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-green-800">Reconciliation Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Reconciled</span>
                  </div>
                </div>

                {/* Change History */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Change History</h4>
                  <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                    <div className="pl-4 relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300"></div>
                      <p className="text-xs text-gray-500 mb-0.5">07 Jan, 2026 - 10:42 AM</p>
                      <p className="text-sm text-gray-600">VAT Tag updated from "None" to "7.5% VAT" by Admin</p>
                    </div>
                  </div>
                </div>

                {/* Risk Flag */}
                {selectedTransaction.risk === "High" && (
                  <div className="border border-red-100 bg-red-50 rounded-xl p-4 flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-red-800">High Amount Alert</h4>
                      <p className="text-xs text-red-600 mt-1">This transaction is unusually large.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
                <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition">Cancel</button>
                <button className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition">Save Changes</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}