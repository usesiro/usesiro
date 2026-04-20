import { 
  CreditCardIcon, 
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";

export default async function RevenuePage() {
  const activeSubscribers = await prisma.business.count({ where: { NOT: { monoAccountId: null } } });
  const recentTransactions = await prisma.transaction.findMany({
    where: { type: 'INCOME' },
    take: 10,
    orderBy: { date: 'desc' },
    include: { business: true }
  });

  const mrrValue = activeSubscribers * 9000;
  const formattedMRR = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(mrrValue);
  
  const stats = [
    { name: "MRR", value: formattedMRR, trend: "Current", showTrendIcon: false, trendColor: "text-gray-500" },
    { name: "New this month", value: "₦0.00", trend: "0 new subscribers", showTrendIcon: true, trendColor: "text-gray-500" },
    { name: "Failed Payments", value: "0", trend: "₦0 at risk", showTrendIcon: false, trendColor: "text-gray-500" },
    { name: "Churn Rate", value: "7%", trend: "100% from last month", showTrendIcon: true, trendColor: "text-red-500" }, // Kept mock
  ];

  const payments = recentTransactions.map((t: any) => ({
    id: t.id,
    business: t.business.name,
    amount: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(t.amount) || 0),
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    method: "Card", // Default
    status: "Paid"
  }));
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10">
      
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
                {stat.showTrendIcon && <ArrowTrendingUpIcon className={`w-4 h-4 ${stat.trendColor}`} />}
                <span className={stat.trendColor}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- PAYMENT HISTORY TABLE CONTAINER --- */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm flex flex-col min-h-[500px]">
        
        {/* TOP BAR (TITLE & FILTERS) */}
        <div className="p-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[20px] font-bold text-gray-900">Payment History</h2>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full sm:w-60 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
            
            {/* Type Dropdown */}
            <div className="relative hidden sm:block">
              <select className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-400 bg-white cursor-pointer min-w-[120px]">
                <option>Type</option>
                <option>Card</option>
                <option>Transfer</option>
              </select>
              <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* TABLE AREA */}
        <div className="overflow-x-auto px-6 md:px-8 pb-8">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[30%]">Business</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[20%]">Amount</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[20%]">Date</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%]">Method</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%] text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5">
                    <p className="text-[14px] font-bold text-gray-900">{payment.business}</p>
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">
                    {payment.amount}
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">
                    {payment.date}
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">
                    {payment.method}
                  </td>
                  <td className="py-5 text-right pr-4">
                    <span className="inline-flex px-4 py-1 rounded-full text-[12px] font-bold bg-green-50 text-green-600 border border-green-100/50">
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}