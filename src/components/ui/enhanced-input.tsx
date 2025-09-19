import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "mobile" | "search";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants = {
      default: "h-12 px-4 py-3 rounded-2xl",
      mobile: "h-14 px-6 py-4 rounded-2xl text-base", // Larger for mobile
      search: "h-12 px-4 py-3 rounded-full pl-12", // Space for search icon
    };

    return (
      <input
        type={type}
        className={cn(
          "flex w-full border border-input bg-background text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 shadow-sm focus:shadow-lg hover:border-border/80",
          "touch-manipulation selection:bg-primary/20",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };