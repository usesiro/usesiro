import DashboardLayout from "./DashboardLayout";
import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-10 animate-fade-in">
        {/* Greeting Section */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96 opacity-60" />
        </div>

        {/* Top Stats Row (1x3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl shadow-sm border border-gray-100" />
          ))}
        </div>

        {/* Mini Stats Row (1x3) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl shadow-sm border border-gray-50" />
          ))}
        </div>

        {/* Chart & Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Skeleton className="h-[450px] w-full rounded-3xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[450px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
