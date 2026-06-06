import { Skeleton } from "@/components/ui/skeleton";

export function SummaryPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-6 py-6 max-md:px-4">
      {/* Breadcrumb skeleton */}
      <Skeleton className="h-4 w-36" />

      {/* Stat card skeletons */}
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-7 w-36" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
          <Skeleton className="h-6 w-32" />
          <div className="mt-4 flex flex-col items-center">
            <Skeleton className="h-50 w-50 rounded-full" />
            <div className="mt-4 flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-white p-6 max-lg:col-span-1 dark:bg-card">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-70 w-full rounded-xl" />
        </div>
      </div>

      {/* Top customers skeleton */}
      <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
        <Skeleton className="h-6 w-52" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-60 shrink-0 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-8 rounded-full" style={{ width: `${90 - i * 12}%` }} />
              </div>
              <Skeleton className="h-4 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
