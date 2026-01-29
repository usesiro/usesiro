"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShieldCheckIcon, 
  WalletIcon, 
  TagIcon, 
  ExclamationCircleIcon 
} from "@heroicons/react/24/outline";

export default function TaxReadiness() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        
        {/* --- 1. HEADLINE SCORE CARD --- */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1">Tax Readiness Score</h2>
            <h1 className="text-4xl font-bold text-dark mb-2">43% Ready</h1>
            <p className="text-red-500 text-sm font-medium">
              Based on your recorded income, expenses, and categorization
            </p>
          </div>
          <div className="bg-red-50 text-red-500 p-3 rounded-full">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
        </div>

        {/* --- 2. DETAILED STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Income Recorded */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm font-medium">Income Recorded</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 536,000.00</h3>
            <p className="text-xs text-blue-500 font-medium">All income captured</p>
          </div>

          {/* Card 2: Expenses Categorized */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm font-medium">Expenses Categorized</span>
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                <TagIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">72%</h3>
            <p className="text-xs text-red-500 font-medium">Expenses assigned to valid tax categories</p>
          </div>

          {/* Card 3: Tax Gaps */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm font-medium">Tax Gaps</span>
              <div className="p-1.5 bg-red-50 text-red-800 rounded-lg">
                <ExclamationCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">3 Issues</h3>
            <p className="text-xs text-red-800 font-medium">Items affecting your tax readiness score</p>
          </div>
        </div>

        {/* --- 3. TAX SUMMARY (PREVIEW) --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-700">Tax Summary (Preview)</h2>
          </div>
          
          <div className="p-6 space-y-6">
            
            {/* Row 1 */}
            <div className="flex justify-between items-center py-4 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Total Income</span>
              <span className="text-dark font-bold">N 1,800,747.00</span>
            </div>

            {/* Row 2 */}
            <div className="flex justify-between items-center py-4 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Allowable Expense</span>
              <span className="text-dark font-bold">N 487,389.00</span>
            </div>

            {/* Row 3 */}
            <div className="flex justify-between items-center py-4 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Estimated Taxable Income</span>
              <span className="text-dark font-bold">N 1,387,339.00</span>
            </div>

            {/* Row 4 */}
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-600 font-medium">Estimated Tax Rate Applied</span>
              <span className="text-dark font-bold">N 184,300.00</span>
            </div>

            {/* Disclaimer Box */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center md:text-left">
              <p className="text-gray-500 font-bold text-sm">
                This is an estimate, not a final tax filing
              </p>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}