"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateTaxReadinessScore } from "@/utils/taxScoring"; 
import { 
  WalletIcon, CreditCardIcon, ScaleIcon,
  CheckCircleIcon, DocumentDuplicateIcon, ExclamationTriangleIcon,
  ChevronRightIcon, BoltIcon
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const [business, setBusiness] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const { stats, barData, readinessScore, docRate, automationRate, pendingCount, recentActivity } = useMemo(() => {
    let inc = 0, exp = 0, documented = 0, automated = 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, any> = {};
    months.forEach(m => monthlyMap[m] = { name: m, income: 0, expense: 0 });

    transactions.forEach(t => {
      const amt = Number(t.amount);
      const m = months[new Date(t.date).getMonth()];
      
      if (t.document || t.documentUrl || t.hasReceipt) documented++;
      if (t.source === 'MONO') automated++; // Track synced transactions
      
      if (t.type === 'INCOME') { inc += amt; monthlyMap[m].income += amt / 1000; } 
      else { exp += amt; monthlyMap[m].expense += amt / 1000; }
    });

    const total = transactions.length || 1;
    
    // Sort for the 5 most recent transactions
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    return {
      stats: { totalIncome: inc, totalExpense: exp, netBalance: inc - exp },
      barData: Object.values(monthlyMap),
      readinessScore: calculateTaxReadinessScore(transactions),
      docRate: Math.round((documented / total) * 100),
      automationRate: Math.round((automated / total) * 100),
      pendingCount: transactions.filter(t => t.vatStatus === 'MISSING_VAT' || !t.categoryId).length,
      recentActivity: recent
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{business?.name} Overview</h1>
      </div>

      <div className="space-y-6">
        {/* Top Financials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={<WalletIcon className="w-5 h-5 text-blue-500"/>} />
          <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpense)} icon={<CreditCardIcon className="w-5 h-5 text-red-500"/>} />
          <StatCard title="Net Balance" value={formatCurrency(stats.netBalance)} icon={<ScaleIcon className="w-5 h-5 text-green-500"/>} />
        </div>

        {/* 4-Column KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProgressCard title="Tax Readiness" percentage={readinessScore} icon={<CheckCircleIcon className="w-5 h-5 text-primary"/>} />
          <ProgressCard title="Bank Automation" percentage={automationRate} icon={<BoltIcon className="w-5 h-5 text-yellow-500"/>} />
          <ProgressCard title="Doc Coverage" percentage={docRate} icon={<DocumentDuplicateIcon className="w-5 h-5 text-orange-500"/>} />
          
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

        {/* Bottom Section: Chart & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 h-[400px]">
             <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Financial Performance</h3>
             <ResponsiveContainer width="100%" height="85%">
                <BarChart data={barData} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
             </ResponsiveContainer>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 h-[400px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Activity</h3>
              <a href="/transactions" className="text-xs font-bold text-primary hover:underline">View All</a>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-10">No recent transactions.</p>
              ) : (
                recentActivity.map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{t.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleDateString('en-GB')} • {t.source === 'MONO' ? 'Bank Sync' : 'Manual'}</p>
                    </div>
                    <span className={`text-sm font-bold whitespace-nowrap ml-4 ${t.type === 'INCOME' ? 'text-green-600' : 'text-gray-800'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
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
          <div className={`h-full ${percentage > 80 ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}