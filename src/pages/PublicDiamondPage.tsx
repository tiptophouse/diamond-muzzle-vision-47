import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ExternalLink, Eye, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { OptimizedDiamondImage } from '@/components/store/OptimizedDiamondImage';

interface PublicDiamond {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  certificateNumber?: string;
  lab?: string;
  imageUrl?: string;
  gem360Url?: string;
  telegramLink: string;
  shareData: {
    title: string;
    description: string;
    price: number;
    image?: string;
    formattedPrice: string;
  };
}

export default function PublicDiamondPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const [diamond, setDiamond] = useState<PublicDiamond | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockNumber) {
      setError('Invalid diamond link');
      setLoading(false);
      return;
    }

    fetchPublicDiamond(stockNumber);
  }, [stockNumber]);

  const fetchPublicDiamond = async (stock: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use the public edge function that doesn't require JWT
      const response = await fetch(
        `${window.location.origin}/functions/v1/public-diamond-share?stock=${encodeURIComponent(stock)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Diamond not found or no longer available');
        } else {
          setError('Failed to load diamond details');
        }
        return;
      }

      const diamondData = await response.json();
      setDiamond(diamondData);

      // Update page title and meta for sharing
      document.title = `${diamondData.shareData.title} - ${diamondData.shareData.formattedPrice}`;
      
    } catch (err) {
      console.error('Failed to fetch public diamond:', err);
      setError('Failed to load diamond details');
    } finally {
      setLoading(false);
    }
  };

  const openInTelegram = () => {
    if (diamond?.telegramLink) {
      window.open(diamond.telegramLink, '_blank');
    }
  };

  const shareNatively = async () => {
    if (!diamond) return;

    const shareData = {
      title: diamond.shareData.title,
      text: `${diamond.shareData.description}\n\nPrice: ${diamond.shareData.formattedPrice}\nStock: ${diamond.stockNumber}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading diamond details...</p>
        </div>
      </div>
    );
  }

  if (error || !diamond) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-lg font-semibold mb-2">Diamond Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'This diamond may no longer be available or the link is invalid.'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Browse Available Diamonds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Diamond Details</span>
            </div>
            <Button variant="outline" size="sm" onClick={shareNatively}>
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Diamond Image - Large Hero Display */}
        <Card>
          <CardContent className="p-0">
            <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden h-96 md:h-[500px]">
              {diamond.imageUrl ? (
                <OptimizedDiamondImage
                  imageUrl={diamond.imageUrl}
                  stockNumber={diamond.stockNumber}
                  shape="Round"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Diamond Image</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Diamond Info */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">{diamond.shareData.title}</h1>
              <div className="text-3xl font-bold text-primary mb-2">
                {diamond.shareData.formattedPrice}
              </div>
              <Badge variant="outline">Stock: {diamond.stockNumber}</Badge>
            </div>

            <Separator className="my-6" />

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Shape</span>
                  <div className="font-medium">{diamond.shape}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Color</span>
                  <div className="font-medium">{diamond.color}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cut</span>
                  <div className="font-medium">{diamond.cut}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Weight</span>
                  <div className="font-medium">{diamond.carat} ct</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Clarity</span>
                  <div className="font-medium">{diamond.clarity}</div>
                </div>
                {diamond.lab && (
                  <div>
                    <span className="text-muted-foreground">Lab</span>
                    <div className="font-medium">{diamond.lab}</div>
                  </div>
                )}
              </div>
            </div>

            {diamond.certificateNumber && (
              <>
                <Separator className="my-6" />
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Certificate</span>
                  <div className="font-medium">{diamond.certificateNumber}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={openInTelegram} className="w-full" size="lg">
            <ArrowRight className="h-5 w-5 mr-2" />
            View in Telegram App
          </Button>
          
          {diamond.gem360Url && (
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => window.open(diamond.gem360Url, '_blank')}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              View 360° Preview
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>This diamond is available through our Telegram bot</p>
          <p>Click "View in Telegram App" to inquire or purchase</p>
        </div>
      </div>
    </div>
  );
}