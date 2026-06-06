import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/page-container";
import { SearchBar } from "@/components/search-bar";
import { FilterBar } from "@/components/filter-bar";
import { DataTable } from "@/components/data-table";
import { PaginationBar } from "@/components/pagination";
import { getInvoiceColumns, type SortState } from "./invoice-columns";
import { InvoiceModal } from "./invoice-modal";
import { InvoiceDashboardSkeleton } from "./invoice-dashboard-skeleton";
import {
  invoiceApi,
  type InvoiceListResponse,
  type InvoiceQueryParams,
} from "@/lib/api";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

const PAGE_SIZE = 20;

export function InvoiceDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [taxFilter, setTaxFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [data, setData] = useState<InvoiceListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortState>({ sortBy: "issueDate", sortOrder: "desc" });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchInvoices = useCallback(async (params: InvoiceQueryParams) => {
    setLoading(true);
    try {
      const result = await invoiceApi.list(params);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const buildParams = useCallback((): InvoiceQueryParams => {
    const params: InvoiceQueryParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      status: statusFilter !== "all" ? statusFilter : undefined,
      taxRate: taxFilter !== "all" ? Number(taxFilter) : undefined,
      search: search || undefined,
    };

    if (dateFilter !== "all") {
      const now = new Date();
      const daysMap: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      };
      const days = daysMap[dateFilter];
      if (days) {
        const from = new Date(now.getTime() - days * 86400000);
        params.issueDateFrom = from.toISOString().split("T")[0];
        params.issueDateTo = now.toISOString().split("T")[0];
      }
    }

    return params;
  }, [currentPage, sort, statusFilter, taxFilter, dateFilter, search]);

  useEffect(() => {
    const params = buildParams();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search) {
      debounceRef.current = setTimeout(() => fetchInvoices(params), 300);
    } else {
      fetchInvoices(params);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [buildParams, search, fetchInvoices]);

  const handleSort = useCallback((field: string) => {
    setSort((prev) =>
      prev.sortBy === field
        ? { sortBy: field, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }
        : { sortBy: field, sortOrder: "desc" }
    );
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(
    async (invoiceId: string, status: InvoiceStatus) => {
      try {
        await invoiceApi.update(invoiceId, { status });
        setData((prev) =>
          prev
            ? {
                ...prev,
                data: prev.data.map((inv) =>
                  inv._id === invoiceId ? { ...inv, status } : inv
                ),
              }
            : prev
        );
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    },
    []
  );

  const handleSuccess = () => {
    setModalOpen(false);
    setEditingInvoice(undefined);
    fetchInvoices(buildParams());
  };

  const columns = useMemo(
    () =>
      getInvoiceColumns({
        onEdit: (invoice: Invoice) => {
          setEditingInvoice(invoice);
          setModalOpen(true);
        },
        onStatusChange: handleStatusChange,
        sort,
        onSort: handleSort,
      }),
    [handleStatusChange, sort, handleSort]
  );

  if (loading && !data) {
    return <InvoiceDashboardSkeleton />;
  }

  return (
    <>
      <PageContainer>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 max-sm:flex-col max-sm:items-stretch">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Invoices
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 flex-1 rounded-xl sm:flex-none"
              onClick={() => navigate("/invoices/summary")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Summary
            </Button>
            <Button
              className="h-10 flex-1 rounded-xl sm:flex-none"
              onClick={() => {
                setEditingInvoice(undefined);
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Filters */}
        <div className="flex items-center gap-3 px-6 py-5 max-sm:flex-col max-sm:items-stretch max-lg:flex-wrap">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            placeholder="Search invoice / customer"
          />
          <FilterBar
            statusFilter={statusFilter}
            onStatusChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
            taxFilter={taxFilter}
            onTaxChange={(v) => {
              setTaxFilter(v);
              setCurrentPage(1);
            }}
            dateFilter={dateFilter}
            onDateChange={(v) => {
              setDateFilter(v);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className="border-t border-border">
          <DataTable columns={columns} data={data?.data ?? []} />
        </div>

        {/* Pagination */}
        <PaginationBar
          currentPage={data?.meta.page ?? 1}
          totalPages={data?.meta.totalPages ?? 1}
          totalItems={data?.meta.total ?? 0}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </PageContainer>

      <InvoiceModal
        open={modalOpen}
        onOpenChange={(v) => {
          setModalOpen(v);
          if (!v) setEditingInvoice(undefined);
        }}
        invoice={editingInvoice}
        onSuccess={handleSuccess}
      />
    </>
  );
}
