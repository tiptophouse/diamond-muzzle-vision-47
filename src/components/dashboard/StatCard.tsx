
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    
    const duration = 1000;
    const startTime = Date.now();
    const startValue = displayValue;
    
    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
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
      ? "text-green-600" 
      : "text-red-600" 
    : "";
    
  const trendSign = trend 
    ? trend > 0 
      ? "+" 
      : "" 
    : "";
  
  return (
    <Card className={cn("border-0 bg-card shadow-sm rounded-lg", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-4 w-4 text-[#0088cc]" />
          {trend !== undefined && (
            <span className={cn("text-xs font-medium", trendClassName)}>
              {trendSign}{Math.abs(trend)}%
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="h-7 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold text-foreground mb-1">
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </div>
        )}
        
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
