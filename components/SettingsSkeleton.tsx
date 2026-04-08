import DashboardLayout from "./DashboardLayout";
import Skeleton from "./Skeleton";

export default function SettingsSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Page Title */}
        <Skeleton className="h-10 w-48" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabs Sidebar Skeleton */}
          <div className="w-full lg:w-64 space-y-3 shrink-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl opacity-80" />
            ))}
          </div>

          {/* Form Content Skeleton */}
          <div className="flex-1 space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-11 w-36 rounded-2xl" />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="space-y-3">
                      <Skeleton className="h-4 w-28 opacity-40" />
                      <Skeleton className="h-14 w-full rounded-2xl" />
                   </div>
                ))}
             </div>

             <div className="pt-10 border-t border-gray-100 mt-10">
                <div className="flex justify-between items-center mb-6">
                   <Skeleton className="h-6 w-48 opacity-60" />
                   <Skeleton className="h-8 w-24 rounded-lg opacity-40" />
                </div>
                <div className="space-y-4">
                   <Skeleton className="h-20 w-full rounded-2xl opacity-30" />
                   <Skeleton className="h-20 w-full rounded-2xl opacity-30" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
