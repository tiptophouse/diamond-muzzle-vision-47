import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Diamond, DollarSign, Package, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatData {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
  description?: string;
}

interface ModernStatsGridProps {
  stats: StatData[];
}

const colorVariants = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    ring: 'ring-blue-500/20',
    accent: 'bg-blue-500/10',
    text: 'text-blue-600',
    light: 'bg-blue-50'
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    ring: 'ring-emerald-500/20',
    accent: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    light: 'bg-emerald-50'
  },
  violet: {
    bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    ring: 'ring-violet-500/20',
    accent: 'bg-violet-500/10',
    text: 'text-violet-600',
    light: 'bg-violet-50'
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    ring: 'ring-amber-500/20',
    accent: 'bg-amber-500/10',
    text: 'text-amber-600',
    light: 'bg-amber-50'
  }
};

export function ModernStatsGrid({ stats }: ModernStatsGridProps) {
  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = (changeType?: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-emerald-600 bg-emerald-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const colors = colorVariants[stat.color];
        
        return (
          <Card
            key={index}
            className={cn(
              "relative overflow-hidden p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300",
              "bg-card/60 backdrop-blur-xl hover:scale-[1.02] cursor-pointer group",
              colors.ring, "ring-4"
            )}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background/20" />
            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-gradient-to-br from-primary/5 to-primary/10" />
            
            <div className="relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-4",
                  colors.bg, colors.ring
                )}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                
                {stat.change !== undefined && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-xl border-0",
                      getChangeColor(stat.changeType)
                    )}
                  >
                    {getChangeIcon(stat.changeType)}
                    <span className="ml-1">
                      {stat.changeType === 'neutral' ? '0%' : `${Math.abs(stat.change)}%`}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Value */}
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground/80">
                    {stat.description}
                  </p>
                )}
              </div>
            </div>

            {/* Hover Effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              colors.accent
            )} />
          </Card>
        );
      })}
    </div>
  );
}

// Default stats configuration for dashboard
export const defaultDashboardStats = (data: {
  totalDiamonds: number;
  totalValue: number;
  availableCount: number;
  avgPricePerCarat: number;
}): StatData[] => [
  {
    label: 'Total Inventory',
    value: data.totalDiamonds,
    change: 12,
    changeType: 'increase',
    icon: Diamond,
    color: 'blue',
    description: 'Diamonds in collection'
  },
  {
    label: 'Portfolio Value',
    value: `$${(data.totalValue / 1000000).toFixed(1)}M`,
    change: 8,
    changeType: 'increase',
    icon: DollarSign,
    color: 'emerald',
    description: 'Total collection worth'
  },
  {
    label: 'Available Items',
    value: data.availableCount,
    change: 5,
    changeType: 'increase',
    icon: Package,
    color: 'violet',
    description: 'Ready for sale'
  },
  {
    label: 'Avg Price/Carat',
    value: `$${(data.avgPricePerCarat / 1000).toFixed(0)}K`,
    change: 2,
    changeType: 'decrease',
    icon: Star,
    color: 'amber',
    description: 'Per carat value'
  }
];