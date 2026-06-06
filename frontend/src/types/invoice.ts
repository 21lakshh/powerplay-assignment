export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue" | "Draft" | "Sent" | "Void";

export interface Invoice {
  _id: string;
  invoiceId: string;
  customerId: string;
  customer: string;
  company: string;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}
