
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
    
    const duration = 1500;
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
  }, [value, loading, displayValue]);
  
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

  const formatDisplayValue = (val: number) => {
    if (prefix === "$" && val > 999999) {
      return `${prefix}${(val / 1000000).toFixed(1)}M`;
    } else if (prefix === "$" && val > 999) {
      return `${prefix}${(val / 1000).toFixed(0)}K`;
    }
    return `${prefix}${val.toLocaleString()}${suffix}`;
  };
  
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-5 w-5 text-blue-600" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            <div className="h-3 w-16 bg-gray-100 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatDisplayValue(displayValue)}
            </div>
            
            {(description || trend !== undefined) && (
              <p className="text-xs text-gray-500">
                {description}
                {trend !== undefined && (
                  <span className={cn("ml-1 font-medium", trendClassName)}>
                    {trendSign}{trend}% {trendLabel}
                  </span>
                )}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
