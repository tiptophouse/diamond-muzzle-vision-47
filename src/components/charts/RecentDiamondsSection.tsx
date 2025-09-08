import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/numberUtils";
import { Clock, Gem } from "lucide-react";
import { format } from "date-fns";

interface DiamondData {
  id: string;
  shape: string;
  color: string;
  clarity: string;
  carat: number;
  price: number;
  certificate_number: string;
  created_at: string;
}

interface RecentDiamondsSectionProps {
  diamonds: DiamondData[];
  loading?: boolean;
}

export function RecentDiamondsSection({ diamonds, loading = false }: RecentDiamondsSectionProps) {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50/30 to-cyan-100/20 border-blue-200/30">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Additions
          </CardTitle>
          <CardDescription>Latest diamonds added to inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!diamonds || diamonds.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-50/30 to-cyan-100/20 border-blue-200/30">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Additions
          </CardTitle>
          <CardDescription>Latest diamonds added to inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-muted-foreground">No recent diamonds found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50/30 to-cyan-100/20 border-blue-200/30">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Recent Additions
        </CardTitle>
        <CardDescription>Latest diamonds added • {diamonds.length} showing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
          {diamonds.map((diamond) => (
            <div 
              key={diamond.id} 
              className="flex items-center gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/20 hover:bg-background/80 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Gem className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {diamond.carat}ct {diamond.shape}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                      {diamond.color}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                      {diamond.clarity}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(diamond.created_at), 'MMM dd, HH:mm')}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(diamond.price)}
                  </p>
                </div>
                
                {diamond.certificate_number && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Cert: {diamond.certificate_number}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {diamonds.length > 5 && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(diamonds.length, 10)} of {diamonds.length} recent diamonds
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}