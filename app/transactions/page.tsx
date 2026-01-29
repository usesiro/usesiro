"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowUpRightIcon, 
  WalletIcon, 
  CreditCardIcon, 
  ScaleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function Transactions() {
  const [currentPage, setCurrentPage] = useState(1);

  // Mock Data from your screenshot
  const transactions = [
    { description: "Payment from XYZ Ltd", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "POS", category: "Service" },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "Cash", category: "Interest" },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "POS", category: "Sales" },
    { description: "Fuel Purchase", amount: "7,980.00", type: "Expense", date: "07, Jan 2026", source: "Bank Transfer", category: "Utilities" },
    { description: "Internet Subscription", amount: "24,000.00", type: "Expense", date: "07, Jan 2026", source: "Bank Transfer", category: "Internet & Comm" },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "Cash", category: "Uncategorized" },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "Bank Transfer", category: "Sales" },
    { description: "Payment to Faruk", amount: "70,578.00", type: "Expense", date: "07, Jan 2026", source: "Bank Transfer", category: "Repairs" },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "Cash", category: "Sales" },
    { description: "Payment to Fathia", amount: "18,765.00", type: "Income", date: "07, Jan 2026", source: "Bank Transfer", category: "Salary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total Income</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 200,000.00</h3>
            <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
              <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
            </p>
          </div>

          {/* Expense */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total Expense</span>
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                <CreditCardIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 187,000.00</h3>
            <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
              <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
            </p>
          </div>

          {/* Net Balance */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Net Balance</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <ScaleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 13,000.00</h3>
            <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
              <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
            </p>
          </div>
        </div>

        {/* MAIN TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-dark mb-6">Transaction List</h2>

          {/* FILTERS TOOLBAR */}
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex flex-col md:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Type Dropdown */}
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>Type</option>
                  <option>Income</option>
                  <option>Expense</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Date Range Picker (Visual Only) */}
              <div className="relative w-full md:w-64">
                 <button className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-left text-gray-500 flex items-center justify-between">
                   <span>2026-01-20 &rarr; 2026-04-02</span>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                <PlusIcon className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold tracking-wide border-b border-gray-100">
                  <th className="py-4 px-4 rounded-tl-lg">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4 rounded-tr-lg">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="py-4 px-4 text-sm font-medium text-dark">{t.description}</td>
                    <td className="py-4 px-4 text-sm font-bold text-dark">{t.amount}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{t.type}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{t.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{t.source}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{t.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-end items-center mt-8 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition
                  ${currentPage === page 
                    ? "bg-blue-50 text-primary border border-blue-100" 
                    : "border border-gray-200 text-gray-500 hover:text-dark hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}