import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users2, 
  TrendingUp, 
  ArrowRight, 
  Zap,
  BarChart3,
  Package,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardContentProps {
  children?: React.ReactNode;
  onNavigate?: (path: string) => void;
}

export function EnhancedDashboardContent({ children, onNavigate }: DashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <Card className="border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Data
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Diamond Portfolio
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Professional diamond inventory management with real-time analytics and market insights.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                onClick={() => onNavigate?.('/inventory')}
                className="rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Package className="h-5 w-5 mr-2" />
                View Inventory
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => onNavigate?.('/insights')}
                className="rounded-2xl px-6 py-3"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 -mr-48 -mt-48 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl" />
        </Card>
      </div>

      {/* Stats Grid */}
      {children}

      {/* Quick Actions Section */}
      <Card className="p-6 border-0 shadow-lg bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Streamlined access to key features</p>
          </div>
          <Users2 className="h-6 w-6 text-primary" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-3 rounded-2xl hover:bg-accent/60 transition-all duration-200"
            onClick={() => onNavigate?.('/upload')}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Add Diamonds</div>
              <div className="text-xs text-muted-foreground">Upload inventory</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-3 rounded-2xl hover:bg-accent/60 transition-all duration-200"
            onClick={() => onNavigate?.('/insights')}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Market Insights</div>
              <div className="text-xs text-muted-foreground">View analytics</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-3 rounded-2xl hover:bg-accent/60 transition-all duration-200"
            onClick={() => onNavigate?.('/store')}
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-violet-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Premium Store</div>
              <div className="text-xs text-muted-foreground">Browse catalog</div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}