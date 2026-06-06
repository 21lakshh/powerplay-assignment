import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-6 dark:bg-muted">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-neutral-50 p-6 dark:bg-muted">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-32" />
    </div>
  );
}
