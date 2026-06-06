import type { ColumnDef } from "@tanstack/react-table";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SortState {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface ColumnOptions {
  onEdit: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: InvoiceStatus) => void;
  sort: SortState;
  onSort: (field: string) => void;
}

function SortableHeader({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: string;
  sort: SortState;
  onSort: (field: string) => void;
}) {
  const isActive = sort.sortBy === field;
  return (
    <button
      className="flex cursor-pointer items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => onSort(field)}
    >
      {label}
      {isActive ? (
        sort.sortOrder === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
  );
}

export function getInvoiceColumns({
  onEdit,
  onStatusChange,
  sort,
  onSort,
}: ColumnOptions): ColumnDef<Invoice, unknown>[] {
  return [
    {
      accessorKey: "invoiceId",
      header: "Invoice",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.invoiceId}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <Link
          to={`/invoices/customers/${row.original.customerId}`}
          className="font-medium text-foreground hover:text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.customer}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: () => (
        <SortableHeader label="Amount" field="amount" sort={sort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "taxRate",
      header: "Tax %",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.taxRate}%</span>
      ),
    },
    {
      accessorKey: "total",
      header: () => (
        <SortableHeader label="Total" field="total" sort={sort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "issueDate",
      header: () => (
        <SortableHeader label="Issue Date" field="issueDate" sort={sort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.issueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: () => (
        <SortableHeader label="Due Date" field="dueDate" sort={sort} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.dueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="group/status">
          <Select
            value={row.original.status}
            onValueChange={(value) =>
              onStatusChange(row.original._id, value as InvoiceStatus)
            }
          >
            <SelectTrigger className="h-7 w-auto cursor-pointer gap-1 border-none bg-transparent p-0 shadow-none focus-visible:ring-0 [&>svg]:size-0">
              <StatusBadge status={row.original.status} />
              <ChevronDown className="size-3! text-muted-foreground opacity-0 transition-opacity group-hover/status:opacity-100" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4}>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  <StatusBadge status={s} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      ),
    },
  ];
}
