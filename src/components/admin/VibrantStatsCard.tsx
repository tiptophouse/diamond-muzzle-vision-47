import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VibrantStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const gradientClasses = {
  primary: 'from-blue-500 to-blue-600',
  secondary: 'from-purple-500 to-purple-600',
  accent: 'from-green-500 to-green-600',
  success: 'from-emerald-500 to-emerald-600',
  warning: 'from-amber-500 to-amber-600',
  danger: 'from-red-500 to-red-600',
};

export function VibrantStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  trend 
}: VibrantStatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg touch-manipulation active:scale-95 transition-transform">
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-90",
        gradientClasses[gradient]
      )} />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)] opacity-50" />
      
      {/* Content */}
      <div className="relative p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <span className={cn(
              "font-semibold",
              trend.isPositive ? "text-green-100" : "text-red-100"
            )}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="opacity-75">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
