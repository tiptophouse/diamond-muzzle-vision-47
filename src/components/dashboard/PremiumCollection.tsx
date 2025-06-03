
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Diamond {
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  stockNumber: string;
  price: number;
}

interface PremiumCollectionProps {
  premiumDiamonds: Diamond[];
}

export function PremiumCollection({ premiumDiamonds }: PremiumCollectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Premium Collection</CardTitle>
        <CardDescription className="text-sm">
          Highest value diamonds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {premiumDiamonds.slice(0, 8).map((diamond, index) => (
            <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {diamond.carat}ct {diamond.shape} {diamond.color} {diamond.clarity}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stock: {diamond.stockNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">
                  ${(diamond.price || 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${Math.round((diamond.price || 0) / (diamond.carat || 1)).toLocaleString()}/ct
                </p>
              </div>
            </div>
          ))}
          {premiumDiamonds.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No premium diamonds in inventory
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
