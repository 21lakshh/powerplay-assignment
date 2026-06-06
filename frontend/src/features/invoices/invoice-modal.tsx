import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { STATUS_OPTIONS, TAX_RATES } from "@/lib/constants";
import {
  invoiceApi,
  customerApi,
  type CustomerListItem,
} from "@/lib/api";
import type { Invoice } from "@/types/invoice";

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  company: z.string(),
  amount: z.number().positive("Amount must be positive"),
  taxRate: z.number().min(0),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice;
  onSuccess?: () => void;
}

export function InvoiceModal({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: InvoiceModalProps) {
  const isEdit = !!invoice;
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      company: "",
      amount: 0,
      taxRate: 18,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      status: "Draft",
    },
  });

  useEffect(() => {
    if (open) {
      customerApi.list().then(setCustomers).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    if (open && invoice) {
      reset({
        customerId: invoice.customerId,
        company: invoice.company,
        amount: invoice.amount,
        taxRate: invoice.taxRate,
        issueDate: invoice.issueDate.split("T")[0],
        dueDate: invoice.dueDate.split("T")[0],
        status: invoice.status,
      });
    } else if (open && !invoice) {
      reset({
        customerId: "",
        company: "",
        amount: 0,
        taxRate: 18,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        status: "Draft",
      });
    }
  }, [open, invoice, reset]);

  const amount = watch("amount");
  const taxRate = watch("taxRate");

  const computed = useMemo(() => {
    const tax = (amount * taxRate) / 100;
    const total = amount + tax;
    return { tax, total };
  }, [amount, taxRate]);

  const handleCustomerChange = (value: string) => {
    setValue("customerId", value);
    const customer = customers.find((c) => c._id === value);
    setValue("company", customer?.company ?? "");
  };

  const handleSubmit = async () => {
    const data = watch();
    if (!data.customerId || !data.amount || !data.issueDate || !data.dueDate) return;

    setSubmitting(true);
    try {
      const payload = {
        customerId: data.customerId,
        amount: data.amount,
        taxRate: data.taxRate,
        status: data.status,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
      };

      if (isEdit && invoice) {
        await invoiceApi.update(invoice._id, payload);
      } else {
        await invoiceApi.create(payload);
      }
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save invoice:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomerId = watch("customerId");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[800px] rounded-2xl p-8 max-sm:max-w-[95vw] max-sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Edit Invoice" : "New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Customer */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Customer
            </Label>
            <Select
              value={selectedCustomerId}
              onValueChange={handleCustomerChange}
            >
              <SelectTrigger className="h-12 w-full rounded-xl">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customerId && (
              <p className="text-xs text-red-500">
                {errors.customerId.message}
              </p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Company
            </Label>
            <Input
              {...register("company")}
              readOnly
              className="h-12 rounded-xl bg-neutral-50 dark:bg-muted"
              placeholder="Auto-populated from customer"
            />
          </div>

          {/* Amount + Tax Rate */}
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Amount
              </Label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="h-12 rounded-xl"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-xs text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Tax rate
              </Label>
              <Select
                value={String(watch("taxRate"))}
                onValueChange={(v) => setValue("taxRate", Number(v))}
              >
                <SelectTrigger className="h-12 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_RATES.map((rate) => (
                    <SelectItem key={rate} value={String(rate)}>
                      {rate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Issue Date + Due Date */}
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Issue date
              </Label>
              <Input
                type="date"
                {...register("issueDate")}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Due date
              </Label>
              <Input
                type="date"
                {...register("dueDate")}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Status
            </Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v)}
            >
              <SelectTrigger className="h-12 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Computed Summary */}
          <div className="flex h-16 items-center justify-center gap-4 rounded-xl bg-neutral-50 px-6 text-sm dark:bg-muted">
            <span className="text-muted-foreground">
              Tax:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(computed.tax)}
              </span>
            </span>
            <span className="text-neutral-300">&bull;</span>
            <span className="text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(computed.total)}
              </span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="h-11 rounded-xl"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Update Invoice"
                : "Save Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function InvoiceModalSkeleton() {
  return (
    <div className="space-y-5 p-8">
      <Skeleton className="h-7 w-32" />
      <div className="mt-4 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-11 w-24 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
