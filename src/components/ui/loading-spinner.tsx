import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-lg bg-muted",
        className
      )} 
    />
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-2xl border border-border/20 bg-card p-6 animate-scale-in">
      <div className="space-y-4">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
        <LoadingSkeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-8 w-20 rounded-xl" />
          <LoadingSkeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}