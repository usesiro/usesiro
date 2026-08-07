import Link from "next/link";
import { 
  ArrowTrendingUpIcon, 
  CreditCardIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // --- DATABASE FETCHES ---
  const [totalUsers, activeSubscribers, recentSignupsData, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.business.count({ where: { NOT: { monoAccountId: null } } }),
    prisma.business.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),
    ((prisma as any).auditLog?.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { business: true } } }
    }) || [])
  ]);

  // Ensure auditLogs is an array even if prisma.auditLog was undefined
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];

  // --- DERIVED METRICS ---
  const mrrValue = activeSubscribers * 9000;
  const formattedMRR = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(mrrValue);

  const stats = [
    { name: "MRR", value: formattedMRR, trend: "100% from last month", showTrend: true },
    { name: "Total Users", value: totalUsers.toString(), trend: "100% from last month", showTrend: true },
    { name: "Active Subs", value: activeSubscribers.toString(), trend: "2 Inactive", showTrend: false },
    { name: "Churn Rate", value: "7%", trend: "100% from last month", showTrend: true },
  ];

  const recentSignups = recentSignupsData.map((business: any) => ({
    id: business.id,
    name: business.name,
    email: business.user.email,
    time: new Date(business.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bank: business.monoAccountId ? "Connected" : "Pending",
    status: business.monoAccountId ? "Active" : "Incomplete"
  }));

  const liveActivity = safeAuditLogs.map((log: any) => {
      const name = log.user?.business?.name || log.user?.email || "Unknown User";
      const actionMap: Record<string, string> = {
          "AUTH.LOGIN_SUCCESS": "Signed in successfully",
          "AUTH.LOGIN_FAILURE": "Failed a login attempt",
          "AUTH.SIGNUP": "Joined the platform",
          "ADMIN.GENESIS_SETUP": "Initialized System Genesis",
          "AUTH.LOGOUT": "Signed out"
      };
      
      return {
          id: log.id,
          name: name.split('@')[0], // Clean up email if name is missing
          action: actionMap[log.action] || log.action,
          time: new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: log.status === "FAILURE" ? "warning" : "system"
      };
  });

  const platformHealth = [
    { name: "API", desc: "All end points responding", value: "100%", status: "good" },
    { name: "Bank Sync", desc: "12/13 connections active", value: "92%", status: "good" },
    { name: "Sync Queue", desc: "3 jobs pending", value: "Delayed", status: "warning" },
    { name: "Database", desc: "Response time normal", value: "48ms", status: "good" },
  ];

  const churnRisk = [
    { initials: "TG", name: "TopGear Logistics", desc: "Last seen 22 days ago" },
    { initials: "BL", name: "Bella Lounge", desc: "Never connected bank" },
    { initials: "AF", name: "AJ Fashion", desc: "Last seen 18 days ago" },
    { initials: "NK", name: "NK Events", desc: "Last seen 18 days ago" },
  ];

  // Simple helper for the mock bar chart
  const barHeights = [40, 45, 45, 60, 100, 45, 35, 65, 75];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 font-sans">
      
      {/* --- TOP METRICS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, i: number) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <CreditCardIcon className="w-4 h-4" />
              </div>
            </div>
            
            <div>
              <h3 className="text-[28px] font-bold text-gray-900 leading-none mb-3">{stat.value}</h3>
              <div className="flex items-center gap-1.5 text-sm">
                {stat.showTrend && <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />}
                <span className={stat.showTrend ? "text-red-500" : "text-gray-400"}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MIDDLE SECTION: 2 COLUMNS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Signups */}
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Signups</h2>
            <Link href="/pigshit/users" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          
          <div className="overflow-x-auto flex-1 px-6 pb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-xs font-semibold text-gray-500">Business</th>
                  <th className="py-3 text-xs font-semibold text-gray-500">Signed Up</th>
                  <th className="py-3 text-xs font-semibold text-gray-500">Bank Connected</th>
                  <th className="py-3 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSignups.map((user: any) => (
                  <tr key={user.id}>
                    <td className="py-4">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{user.time}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                        ${user.bank === "Connected" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}
                      `}>
                        {user.bank}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                        ${user.status === "Active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}
                      `}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity */}
        <div className="xl:col-span-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Live Activity</h2>
          <div className="space-y-6">
            {liveActivity.map((activity: any) => (
              <div key={activity.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 text-primary">
                  {activity.type === "message" && <EnvelopeIcon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-gray-600 leading-snug">
                    <span className="font-bold text-gray-900">{activity.name}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: 3 COLUMNS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Revenue Trend */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <span className="text-sm font-semibold text-primary">This month</span>
            </div>
            
            {/* Minimal Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-1 border-b border-gray-100 pb-2 relative">
              {barHeights.map((h: any, i: number) => (
                <div key={i} className="w-full bg-primary rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${h}%` }}></div>
              ))}
              <div className="absolute -bottom-6 left-0 text-xs text-gray-400">Feb</div>
              <div className="absolute -bottom-6 right-0 text-xs text-gray-400">Mar</div>
            </div>
          </div>
          
          <div className="mt-10">
            <p className="text-xs font-semibold text-gray-500 mb-1">Total this month</p>
            <p className="text-[28px] font-bold text-gray-900">₦126,000.00</p>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Platform Health</h2>
            <Link href="/pigshit/logs" className="text-sm font-semibold text-primary hover:underline">View logs</Link>
          </div>
          <div className="flex-1 space-y-6">
            {platformHealth.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.status === "good" ? "bg-green-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Churn Risk</h2>
            <Link href="/pigshit/churn" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>
          <p className="text-xs text-gray-400 mb-6">All end points responding</p>
          
          <div className="flex-1 space-y-5">
            {churnRisk.map((user: any) => (
              <div key={user.initials} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-900 text-sm">
                    {user.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{user.desc}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-primary hover:underline">
                  Reach out
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
