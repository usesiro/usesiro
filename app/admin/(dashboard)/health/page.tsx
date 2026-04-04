import { 
  ServerStackIcon, 
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

// --- MOCK DATA ---
const stats = [
  { name: "Uptime", value: "99.7%", trend: "Last 30 days", showTrendIcon: false },
  { name: "API calls today", value: "436", trend: "Avg 280/day", showTrendIcon: false },
  { name: "Sync Failures", value: "2", trend: "100% from last month", showTrendIcon: true },
  { name: "Avg Response", value: "48ms", trend: "12ms from last month", showTrendIcon: true },
];

// Adjusted mock data to match the UI style but fit the "API Log" context
const apiLogs = [
  { id: 1, endpoint: "/v1/mono/sync", responseTime: "124ms", date: "Mar 4", method: "POST", status: "Success" },
  { id: 2, endpoint: "/v1/mono/sync", responseTime: "98ms", date: "Mar 4", method: "POST", status: "Success" },
  { id: 3, endpoint: "/v1/business/me", responseTime: "45ms", date: "Mar 4", method: "GET", status: "Success" },
  { id: 4, endpoint: "/v1/transactions", responseTime: "210ms", date: "Mar 4", method: "GET", status: "Success" },
  { id: 5, endpoint: "/v1/auth/login", responseTime: "88ms", date: "Mar 4", method: "POST", status: "Success" },
];

export default function PlatformHealthPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10">
      
      {/* --- TOP METRICS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                {/* Using a Server icon instead of the Credit Card for Platform Health */}
                <ServerStackIcon className="w-4 h-4" />
              </div>
            </div>
            
            <div>
              <h3 className="text-[28px] font-bold text-gray-900 leading-none mb-3">{stat.value}</h3>
              <div className="flex items-center gap-1.5 text-sm">
                {stat.showTrendIcon && <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />}
                <span className="text-red-500 text-[13px]">
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- API ERROR LOG TABLE CONTAINER --- */}
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm flex flex-col min-h-[500px]">
        
        {/* TOP BAR (TITLE & FILTERS) */}
        <div className="p-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[20px] font-bold text-gray-900">API Error Log</h2>
          
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
                <option>GET</option>
                <option>POST</option>
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
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[30%]">Endpoint</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[20%]">Response Time</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[20%]">Date</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%]">Method</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%] text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {apiLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5">
                    <p className="text-[14px] font-bold text-gray-900">{log.endpoint}</p>
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">
                    {log.responseTime}
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">
                    {log.date}
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">
                    {log.method}
                  </td>
                  <td className="py-5 text-right pr-4">
                    {/* Kept the exact green pill styling from the Figma design */}
                    <span className="inline-flex px-4 py-1 rounded-full text-[12px] font-bold bg-green-50 text-green-600 border border-green-100/50">
                      {log.status}
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