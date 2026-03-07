"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  WalletIcon, CreditCardIcon, ScaleIcon, ArrowPathIcon,
  CheckCircleIcon, DocumentDuplicateIcon, ExclamationTriangleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const [business, setBusiness] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function getDashboardData() {
      try {
        const token = localStorage.getItem("siro_access_token");
        const [bizRes, txRes] = await Promise.all([
          fetch("/api/v1/business/me", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/v1/transactions", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (bizRes.ok) setBusiness(await bizRes.json());
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }
      } finally { setLoading(false); }
    }
    getDashboardData();
  }, []);

  const { stats, barData, reconRate, docRate, pendingCount } = useMemo(() => {
    let inc = 0, exp = 0, reconciled = 0, documented = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, any> = {};
    months.forEach(m => monthlyMap[m] = { name: m, income: 0, expense: 0 });

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const m = months[new Date(t.date).getMonth()];
      if (t.categoryId && t.vatStatus !== 'MISSING_VAT') reconciled++;
      if (t.documentUrl || t.hasReceipt) documented++;
      if (t.type === 'INCOME') { inc += amt; monthlyMap[m].income += amt / 1000; } 
      else { exp += amt; monthlyMap[m].expense += amt / 1000; }
    });

    const total = transactions.length || 1;
    return {
      stats: { totalIncome: inc, totalExpense: exp, netBalance: inc - exp },
      barData: Object.values(monthlyMap),
      reconRate: Math.round((reconciled / total) * 100),
      docRate: Math.round((documented / total) * 100),
      pendingCount: transactions.filter(t => t.vatStatus === 'MISSING_VAT' || !t.categoryId).length
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">{business?.name} Overview</h1>
        <button onClick={async () => { setIsSyncing(true); await fetch("/api/v1/mono/sync", { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` } }); window.location.reload(); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-none">
          <ArrowPathIcon className={`w-4 h-4 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Bank
        </button>
      </div>

      {/* Grid Container */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={<WalletIcon className="w-5 h-5 text-blue-500"/>} />
          <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpense)} icon={<CreditCardIcon className="w-5 h-5 text-red-500"/>} />
          <StatCard title="Net Balance" value={formatCurrency(stats.netBalance)} icon={<ScaleIcon className="w-5 h-5 text-green-500"/>} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard title="Reconciliation Status" percentage={reconRate} icon={<CheckCircleIcon className="w-5 h-5 text-primary"/>} />
          <ProgressCard title="Documentation Coverage" percentage={docRate} icon={<DocumentDuplicateIcon className="w-5 h-5 text-orange-500"/>} />
          
          {/* Open Compliance Card - Fixed Height to match neighbors */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs font-bold uppercase">Compliance Issues</span>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500"/>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-gray-800">{pendingCount}</span>
              <a href="/reconciliation" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Fix <ChevronRightIcon className="w-3 h-3"/>
              </a>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 h-[400px]">
           <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Financial Performance</h3>
           <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col justify-between h-32 shadow-none">
      <div className="flex justify-between items-start">
        <span className="text-gray-400 text-xs font-bold uppercase">{title}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  );
}

function ProgressCard({ title, percentage, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 h-32 flex flex-col justify-between shadow-none">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-xs font-bold uppercase">{title}</span>
        {icon}
      </div>
      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="text-lg font-bold text-gray-800">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-50 rounded-full">
          <div className="h-full bg-primary" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}