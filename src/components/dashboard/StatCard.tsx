
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  description,
  trend,
  trendLabel,
  loading = false,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (loading) return;
    
    const duration = 800;
    const startTime = Date.now();
    const startValue = displayValue;
    
    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const nextValue = Math.floor(startValue + (value - startValue) * easedProgress);
      setDisplayValue(nextValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };
    
    requestAnimationFrame(updateValue);
  }, [value, loading]);
  
  const trendClassName = trend 
    ? trend > 0 
      ? "text-emerald-600" 
      : "text-red-500" 
    : "";
    
  const trendSign = trend 
    ? trend > 0 
      ? "+" 
      : "" 
    : "";
  
  return (
    <Card className={cn(
      "border-0 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]", 
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-8 h-8 rounded-xl bg-background/60 flex items-center justify-center">
            <Icon className="h-4 w-4 text-foreground/80" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              "text-xs font-semibold px-2 py-1 rounded-lg bg-background/60",
              trendClassName
            )}>
              {trendSign}{Math.abs(trend)}%
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 w-16 bg-muted animate-pulse rounded-lg" />
            <div className="h-3 w-12 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-xl font-bold text-foreground leading-none">
              {prefix}
              {displayValue.toLocaleString()}
              {suffix}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground/80 leading-none">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground leading-none">{description}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
