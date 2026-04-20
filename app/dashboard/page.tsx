"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateTaxReadinessScore } from "@/utils/taxScoring"; 
import { 
  WalletIcon, CreditCardIcon, ScaleIcon,
  CheckCircleIcon, DocumentDuplicateIcon, ExclamationTriangleIcon,
  ChevronRightIcon, BoltIcon, InformationCircleIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import DashboardSkeleton from "@/components/DashboardSkeleton";

// --- GREETING UTILITIES ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getHolidayMessage = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateStr = `${month}-${day}`;

  const holidays: Record<string, string> = {
    "1-1": "Happy New Year! 🎆",
    "2-14": "Happy Valentine's Day! ❤️",
    "3-8": "Happy International Women's Day! 👩",
    "5-1": "Happy Workers' Day! 🛠️",
    "5-27": "Happy Children's Day! 🎈",
    "6-12": "Happy Democracy Day! 🇳🇬",
    "10-1": "Happy Independence Day! 🇳🇬",
    "12-25": "Merry Christmas! 🎄",
    "12-26": "Happy Boxing Day! 🎁",
  };

  // Current context check for Easter (April 5-7, 2026)
  if (month === 4 && day >= 5 && day <= 7) return "Happy Easter! 🐣";

  return holidays[dateStr] || null;
};

const getRandomHumor = () => {
  const messages = [
    "Hello, let's get some transactions tagged",
    "Ready to make those numbers smile? 😊",
    "Your financial hero era starts today!",
    "Let's turn those receipts into insights. 📈",
    "Keeping your books cleaner than a fresh slate.",
    "Tag, you're it! (The transactions, that is).",
    "Finance is fun... especially with Siro. 😉",
    "Ready for some heavy-duty bookkeeping? Let's go!",
    "Let's balance those books like a pro. ⚖️",
    "Another day, another step towards financial clarity.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export default function Dashboard() {
  const [business, setBusiness] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Memoize greeting and sub-message to keep them stable during session but dynamic on refresh
  const greeting = useMemo(() => getGreeting(), []);
  const subMessage = useMemo(() => getHolidayMessage() || getRandomHumor(), []);

  const showProfileAlert = useMemo(() => {
    return !isAlertDismissed && business && (!business.owner?.lastName || !business.owner?.phone);
  }, [isAlertDismissed, business]);

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
      
      if (t.document) documented++;
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
      pendingCount: transactions.filter(t => t.vatStatus === 'MISSING_VAT' || !t.categoryId || !t.document).length,
      recentActivity: recent
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  if (loading) return <DashboardSkeleton />;

  return (
    <DashboardLayout>
      {showProfileAlert && (
        <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <InformationCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <p className="text-sm font-medium text-indigo-700">
              Complete your profile to get the most out of Siro. 
              <a href="/settings" className="ml-2 font-black underline decoration-2 underline-offset-4 hover:text-indigo-900 transition-colors">Complete Now</a>
            </p>
          </div>
          <button 
            onClick={() => setIsAlertDismissed(true)}
            className="p-1 hover:bg-white rounded-full transition-colors text-indigo-400 hover:text-indigo-600"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
          {greeting}, {business?.owner?.firstName || "there"} 👋
        </h1>
        <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">
          {subMessage}
        </p>
      </div>

      <div className="space-y-6">
        {/* Top Financials */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={<WalletIcon className="w-5 h-5 text-blue-500"/>} />
          <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpense)} icon={<CreditCardIcon className="w-5 h-5 text-red-500"/>} />
          <div className="col-span-2 md:col-span-1">
            <StatCard title="Net Balance" value={formatCurrency(stats.netBalance)} icon={<ScaleIcon className="w-5 h-5 text-green-500"/>} />
          </div>
        </div>

        {/* 4-Column KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <ProgressCard title="Tax Readiness" percentage={readinessScore} icon={<CheckCircleIcon className="w-5 h-5 text-primary"/>} />
          <ProgressCard title="Bank Automation" percentage={automationRate} icon={<BoltIcon className="w-5 h-5 text-yellow-500"/>} />
          <ProgressCard title="Doc Coverage" percentage={docRate} icon={<DocumentDuplicateIcon className="w-5 h-5 text-orange-500"/>} />
          
          <div className="bg-white/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-wider">Compliance</span>
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform"/>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xl md:text-2xl font-black text-gray-900 leading-none">{pendingCount}</span>
              <a href="/reconciliation" className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-tight">
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
    <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 md:h-36 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <span className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      </div>
      <div className="text-lg md:text-2xl font-black text-gray-900 leading-none truncate">{value}</div>
    </div>
  );
}

function ProgressCard({ title, percentage, icon }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gray-100 h-32 md:h-36 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-[10px] md:text-xs font-black uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div>
        <div className="flex justify-between items-end mb-1.5 md:mb-2 text-gray-900 font-black">
          <span className="text-lg md:text-2xl leading-none">{percentage}%</span>
        </div>
        <div className="w-full h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${percentage > 80 ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}