import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";

const InvoiceDashboard = lazy(() =>
  import("@/features/invoices/invoice-dashboard").then((m) => ({
    default: m.InvoiceDashboard,
  }))
);

const CustomerProfile = lazy(() =>
  import("@/features/customers/customer-profile").then((m) => ({
    default: m.CustomerProfile,
  }))
);

const SummaryPage = lazy(() =>
  import("@/features/summary/summary-page").then((m) => ({
    default: m.SummaryPage,
  }))
);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/invoices" replace />,
      },
      {
        path: "/invoices",
        element: <InvoiceDashboard />,
      },
      {
        path: "/invoices/customers/:customerId",
        element: <CustomerProfile />,
      },
      {
        path: "/invoices/summary",
        element: <SummaryPage />,
      },
    ],
  },
]);
