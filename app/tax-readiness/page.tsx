"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  WalletIcon, 
  TagIcon, 
  ExclamationCircleIcon,
  ReceiptPercentIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function TaxReadiness() {

  const transactions = [
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: true },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: false },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "Missing VAT", docStatus: "Document", docValid: false },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "Missing VAT", docStatus: "Document", docValid: true },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: true },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: true },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: false },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: true },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "Missing VAT", docStatus: "Document", docValid: true },
    { description: "Payment from XYZ Ltd", amount: "18,765.00", date: "07,Jan 2026", source: "POS", vatStatus: "VAT tagged", docStatus: "Document", docValid: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* --- TOP SECTION: 3 COLUMNS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* COLUMN 1: Equal Halves */}
          <div className="grid grid-rows-2 gap-6">
            
            {/* 1. Income Recorded */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm font-medium">Income Recorded</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">N 5,679,000.00</h3>
              <p className="text-xs text-blue-500 font-medium">All income captured</p>
            </div>

            {/* 4. VAT Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-500 text-sm font-medium">VAT Breakdown</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <ReceiptPercentIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-4 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">VAT Payable</span>
                  <span className="font-bold text-gray-800">- N450,000.00</span>
                </div>
                <div className="border-t border-gray-50 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Output VAT</span>
                  <span className="font-bold text-gray-800">- N700,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Input VAT</span>
                  <span className="font-bold text-gray-800">- N250,000.00</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: Equal Halves */}
          <div className="grid grid-rows-2 gap-6">
            
            {/* 2. Expenses Categorized */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm font-medium">Expenses Categorized</span>
                <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                  <TagIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">N 2,698,000.00</h3>
              <p className="text-xs text-red-500 font-medium">Expenses assigned to valid tax categories</p>
            </div>

            {/* 5. Compliance Checklist */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-6">
                <span className="text-gray-500 text-sm font-medium">Compliance Checklist</span>
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Income properly categorized</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Transactions properly documented</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Expense properly categorized</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Transactions properly VAT tagged</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 3: Unequal Split (2/3 and 1/3) */}
          <div className="grid grid-rows-[2fr_1fr] gap-6">
            
            {/* 3. Tax Gaps - 2/3 Height */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-start">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-sm font-medium">Tax Gaps</span>
                <div className="p-1.5 bg-red-50 text-red-800 rounded-full">
                  <ExclamationCircleIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">7 Issues</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                  3 Missing VAT tag
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                  2 Expense not categorized
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                  2 Expense not categorized
                </div>
              </div>
            </div>

            {/* 6. Tax Readiness Score - 1/3 Height */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-sm font-medium">Tax Readiness Score</span>
                <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-3">56%</h3>
              <div className="w-full h-4 bg-green-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-700 rounded-full" style={{ width: '56%' }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* --- BOTTOM SECTION: TAX SUMMARY TABLE --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-6">Tax Summary</h2>

          {/* Filters */}
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
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative w-full md:w-40">
                <select className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white text-gray-500">
                  <option>VAT Status</option>
                  <option>Tagged</option>
                  <option>Missing</option>
                </select>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                 <ArrowDownTrayIcon className="w-4 h-4" /> Export
               </button>
               <button className="w-full md:w-auto px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-left text-gray-500 flex items-center justify-between gap-2">
                 <span>2026-01-20 &rarr; 2026-04-02</span>
                 <CalendarIcon className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-600 text-xs font-bold tracking-wide border-b border-gray-100">
                  <th className="py-4 px-4 rounded-tl-lg">Description</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Source</th>
                  <th className="py-4 px-4">VAT Status</th>
                  <th className="py-4 px-4 rounded-tr-lg">Documentation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition duration-150">
                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{t.description}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-700">{t.amount}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{t.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{t.source}</td>
                    <td className="py-4 px-4">
                      {t.vatStatus === "Missing VAT" ? (
                        <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-md">Missing VAT</span>
                      ) : (
                        <span className="text-sm text-gray-700 font-medium">{t.vatStatus}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {t.docValid ? (
                          <div className="bg-green-500 rounded-full p-0.5"><CheckIcon className="w-3 h-3 text-white" /></div>
                        ) : (
                          <div className="bg-red-500 rounded-full p-0.5"><XMarkIcon className="w-3 h-3 text-white" /></div>
                        )}
                        <span className="text-sm text-gray-700 font-medium">{t.docStatus}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center mt-8 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button key={page} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 text-sm hover:border-primary hover:text-primary transition">
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