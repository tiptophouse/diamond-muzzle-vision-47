import * as React from "react";
import { Plus, Upload, Zap, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  variant?: "default" | "premium" | "success";
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
  compact?: boolean;
}

export function QuickActions({ actions, className, compact = false }: QuickActionsProps) {
  return (
    <div className={cn(
      "grid gap-3",
      compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      className
    )}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size={compact ? "default" : "lg"}
            onClick={action.action}
            disabled={action.disabled}
            className={cn(
              "flex flex-col gap-2 h-auto py-4 px-4",
              compact && "py-3 px-3"
            )}
          >
            <Icon className={cn(
              "flex-shrink-0",
              compact ? "h-5 w-5" : "h-6 w-6"
            )} />
            <span className={cn(
              "font-medium leading-tight text-center",
              compact ? "text-xs" : "text-sm"
            )}>
              {action.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

// Pre-defined action sets for common use cases
export const commonActions = {
  dashboard: [
    {
      icon: Plus,
      label: "Add Diamond",
      action: () => {}, // Will be overridden
      variant: "premium" as const
    },
    {
      icon: Upload,
      label: "Bulk Upload", 
      action: () => {}, // Will be overridden
      variant: "default" as const
    },
    {
      icon: Search,
      label: "Search",
      action: () => {}, // Will be overridden
      variant: "outline" as const
    },
    {
      icon: Zap,
      label: "AI Analysis",
      action: () => {}, // Will be overridden
      variant: "success" as const
    }
  ]
};