import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-6 max-md:px-4">
      <div
        className={cn(
          "rounded-2xl border border-border bg-white dark:bg-card",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
