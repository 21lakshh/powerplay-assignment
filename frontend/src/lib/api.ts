import type { Invoice, InvoiceStatus } from "@/types/invoice";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }
  return res.json();
}

interface RawInvoice {
  _id: string;
  invoiceId: string;
  customerId: { _id: string; name: string; company: string };
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

function transformInvoice(raw: RawInvoice): Invoice {
  return {
    _id: raw._id,
    invoiceId: raw.invoiceId,
    customerId: raw.customerId._id,
    customer: raw.customerId.name,
    company: raw.customerId.company,
    amount: raw.amount,
    taxRate: raw.taxRate,
    tax: raw.tax,
    total: raw.total,
    status: raw.status,
    issueDate: raw.issueDate,
    dueDate: raw.dueDate,
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  meta: PaginationMeta;
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  customer?: string;
  search?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  taxRate?: number;
}

export interface CreateInvoicePayload {
  customerId: string;
  amount: number;
  taxRate: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

export interface CustomerListItem {
  _id: string;
  name: string;
  company: string;
}

export interface CustomerProfile {
  _id: string;
  name: string;
  company: string;
  totalBilled: number;
  totalTax: number;
  outstanding: number;
  invoiceCount: number;
  statusCounts: Record<InvoiceStatus, number>;
  invoices: RawInvoice[];
}

export interface StatusBreakdown {
  status: string;
  count: number;
  total: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  count: number;
}

export interface SummaryResponse {
  stats: {
    totalBilled: number;
    totalTax: number;
    invoiceCount: number;
    customerCount: number;
  };
  topCustomers: { name: string; company: string; revenue: number }[];
  statusBreakdown: StatusBreakdown[];
  monthlyRevenue: MonthlyRevenue[];
}

export const invoiceApi = {
  list: async (params: InvoiceQueryParams): Promise<InvoiceListResponse> => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "" && value !== "all") {
        searchParams.set(key, String(value));
      }
    }
    const raw = await fetchApi<{ data: RawInvoice[]; meta: PaginationMeta }>(
      `/invoices?${searchParams.toString()}`
    );
    return {
      data: raw.data.map(transformInvoice),
      meta: raw.meta,
    };
  },

  create: async (data: CreateInvoicePayload): Promise<Invoice> => {
    const raw = await fetchApi<RawInvoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformInvoice(raw);
  },

  update: async (
    id: string,
    data: Partial<CreateInvoicePayload>
  ): Promise<Invoice> => {
    const raw = await fetchApi<RawInvoice>(`/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return transformInvoice(raw);
  },
};

export const customerApi = {
  list: async (): Promise<CustomerListItem[]> => {
    return fetchApi<CustomerListItem[]>("/customers");
  },

  getProfile: async (id: string): Promise<CustomerProfile> => {
    return fetchApi<CustomerProfile>(`/customers/${id}`);
  },
};

export const summaryApi = {
  get: async (): Promise<SummaryResponse> => {
    return fetchApi<SummaryResponse>("/summary");
  },
};
