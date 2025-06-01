
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Diamond, DollarSign, Eye, Users } from 'lucide-react';
import { Diamond as DiamondType } from '@/components/inventory/InventoryTable';

interface EnhancedStatsGridProps {
  diamonds: DiamondType[];
  loading?: boolean;
}

export function EnhancedStatsGrid({ diamonds, loading }: EnhancedStatsGridProps) {
  const totalValue = diamonds.reduce((sum, diamond) => sum + (diamond.price || 0), 0);
  const averagePrice = diamonds.length > 0 ? totalValue / diamonds.length : 0;
  const availableDiamonds = diamonds.filter(d => d.status === 'Available').length;
  const premiumDiamonds = diamonds.filter(d => (d.price || 0) > 10000).length;

  const stats = [
    {
      title: 'Total Inventory',
      value: diamonds.length.toLocaleString(),
      icon: Diamond,
      trend: '+12%',
      trendUp: true,
      description: 'Diamonds in collection',
      color: 'text-diamond-600'
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+8.2%',
      trendUp: true,
      description: 'Portfolio value',
      color: 'text-green-600'
    },
    {
      title: 'Average Price',
      value: `$${Math.round(averagePrice).toLocaleString()}`,
      icon: TrendingUp,
      trend: '+5.1%',
      trendUp: true,
      description: 'Per diamond',
      color: 'text-blue-600'
    },
    {
      title: 'Available',
      value: availableDiamonds.toLocaleString(),
      icon: Eye,
      trend: '-2.3%',
      trendUp: false,
      description: 'Ready for sale',
      color: 'text-purple-600'
    },
    {
      title: 'Premium Stones',
      value: premiumDiamonds.toLocaleString(),
      icon: Users,
      trend: '+15%',
      trendUp: true,
      description: 'Above $10k',
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-card hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div className={`flex items-center text-xs ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
