import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/invoice";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  Paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Unpaid: {
    label: "Unpaid",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Overdue: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  Draft: {
    label: "Draft",
    className: "bg-neutral-50 text-neutral-600 border-neutral-200",
  },
  Sent: {
    label: "Sent",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Void: {
    label: "Void",
    className: "bg-neutral-100 text-neutral-500 border-neutral-200",
  },
};

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
