"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  WalletIcon, CreditCardIcon, ScaleIcon, ArrowUpRightIcon, ArrowDownTrayIcon 
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function Reports() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/transactions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const { totalIncome, totalExpense, netBalance, barData, donutData, score } = useMemo(() => {
    let inc = 0, exp = 0, ready = 0;
    const monthlyMap: Record<string, any> = {};
    const categoryMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlyMap[m] = { name: m, income: 0, expense: 0 });

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const m = months[new Date(t.date).getMonth()];
      
      // Calculate Score: Must have category AND not be "MISSING_VAT"
      if (t.categoryId && t.vatStatus !== 'MISSING_VAT') ready++;

      if (t.type === 'INCOME') {
        inc += amt;
        if (monthlyMap[m]) monthlyMap[m].income += amt / 1000;
      } else {
        exp += amt;
        if (monthlyMap[m]) monthlyMap[m].expense += amt / 1000;
        const cat = t.categoryName || 'Uncategorized';
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      }
    });

    const processedDonut = Object.entries(categoryMap).map(([name, value], i) => ({
      name, value: Math.round((value / (exp || 1)) * 100), color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i % 4]
    })).slice(0, 4);

    return {
      totalIncome: inc, totalExpense: exp, netBalance: inc - exp,
      barData: Object.values(monthlyMap),
      donutData: processedDonut.length ? processedDonut : [{name: 'Empty', value: 100, color: '#F3F4F6'}],
      score: transactions.length ? Math.round((ready / transactions.length) * 100) : 0
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center print:hidden">
          <h1 className="text-2xl font-bold text-dark">Reports</h1>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Income" amount={formatCurrency(totalIncome)} icon={<WalletIcon className="w-5 h-5"/>} color="blue" />
          <StatCard title="Total Expense" amount={formatCurrency(totalExpense)} icon={<CreditCardIcon className="w-5 h-5"/>} color="red" />
          <StatCard title="Net Balance" amount={formatCurrency(netBalance)} icon={<ScaleIcon className="w-5 h-5"/>} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-[450px]">
            <h2 className="text-gray-800 font-bold mb-8">Income vs Expense (k)</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <h2 className="text-gray-600 font-bold mb-8">Tax Readiness Score</h2>
            <div className="relative flex items-center justify-center">
               <svg className="w-40 h-40 transform -rotate-90">
                 <circle cx="80" cy="80" r="70" stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
                 <circle cx="80" cy="80" r="70" stroke="#3B82F6" strokeWidth="12" fill="transparent" 
                    strokeDasharray="440" strokeDashoffset={440 - (440 * score) / 100} strokeLinecap="round" className="transition-all duration-1000" />
               </svg>
               <span className="absolute text-4xl font-black text-dark">{score}%</span>
            </div>
            <p className="text-xs text-gray-400 font-bold mt-6 uppercase tracking-widest">Compliance Level</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, amount, icon, color }: any) {
  const isRed = color === 'red';
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-500 text-sm font-bold uppercase">{title}</span>
        <div className={`p-2 rounded-xl ${isRed ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-black text-dark">{amount}</h3>
      <p className={`text-xs mt-2 ${isRed ? 'text-red-500' : 'text-blue-500'} font-bold flex items-center gap-1`}>
        <ArrowUpRightIcon className="w-3 h-3" /> 100% <span className="text-gray-400 font-normal">from last month</span>
      </p>
    </div>
  );
}