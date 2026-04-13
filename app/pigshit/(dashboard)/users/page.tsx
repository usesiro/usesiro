import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AllUsersPage() {
  const businesses = await prisma.business.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const users = businesses.map((b: any) => ({
    id: b.id,
    name: b.name,
    email: b.user.email,
    plan: "Foundation", // Default plan for now
    signedUp: new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    lastActive: "Today", // Mock for now
    bank: b.monoAccountId ? "Connected" : "Pending",
    status: b.user.isVerified ? "Active" : "Pending"
  }));
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10">
      
      <div className="bg-white border border-gray-100 rounded-[20px] shadow-sm flex flex-col min-h-[600px]">
        
        {/* --- TOP BAR (TITLE & FILTERS) --- */}
        <div className="p-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold text-gray-900">All Users</h2>
          
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
              <select className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-500 bg-white cursor-pointer min-w-[120px]">
                <option>Type</option>
                <option>Active</option>
                <option>Pending</option>
              </select>
              <ChevronDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* --- TABLE AREA --- */}
        <div className="overflow-x-auto px-6 md:px-8 pb-8">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[25%]">Business</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%]">Plan</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%]">Signed Up</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[15%]">Last Active</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[12%]">Bank</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[10%]">Status</th>
                <th className="pb-4 text-[13px] font-semibold text-gray-500 w-[8%] text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {users.map((user: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5">
                    <p className="text-[14px] font-bold text-gray-900">{user.name}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{user.email}</p>
                  </td>
                  <td className="py-5">
                    <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-semibold bg-blue-50 text-primary">
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">{user.signedUp}</td>
                  <td className="py-5 text-[14px] text-gray-600 font-medium">{user.lastActive}</td>
                  <td className="py-5">
                    <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-semibold bg-green-50 text-green-600 border border-green-100/50">
                      {user.bank}
                    </span>
                  </td>
                  <td className="py-5">
                    <span className="inline-flex px-3 py-1 rounded-full text-[12px] font-semibold bg-green-50 text-green-600 border border-green-100/50">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-5 text-right pr-4">
                    <Link href={`/pigshit/users/${user.id}`} className="text-[13px] font-bold text-primary hover:text-blue-800 transition-colors">
                      View
                    </Link>
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