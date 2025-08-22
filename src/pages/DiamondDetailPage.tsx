
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowLeft, Share2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { ShareButton } from '@/components/store/ShareButton';
import { Diamond } from '@/components/inventory/InventoryTable';

export default function DiamondDetailPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { addToWishlist, isLoading } = useWishlist();
  const [diamond, setDiamond] = useState<Diamond | null>(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    // Load diamond data - mock for now
    if (stockNumber) {
      setDiamond({
        id: '1',
        stockNumber: stockNumber,
        shape: 'Round',
        carat: 1.5,
        color: 'G',
        clarity: 'VS1',
        cut: 'Excellent',
        price: 15000,
        status: 'Available',
        depth: 62.5, // Add depth property
        imageUrl: '/placeholder.svg'
      });
    }
  }, [stockNumber]);

  const handleAddToWishlist = async () => {
    if (diamond) {
      const success = await addToWishlist(diamond, 123456789); // Use proper owner ID
      if (success) {
        setInWishlist(true);
      }
    }
  };

  if (!diamond) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Diamond not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <img
                src={diamond.imageUrl || '/placeholder.svg'}
                alt={`Diamond ${diamond.stockNumber}`}
                className="w-full h-96 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {diamond.shape} Diamond
            </h1>
            <p className="text-muted-foreground">Stock: {diamond.stockNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Carat</label>
              <p className="text-lg font-semibold">{diamond.carat}ct</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Color</label>
              <p className="text-lg font-semibold">{diamond.color}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Clarity</label>
              <p className="text-lg font-semibold">{diamond.clarity}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cut</label>
              <p className="text-lg font-semibold">{diamond.cut}</p>
            </div>
            {diamond.depth && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Depth</label>
                <p className="text-lg font-semibold">{diamond.depth}%</p>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="text-3xl font-bold text-primary mb-4">
              ${diamond.price.toLocaleString()}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleAddToWishlist}
                disabled={isLoading || inWishlist}
                className="flex-1"
              >
                <Heart className={`w-4 h-4 mr-2 ${inWishlist ? 'fill-current' : ''}`} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
              
              <ShareButton stockNumber={diamond.stockNumber} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Diamond Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
                  {diamond.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Price per Carat:</span>
                <span>${Math.round(diamond.price / diamond.carat).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
