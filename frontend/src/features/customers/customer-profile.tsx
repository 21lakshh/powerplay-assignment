import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { DataTable } from "@/components/data-table";
import { CustomerProfileSkeleton } from "./customer-profile-skeleton";
import { customerApi, type CustomerProfile as CustomerProfileType } from "@/lib/api";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

const historyColumns: ColumnDef<Invoice, unknown>[] = [
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
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-foreground">
        {formatCurrency(row.original.total)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "issueDate",
    header: "Issued",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.issueDate)}
      </span>
    ),
  },
];

const statusOrder: InvoiceStatus[] = [
  "Paid",
  "Unpaid",
  "Overdue",
  "Draft",
  "Sent",
  "Void",
];

export function CustomerProfile() {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    customerApi
      .getProfile(customerId)
      .then(setCustomer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading || !customer) {
    return <CustomerProfileSkeleton />;
  }

  const invoices: Invoice[] = customer.invoices.map((inv) => ({
    _id: inv._id,
    invoiceId: inv.invoiceId,
    customerId: customer._id,
    customer: customer.name,
    company: customer.company,
    amount: inv.amount,
    taxRate: inv.taxRate,
    tax: inv.tax,
    total: inv.total,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
  }));

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="px-6 pt-6">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/invoices" className="hover:text-foreground">
            Invoices
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Customer</span>
        </nav>
      </div>

      {/* Customer Header */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-semibold text-blue-600">
          {getInitials(customer.name)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {customer.name}
          </h1>
          <p className="text-sm text-muted-foreground">{customer.company}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <StatCard
          label="Total billed"
          value={formatCurrency(customer.totalBilled)}
        />
        <StatCard
          label="Total tax"
          value={formatCurrency(customer.totalTax)}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(customer.outstanding)}
        />
        <StatCard label="# Invoices" value={String(customer.invoiceCount)} />
      </div>

      {/* Status Summary Chips with counts */}
      <div className="flex flex-wrap items-center gap-3 px-6 pt-4 pb-6">
        {statusOrder.map((status) => {
          const count = customer.statusCounts[status] ?? 0;
          if (count === 0) return null;
          return (
            <div
              key={status}
              className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm dark:bg-card"
            >
              <StatusBadge status={status} />
              <span className="font-medium text-foreground">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      <div className="px-6 pb-2">
        <h2 className="text-lg font-semibold text-foreground">
          Invoice history
        </h2>
      </div>
      <div className="mx-6 mb-6 overflow-hidden rounded-2xl border border-border max-sm:mx-4">
        <DataTable columns={historyColumns} data={invoices} />
      </div>
    </PageContainer>
  );
}
