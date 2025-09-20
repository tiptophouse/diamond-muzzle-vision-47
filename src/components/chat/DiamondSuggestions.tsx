import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gem, Eye } from "lucide-react";
import { Diamond } from "@/components/inventory/InventoryTable";
import { formatCurrency } from "@/utils/numberUtils";
import { useNavigate } from "react-router-dom";

interface DiamondSuggestionsProps {
  diamonds: Diamond[];
}

export function DiamondSuggestions({ diamonds }: DiamondSuggestionsProps) {
  const navigate = useNavigate();

  if (diamonds.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gem className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Recommended for you</span>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {diamonds.map((diamond) => (
            <Card key={diamond.id} className="flex-shrink-0 w-64 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">
                      {diamond.carat} ct {diamond.shape}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {diamond.stockNumber}
                    </p>
                  </div>
                  {diamond.imageUrl && (
                    <img 
                      src={diamond.imageUrl} 
                      alt={`${diamond.shape} diamond`}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {diamond.color}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {diamond.clarity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {diamond.cut}
                    </Badge>
                  </div>
                  
                  {diamond.price > 0 && (
                    <p className="font-semibold text-sm">
                      {formatCurrency(diamond.price)}
                    </p>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8 text-xs"
                  onClick={() => navigate(`/diamond/${diamond.stockNumber}`)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}