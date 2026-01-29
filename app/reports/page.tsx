"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  WalletIcon, 
  CreditCardIcon, 
  ScaleIcon, 
  ArrowUpRightIcon 
} from "@heroicons/react/24/outline";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Reports() {

  // --- DATA ---
  const barData = [
    { name: 'Jan', income: 60, expense: 40 },
    { name: 'Feb', income: 50, expense: 35 },
    { name: 'Mar', income: 70, expense: 45 },
    { name: 'Apr', income: 40, expense: 60 },
    { name: 'May', income: 80, expense: 50 },
    { name: 'Jun', income: 55, expense: 30 },
    { name: 'Jul', income: 90, expense: 20 },
    { name: 'Aug', income: 65, expense: 75 },
    { name: 'Sep', income: 50, expense: 40 },
    { name: 'Oct', income: 75, expense: 55 },
    { name: 'Nov', income: 60, expense: 60 },
    { name: 'Dec', income: 85, expense: 25 },
  ];

  const donutData = [
    { name: 'Utilities', value: 35, color: '#3B82F6' },       // Blue
    { name: 'Operations/Tools', value: 20, color: '#10B981' },// Green
    { name: 'Logistics', value: 15, color: '#F59E0B' },       // Yellow
    { name: 'Marketing/Ads', value: 20, color: '#8B5CF6' },   // Purple
    { name: 'Uncategorized', value: 10, color: '#6B7280' },   // Gray
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* --- TOP ROW STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total Income</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 536,000.00</h3>
            <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
              <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Total Expense</span>
              <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">
                <CreditCardIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 132,394.05</h3>
            <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
              <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-500 text-sm">Net Balance</span>
              <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                <ScaleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-dark mb-1">N 357,304.26</h3>
            <p className="text-xs text-blue-500 flex items-center gap-1 font-medium">
              <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
            </p>
          </div>
        </div>

        {/* --- BOTTOM ROW: CHARTS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* BAR CHART SECTION */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-gray-600 font-medium">Monthly Transaction Trend</h2>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Income</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Expense</div>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={8}>
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

          {/* DONUT CHART SECTION */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
            <h2 className="text-gray-600 font-medium mb-4">Expense Overview</h2>
            
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Trick */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {/* You can add a Total here if you want later */}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-3 overflow-y-auto">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-dark">{item.value}%</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}