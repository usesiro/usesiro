"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { calculateTaxReadinessScore } from "@/utils/taxScoring"; 
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import CheckoutButton from "@/components/CheckoutButton";
import Link from "next/link";

// --- GREETING UTILITIES (UNTOUCHED) ---
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

export default function Overview() {
  const [business, setBusiness] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);
  const subMessage = useMemo(() => getHolidayMessage() || getRandomHumor(), []);

  const showProfileAlert = useMemo(() => {
    return !isAlertDismissed && business && (!business.owner?.lastName || !business.owner?.phone);
  }, [isAlertDismissed, business]);

  useEffect(() => {
    async function getDashboardData() {
      try {
        const [bizRes, txRes, payRes] = await Promise.all([
          fetch("/api/v1/business/me"),
          fetch("/api/v1/transactions"),
          fetch("/api/payments/status")
        ]);
        if (bizRes.ok) setBusiness(await bizRes.json());
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.transactions || []);
        }
        if (payRes.ok) {
          const payData = await payRes.json();
          setIsPro(payData.isPro);
        }
      } finally {
        setLoading(false);
        setTimeout(() => setIsMounted(true), 100);
      }
    }
    getDashboardData();
  }, []);

  // --- REWRITTEN DATA ENGINE FOR COMPLIANCE ---
  const { stats, compliance, readinessScore, recentActivity } = useMemo(() => {
    let inc = 0, exp = 0;
    let untaggedVat = 0, uncategorized = 0, undocumented = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'INCOME') inc += amt;
      else exp += amt;
      
      if (t.vatStatus === 'MISSING_VAT') untaggedVat++;
      if (!t.categoryId) uncategorized++;
      if (!t.document) undocumented++;
    });

    const total = transactions.length;

    // Extract the 5 most recent transactions
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      stats: { totalIncome: inc, totalExpense: exp, netBalance: inc - exp },
      compliance: {
        vat: { count: untaggedVat, score: total === 0 ? 0 : Math.round(((total - untaggedVat) / total) * 100) },
        category: { count: uncategorized, score: total === 0 ? 0 : Math.round(((total - uncategorized) / total) * 100) },
        document: { count: undocumented, score: total === 0 ? 0 : Math.round(((total - undocumented) / total) * 100) },
        totalIssues: untaggedVat + uncategorized + undocumented
      },
      readinessScore: calculateTaxReadinessScore(transactions),
      recentActivity: recent
    };
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

  if (loading) return <DashboardSkeleton />;

  return (
    <DashboardLayout>
      {/* PROFILE ALERT (UNTOUCHED) */}
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

      {/* GREETINGS & HUMOR (UNTOUCHED) */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
          {greeting}, {business?.owner?.firstName || "there"} 👋
        </h1>
        <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">
          {subMessage}
        </p>
      </div>

      <div className="space-y-10">

        {/* --- DEMO: SUBSCRIPTION CHECKOUT --- */}
        {!isPro && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Upgrade to Siro Pro</h3>
              <p className="text-sm text-gray-500 mt-1">₦9,999 for 30 days — Full access to AI imports, reports, and reconciliation.</p>
            </div>
            <CheckoutButton userEmail={business?.owner?.email || ""} />
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-3xl p-8 md:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mx-auto mb-6">
              <InformationCircleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Add your first financial record</h2>
            <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
              Your readiness score will appear after Siro has real transactions to analyse. Upload a statement or add a cash transaction to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/transactions" className="px-6 py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition">
                Upload statement
              </Link>
              <Link href="/transactions" className="px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition">
                Add manually
              </Link>
            </div>
          </div>
        ) : (
          <>
        {/* --- DARK SCOREBOARD BANNER --- */}
        <div className="bg-[#1A1C23] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Circular Gauge */}
          <div className="flex items-center gap-6">
            <CircularProgress score={readinessScore} isMounted={isMounted} />
            <div className="text-white">
              <h2 className="text-xl font-bold">Your tax readiness score</h2>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">
                You are {readinessScore}% tax-ready. Fix the actions below to improve your score before the NRS arrives.
              </p>
            </div>
          </div>

          {/* Mini Progress Bars */}
          <div className="flex-1 w-full space-y-4">
            <ProgressBar label="VAT tagging" score={compliance.vat.score} color="bg-red-500" isMounted={isMounted} />
            <ProgressBar label="Categorization" score={compliance.category.score} color="bg-yellow-500" isMounted={isMounted} />
            <ProgressBar label="Documentation" score={compliance.document.score} color="bg-emerald-500" isMounted={isMounted} />
          </div>
        </div>

        {/* --- ACTIONS NEEDED GRID --- */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Actions Needed</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VAT Action Card (URGENT - with soft breathing pulse) */}
            <div className="relative bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between h-full overflow-hidden group">
              {/* Soft Red Breathing Background */}
              <div className="absolute inset-0 bg-red-50/40 animate-pulse pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    Urgent
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Takes 2 mins</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{compliance.vat.count} transactions are untagged for VAT</h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Untagged transactions are your biggest gap. Tag each as VAT-applicable or exempt.
                </p>
              </div>
              <Link href="/tax-readiness" className="relative z-10">
                <button className="w-full py-3 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 transition-colors">
                  Tag transactions
                </button>
              </Link>
            </div>

            {/* Category Action Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-widest rounded-md">Attention</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Takes 1 min</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{compliance.category.count} transactions are uncategorized</h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Your report is incomplete until these are categorized. It takes less than a minute.
                </p>
              </div>
              <Link href="/reconciliation">
                <button className="w-full py-3 bg-yellow-50 text-yellow-600 font-bold text-sm rounded-lg hover:bg-yellow-100 transition-colors">
                  Categorize now
                </button>
              </Link>
            </div>

            {/* Document Action Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">Recommended</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Takes 3 mins</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {compliance.document.count === 0 ? "No" : compliance.document.count} documents attached to records
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Attach receipts and invoices to strengthen your audit defence.
                </p>
              </div>
              <Link href="/transactions">
                <button className="w-full py-3 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors">
                  Add Documents
                </button>
              </Link>
            </div>

          </div>
        </div>

        {/* --- BOTTOM ROW: SNAPSHOT & RECENT ACTIVITY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* FINANCIAL SNAPSHOT (Left) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Financial snapshot</h3>
            
            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-center pb-5 border-b border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Total Income</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(stats.totalIncome)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-5 border-b border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Total Expense</span>
                <span className="text-sm font-bold text-red-600">{formatCurrency(stats.totalExpense)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-5 border-b border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Net Balance</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(stats.netBalance)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-8">
                <span className="text-sm text-gray-600 font-medium">Compliance issues</span>
                <span className="text-sm font-bold text-red-600">{compliance.totalIssues} unresolved</span>
              </div>
            </div>

            <Link href="/reports">
              <button className="w-full mt-auto py-3.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors">
                View full report
              </button>
            </Link>
          </div>

          {/* RECENT ACTIVITY (Right) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <Link href="/transactions" className="text-sm font-bold text-primary hover:underline">
                View All
              </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center mt-10">No recent transactions.</p>
              ) : (
                recentActivity.map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{t.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(t.date).toLocaleDateString('en-GB')} • {t.source === 'MONO' ? 'Bank Sync' : 'Manual'}
                      </p>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// --- SUB-COMPONENTS FOR DARK SCOREBOARD ---

function CircularProgress({ score, isMounted }: { score: number, isMounted: boolean }) {
  const radius = 40; 
  const circumference = 2 * Math.PI * radius;
  // Start at 0, animate to actual score
  const displayScore = isMounted ? score : 0;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
      <svg className="transform -rotate-90 w-full h-full overflow-visible" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
        {/* Progress Fill */}
        <circle 
          cx="50" cy="50" r={radius} 
          stroke="#3B82F6" strokeWidth="8" fill="transparent" 
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset, transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white leading-none">{displayScore}%</span>
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ready</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, score, color, isMounted }: { label: string, score: number, color: string, isMounted: boolean }) {
  // Start at 0, animate to actual score
  const displayScore = isMounted ? score : 0;
  
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-400 font-medium w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${displayScore}%`, transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }} 
        />
      </div>
    </div>
  );
}
