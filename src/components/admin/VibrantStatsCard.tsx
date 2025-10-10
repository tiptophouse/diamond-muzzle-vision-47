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
  delay?: number;
}

const gradientClasses = {
  primary: 'from-blue-500 via-blue-600 to-indigo-600',
  secondary: 'from-purple-500 via-purple-600 to-pink-600',
  accent: 'from-green-500 via-emerald-600 to-teal-600',
  success: 'from-emerald-500 via-green-600 to-teal-600',
  warning: 'from-amber-500 via-orange-600 to-red-500',
  danger: 'from-red-500 via-rose-600 to-pink-600',
};

const glowClasses = {
  primary: 'shadow-blue-500/50',
  secondary: 'shadow-purple-500/50',
  accent: 'shadow-green-500/50',
  success: 'shadow-emerald-500/50',
  warning: 'shadow-amber-500/50',
  danger: 'shadow-red-500/50',
};

export function VibrantStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  trend,
  delay = 0
}: VibrantStatsCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 touch-manipulation active:scale-95 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Background with animation */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity duration-500",
        gradientClasses[gradient]
      )}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent)]" />
      </div>
      
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500",
        glowClasses[gradient]
      )} />
      
      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-90 mb-2 tracking-wide uppercase">{title}</p>
            <p className="text-4xl font-black tracking-tight mb-1 animate-counter">{value}</p>
            {subtitle && (
              <p className="text-xs opacity-80 font-medium">{subtitle}</p>
            )}
          </div>
          
          {/* Icon with glassmorphism */}
          <div className="bg-white/25 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-7 w-7 drop-shadow-lg" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/20">
            <div className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm",
              trend.isPositive 
                ? "bg-green-500/30 text-green-100 border border-green-400/30" 
                : "bg-red-500/30 text-red-100 border border-red-400/30"
            )}>
              <span className="text-base">{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-xs opacity-75 font-medium">vs last period</span>
          </div>
        )}
      </div>
      
      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}
