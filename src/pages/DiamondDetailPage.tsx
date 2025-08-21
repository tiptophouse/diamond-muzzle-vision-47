import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramNavigation } from '@/hooks/useTelegramNavigation';
import { api, apiEndpoints } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface DiamondData {
  id: string;
  stock_number: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut?: string;
  price: number;
  status: string;
  picture?: string;
  certificate_url?: string;
  v360_url?: string;
  gem360_url?: string;
}

export default function DiamondDetailPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { user } = useTelegramAuth();
  const telegramNavigation = useTelegramNavigation();
  
  // Fix the impactFeedback call - remove the parameter
  const handleFeedback = () => {
    try {
      telegramNavigation.impactFeedback();
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  };

  const [diamond, setDiamond] = useState<DiamondData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!stockNumber) {
      toast({
        title: "Error",
        description: "Stock number is missing",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const fetchDiamond = async () => {
      try {
        const response = await api.get(apiEndpoints.getStoneByStockNumber(stockNumber));
        if (response.data) {
          setDiamond(response.data);
        } else {
          toast({
            title: "Error",
            description: "Diamond not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching diamond:", error);
        toast({
          title: "Error",
          description: "Failed to load diamond details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiamond();
  }, [stockNumber, toast]);

  const handleShare = () => {
    if (!diamond) return;

    const shareData = {
      title: `Check out this diamond: ${diamond.stock_number}`,
      text: `${diamond.shape} ${diamond.carat}ct ${diamond.color} ${diamond.clarity} Diamond`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        .then(() => toast({ description: "Link copied to clipboard!" }))
        .catch((error) => console.error('Error copying to clipboard:', error));
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    handleFeedback();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading diamond details...</div>;
  }

  if (!diamond) {
    return <div className="min-h-screen flex items-center justify-center">Diamond not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary py-4 px-6 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFavorite}>
            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500' : ''}`} />
          </Button>
        </div>
      </header>

      <section className="p-6 space-y-4">
        <div className="relative">
          {diamond.picture && (
            <img
              src={diamond.picture}
              alt={diamond.stock_number}
              className="w-full rounded-md aspect-square object-cover"
            />
          )}
          <Badge className="absolute top-2 left-2 bg-secondary border-0">
            {diamond.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{diamond.shape} Diamond</h2>
          <p className="text-muted-foreground">Stock Number: {diamond.stock_number}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold">Carat</p>
            <p>{diamond.carat}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Color</p>
            <p>{diamond.color}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Clarity</p>
            <p>{diamond.clarity}</p>
          </div>
          {diamond.cut && (
            <div>
              <p className="text-sm font-bold">Cut</p>
              <p>{diamond.cut}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Price</h3>
          <p className="text-green-600 text-xl font-bold">${diamond.price}</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Links</h3>
          <div className="flex flex-col space-y-2">
            {diamond.certificate_url && (
              <Button asChild variant="link" className="justify-start">
                <a href={diamond.certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Certificate
                </a>
              </Button>
            )}
            {diamond.v360_url && (
              <Button asChild variant="link" className="justify-start">
                <a href={diamond.v360_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  360° View
                </a>
              </Button>
            )}
            {diamond.gem360_url && (
              <Button asChild variant="link" className="justify-start">
                <a href={diamond.gem360_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Gem 360° View
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
