"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowUpRightIcon, 
  ArrowDownTrayIcon,
  WalletIcon,
  CreditCardIcon,
  ScaleIcon,
  ShieldCheckIcon,
  DocumentTextIcon, // Changed icon for Documentation
  ExclamationTriangleIcon, // Changed icon for Compliance
  MapPinIcon // Used for Reconciliation
} from "@heroicons/react/24/outline";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  
  const chartData = [
    { name: 'Jan', income: 40, expense: 25 },
    { name: 'Feb', income: 35, expense: 40 },
    { name: 'Mar', income: 45, expense: 20 },
    { name: 'Apr', income: 30, expense: 45 },
    { name: 'May', income: 60, expense: 35 },
    { name: 'Jun', income: 70, expense: 25 },
    { name: 'Jul', income: 50, expense: 30 },
    { name: 'Aug', income: 40, expense: 50 },
    { name: 'Sep', income: 55, expense: 20 },
    { name: 'Oct', income: 35, expense: 45 },
    { name: 'Nov', income: 65, expense: 30 },
    { name: 'Dec', income: 80, expense: 25 },
  ];

  return (
    <DashboardLayout>
      
      {/* FILTER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
          {["12 months", "30 days", "7 days", "24 hours"].map((period, idx) => (
            <button 
              key={period} 
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all
                ${idx === 0 ? "bg-white text-gray-700 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export report
        </button>
      </div>

      {/* TOP ROW STATS (Financials) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Income */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 text-sm">Total Income</span>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-600 mb-1">N 536,000.00</h3>
          <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
            <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 text-sm">Total Expense</span>
            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
              <CreditCardIcon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-600 mb-1">N 132,394.05</h3>
          <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
            <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 text-sm">Net Balance</span>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <ScaleIcon className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-600 mb-1">N 357,304.26</h3>
          <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
            <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
          </p>
        </div>
      </div>

      {/* MIDDLE ROW STATS (Status & Issues) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* CARD 1: Reconciliation Status (Progress Bar) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm">Reconciliation Status</span>
              <div className="p-2 bg-red-50 text-red-800 rounded-full">
                 <MapPinIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">43% Reconciled</h3>
          </div>
          
          {/* Progress Bar (Brown/Reddish) */}
          <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-800 rounded-full" style={{ width: '43%' }}></div>
          </div>
        </div>

        {/* CARD 2: Documentation Coverage (Progress Bar) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm">Documentation Coverage</span>
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">352</h3>
          </div>

          {/* Progress Bar (Orange) */}
          <div className="w-full h-4 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* CARD 3: Open Compliance Issue (List) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Open Compliance Issue</span>
              <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">5 Issues</h3>
          </div>
          
          {/* Issues List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              3 Missing VAT
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              2 Missing documentation
            </div>
          </div>
        </div>

      </div>

      {/* CHART SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-600 font-medium">Monthly Transaction Trend</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Income
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span> Expense
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </DashboardLayout>
  );
}