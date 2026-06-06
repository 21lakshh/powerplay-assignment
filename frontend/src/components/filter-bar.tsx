import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS, TAX_RATES } from "@/lib/constants";

interface FilterBarProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  taxFilter: string;
  onTaxChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
}

export function FilterBar({
  statusFilter,
  onStatusChange,
  taxFilter,
  onTaxChange,
  dateFilter,
  onDateChange,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="h-11 w-[180px] rounded-xl border-border bg-white dark:bg-card">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={taxFilter} onValueChange={onTaxChange}>
        <SelectTrigger className="h-11 w-[180px] rounded-xl border-border bg-white dark:bg-card">
          <SelectValue placeholder="Tax rate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All rates</SelectItem>
          {TAX_RATES.map((rate) => (
            <SelectItem key={rate} value={String(rate)}>
              {rate}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={onDateChange}>
        <SelectTrigger className="h-11 w-[180px] rounded-xl border-border bg-white dark:bg-card">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All dates</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className={`h-11 text-muted-foreground transition-opacity ${
          statusFilter !== "all" || taxFilter !== "all" || dateFilter !== "all"
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => {
          onStatusChange("all");
          onTaxChange("all");
          onDateChange("all");
        }}
      >
        Clear filters
      </Button>
    </div>
  );
}
