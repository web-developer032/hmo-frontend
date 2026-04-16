import { cn } from "../../lib/utils/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function LineChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-64 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function BarChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
