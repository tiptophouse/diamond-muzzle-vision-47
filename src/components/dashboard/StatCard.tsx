
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
    <Card className={cn("diamond-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-diamond-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div className="stat-value animate-counter">
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </div>
        )}
        
        {(description || trend !== undefined) && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
            
            {trend !== undefined && (
              <span className={cn("ml-1", trendClassName)}>
                {trendSign}{trend}% {trendLabel}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
