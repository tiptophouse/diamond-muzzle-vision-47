
import { Diamond } from '@/components/inventory/InventoryTable';
import { SecureDiamondDetailShare } from './SecureDiamondDetailShare';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DiamondDetailViewProps {
  diamond: Diamond;
}

export function DiamondDetailView({ diamond }: DiamondDetailViewProps) {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{diamond.carat} ct {diamond.shape}</h1>
              <div className="flex gap-2">
                <Badge variant="outline">{diamond.color}</Badge>
                <Badge variant="outline">{diamond.clarity}</Badge>
                <Badge variant="outline">{diamond.cut}</Badge>
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">Stock:</span> {diamond.stockNumber}</p>
                <p><span className="font-medium">Price:</span> ${diamond.price?.toLocaleString()}</p>
                {diamond.certificateNumber && (
                  <p><span className="font-medium">Certificate:</span> {diamond.certificateNumber}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {diamond.imageUrl && (
                <img 
                  src={diamond.imageUrl} 
                  alt={`${diamond.carat} ct ${diamond.shape}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              {diamond.gem360Url && (
                <iframe
                  src={diamond.gem360Url}
                  className="w-full h-64 rounded-lg border"
                  title="360° Diamond View"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SecureDiamondDetailShare diamond={diamond} />
    </div>
  );
}
