import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-background">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
