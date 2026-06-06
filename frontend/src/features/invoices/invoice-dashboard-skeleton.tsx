import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceDashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 max-md:px-4 max-sm:px-3 max-sm:py-4">
      <div className="rounded-2xl border border-border bg-white dark:bg-card">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-4 p-6 max-sm:flex-col max-sm:items-stretch">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl sm:w-28 sm:flex-none" />
            <Skeleton className="h-10 flex-1 rounded-xl sm:w-32 sm:flex-none" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Search + Filter skeleton */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-5 max-sm:flex-col max-sm:items-stretch">
          <Skeleton className="h-11 flex-1 rounded-xl max-sm:w-full" />
          <Skeleton className="h-11 w-full rounded-xl sm:w-45" />
          <Skeleton className="h-11 w-full rounded-xl sm:w-45" />
          <Skeleton className="h-11 w-full rounded-xl sm:w-45" />
        </div>

        {/* Table header skeleton */}
        <div className="border-t border-border">
          <div className="flex h-14 items-center gap-4 bg-neutral-50/80 px-6 dark:bg-muted/50">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20 max-sm:hidden" />
            <Skeleton className="h-3 w-16 max-sm:hidden" />
          </div>
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-[72px] items-center gap-4 border-t border-border px-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20 max-sm:hidden" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between border-t border-border px-6 py-5 max-sm:flex-col max-sm:gap-3">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-1">
            <Skeleton className="h-9 w-9 rounded-lg sm:w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg sm:w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
