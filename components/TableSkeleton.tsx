import DashboardLayout from "./DashboardLayout";
import Skeleton from "./Skeleton";

export default function TableSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Title & Action */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Page Summary Stats Card (Common across Siro table pages) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl shadow-sm border border-gray-100" />
          ))}
        </div>

        {/* Secondary Info Row (Specific to Tax Readiness & Reports) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl shadow-sm border border-gray-50 opacity-60" />
          ))}
        </div>

        {/* Table Section Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
           {/* Filters Bar */}
           <div className="flex flex-col xl:flex-row gap-4 justify-between">
              <div className="flex gap-3 flex-1">
                <Skeleton className="h-12 w-80 rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
              </div>
              <Skeleton className="h-12 w-32 rounded-xl" />
           </div>
           
           {/* Table Body */}
           <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex gap-6 items-center py-4 border-b border-gray-50 last:border-0">
                   <Skeleton className="h-5 w-5 rounded shrink-0 opacity-40" />
                   <Skeleton className="h-5 flex-1 rounded" />
                   <Skeleton className="h-5 w-32 rounded" />
                   <Skeleton className="h-5 w-24 rounded opacity-60" />
                   <Skeleton className="h-5 w-24 rounded opacity-60" />
                   <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
