import { Card } from '@/components/ui/card';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Gem, TrendingUp, HandHeart, Target } from 'lucide-react';

interface DealerQuickStatsProps {
  allDiamonds: Diamond[];
}

export function DealerQuickStats({ allDiamonds }: DealerQuickStatsProps) {
  const calculatePortfolioValue = (diamonds: Diamond[]) => {
    return diamonds.reduce((sum, d) => sum + (d.price || 0), 0);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const portfolioValue = calculatePortfolioValue(allDiamonds);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Gem className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">My Diamonds</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{allDiamonds.length}</div>
        <div className="text-xs text-muted-foreground">in inventory</div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-muted-foreground">Portfolio</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{formatValue(portfolioValue)}</div>
        <div className="text-xs text-green-600">total value</div>
      </Card>
    </div>
  );
}
