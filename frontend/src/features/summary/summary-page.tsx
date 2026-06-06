import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { summaryApi, type SummaryResponse } from "@/lib/api";
import { SummaryPageSkeleton } from "./summary-page-skeleton";

const STATUS_COLORS: Record<string, string> = {
  Paid: "#10b981",
  Unpaid: "#f59e0b",
  Overdue: "#ef4444",
  Draft: "#a3a3a3",
  Sent: "#3b82f6",
  Void: "#737373",
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function SummaryPage() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    summaryApi
      .get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = useMemo(() => {
    if (!data) return [];
    return data.monthlyRevenue.map((m) => ({
      label: `${MONTH_LABELS[m.month - 1]} ${m.year}`,
      revenue: m.revenue,
      count: m.count,
    }));
  }, [data]);

  const statusData = useMemo(() => {
    if (!data) return [];
    const order = ["Paid", "Unpaid", "Overdue", "Sent", "Draft", "Void"];
    return order
      .map((s) => data.statusBreakdown.find((b) => b.status === s))
      .filter(Boolean) as typeof data.statusBreakdown;
  }, [data]);

  if (loading || !data) {
    return <SummaryPageSkeleton />;
  }

  const maxRevenue = Math.max(...data.topCustomers.map((c) => c.revenue));
  const totalInvoices = statusData.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-6 py-6 max-md:px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/invoices" className="hover:text-foreground">
          Invoices
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Summary</span>
      </nav>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            Total billed
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {formatCurrency(data.stats.totalBilled)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            Total tax
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {formatCurrency(data.stats.totalTax)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            # Invoices
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {data.stats.invoiceCount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            # Customers
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {data.stats.customerCount}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
        {/* Status Breakdown Donut */}
        <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
          <h2 className="text-lg font-semibold text-foreground">
            Invoice status
          </h2>
          <div className="mt-4 flex flex-col items-center">
            <div className="relative h-50 w-50">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || "#a3a3a3"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
                          <p className="font-medium text-foreground">{d.status}</p>
                          <p className="text-muted-foreground">
                            {d.count} invoices &middot; {formatCurrency(d.total)}
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-foreground">
                  {totalInvoices.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {statusData.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: STATUS_COLORS[s.status] }}
                  />
                  <span className="text-muted-foreground">{s.status}</span>
                  <span className="font-medium text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="col-span-2 rounded-2xl border border-border bg-white p-6 max-lg:col-span-1 dark:bg-card">
          <h2 className="text-lg font-semibold text-foreground">
            Monthly revenue
          </h2>
          <div className="mt-4 h-70">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1_00_000
                      ? `₹${(v / 1_00_000).toFixed(1)}L`
                      : `₹${(v / 1000).toFixed(0)}K`
                  }
                  width={64}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-muted-foreground">
                          Revenue: {formatCurrency(d.revenue)}
                        </p>
                        <p className="text-muted-foreground">
                          {d.count} invoices
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="rounded-2xl border border-border bg-white p-6 dark:bg-card">
        <h2 className="text-lg font-semibold text-foreground">
          Top customers by value
        </h2>

        <div className="mt-6 space-y-4">
          {data.topCustomers.map((customer) => {
            const pct = (customer.revenue / maxRevenue) * 100;
            return (
              <div key={customer.name} className="flex items-center gap-4">
                <div className="w-[240px] shrink-0 max-sm:w-[140px]">
                  <p className="truncate text-sm font-medium text-foreground">
                    {customer.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {customer.company}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 flex-1 rounded-full bg-neutral-100 dark:bg-muted">
                      <div
                        className="h-8 rounded-full bg-blue-100 transition-all dark:bg-blue-900/40"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-28 shrink-0 text-right text-sm font-medium text-foreground">
                      {formatCurrency(customer.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
