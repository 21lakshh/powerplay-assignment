import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/stat-card";

export function CustomerProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 max-md:px-4">
      <div className="rounded-2xl border border-border bg-white dark:bg-card">
        {/* Breadcrumb skeleton */}
        <div className="px-6 pt-6">
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Avatar + Name skeleton */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Stat card skeletons */}
        <div className="grid grid-cols-4 gap-4 px-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Status chip skeletons */}
        <div className="flex items-center gap-3 px-6 py-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>

        {/* Invoice history skeleton */}
        <div className="px-6 pb-2">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="mx-6 mb-6 rounded-2xl border border-border">
          <div className="flex h-14 items-center gap-4 bg-neutral-50/80 px-6 dark:bg-muted/50">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex h-[72px] items-center gap-4 border-t border-border px-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
