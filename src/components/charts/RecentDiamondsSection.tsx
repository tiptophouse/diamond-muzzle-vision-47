import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Diamond, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface DiamondData {
  id: string;
  stock: string;
  weight?: number;
  carat?: number;
  shape: string;
  color: string;
  clarity: string;
  price_per_carat?: number;
}

interface RecentDiamondsSectionProps {
  diamonds: DiamondData[];
  isLoading: boolean;
}

export function RecentDiamondsSection({ diamonds, isLoading }: RecentDiamondsSectionProps) {
  const navigate = useNavigate();
  const { impactOccurred } = useTelegramHapticFeedback();

  const handleViewAll = () => {
    impactOccurred('light');
    navigate('/inventory');
  };

  const handleDiamondClick = (diamond: any) => {
    impactOccurred('light');
    if (diamond.stockNumber || diamond.stock) {
      navigate(`/diamond/${diamond.stockNumber || diamond.stock}`);
    }
  };

  return (
    <Card className="bg-background/60 backdrop-blur-sm border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Diamonds
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : diamonds.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Diamond className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm">No recent diamonds found</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {diamonds.slice(0, 4).map((diamond, index) => (
                <div 
                  key={diamond.id || index} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer active:scale-95"
                  onClick={() => handleDiamondClick(diamond)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Diamond className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {diamond.stock || `Diamond ${index + 1}`}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{diamond.weight || diamond.carat || 0}ct</span>
                        <span>•</span>
                        <Badge variant="outline" className="h-4 px-1.5 text-xs font-medium">
                          {diamond.color || 'D'}
                        </Badge>
                        <Badge variant="outline" className="h-4 px-1.5 text-xs font-medium">
                          {diamond.clarity || 'FL'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      ${((diamond.price_per_carat || 0) * (diamond.weight || diamond.carat || 0)).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(diamond.price_per_carat || 0).toLocaleString()}/ct
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {diamonds.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <Button 
                  onClick={handleViewAll}
                  variant="outline" 
                  className="w-full h-10"
                  size="sm"
                >
                  <span>View All Diamonds</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}