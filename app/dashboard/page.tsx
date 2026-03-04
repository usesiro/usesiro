"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowUpRightIcon, ArrowDownTrayIcon, WalletIcon, CreditCardIcon, 
  ScaleIcon, MapPinIcon, DocumentTextIcon, ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 }); // NEW: Stats state
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dummy data for the chart until we make it dynamic
  const chartData = [
    { name: 'Jan', income: 40, expense: 25 },
    { name: 'Feb', income: 35, expense: 40 },
    { name: 'Mar', income: 45, expense: 20 },
    { name: 'Apr', income: 30, expense: 45 },
    { name: 'May', income: 60, expense: 35 },
  ];

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  useEffect(() => {
    async function getDashboardData() {
      try {
        const token = localStorage.getItem("siro_access_token");
        
        // 1. Fetch Business Info (for the name and Mono connection status)
        const bizRes = await fetch("/api/v1/business/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bizRes.ok) {
          setData(await bizRes.json());
        }

        // 2. Fetch Transaction Stats (for the NGN totals)
        const txRes = await fetch("/api/v1/transactions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          setStats(txData.stats);
        }

      } finally {
        setLoading(false);
      }
    }
    getDashboardData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/v1/mono/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      const result = await res.json();
      
      if (res.ok) {
        alert(result.message);
        window.location.reload(); // Refresh to immediately show new totals
      } else {
        alert(result.error || "Sync failed");
      }
    } catch (error) {
      alert("Network error during sync");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-medium text-gray-500">Updating Dashboard Data...</div>;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{data?.name || "Business"} Overview</h1>
          <p className="text-gray-500 text-sm">Real-time status for {data?.industry}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm">Total Income</span>
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><WalletIcon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-1">
               {formatCurrency(stats.totalIncome)}
            </h3>
            <p className="text-xs text-gray-400">{stats.totalIncome > 0 ? "From Synced Data" : "No transactions recorded"}</p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm">Total Expense</span>
              <div className="p-2 bg-red-50 text-red-500 rounded-lg"><CreditCardIcon className="w-5 h-5" /></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-1">
               {formatCurrency(stats.totalExpense)}
            </h3>
            <p className="text-xs text-gray-400">{stats.totalExpense > 0 ? "From Synced Data" : "No transactions recorded"}</p>
          </div>
        </div>

        {/* Sync Status Card with Button */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-sm">Mono Connection</span>
              <div className={`p-2 rounded-lg ${data?.monoAccountId ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                <MapPinIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-600 mb-1">
               {data?.monoAccountId ? "Linked" : "Not Linked"}
            </h3>
            <p className="text-xs text-gray-400">
              {data?.monoAccountId ? "Account is active and ready." : "Link your bank to see transactions."}
            </p>
          </div>
          
          {data?.monoAccountId && (
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="mt-4 w-full py-2 bg-blue-50 text-primary text-sm font-medium rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
            >
              {isSyncing ? "Syncing Data..." : "Sync Transactions Now"}
            </button>
          )}
        </div>
      </div>

      {/* CHART SECTION (Static for now) */}
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
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
              <Bar dataKey="expense" fill="#F87171" radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}