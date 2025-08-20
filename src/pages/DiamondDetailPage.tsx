import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gem, MessageCircle, Share2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useSharedDiamondAccess } from '@/hooks/useSharedDiamondAccess';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SecureNavigationWrapper } from "@/components/store/SecureNavigationWrapper";
import { ShareOptionsModal } from "@/components/store/ShareOptionsModal";

interface Diamond {
  id: string;
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  imageUrl?: string;
  gem360Url?: string;
  lab?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  status?: string;
}

function DiamondDetailPage() {
  const { diamondId } = useParams<{ diamondId: string }>();
  const [diamond, setDiamond] = useState<Diamond | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { webApp } = useTelegramWebApp();
  const { validateAndTrackAccess, sendAccessNotification } = useSharedDiamondAccess();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchDiamond = useCallback(async () => {
    if (!diamondId) {
      setError('Diamond ID is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', diamondId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Diamond not found');
      }

      setDiamond(data as Diamond);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch diamond');
      setLoading(false);
    }
  }, [diamondId]);

  useEffect(() => {
    fetchDiamond();
  }, [fetchDiamond]);

  useEffect(() => {
    if (diamondId) {
      validateAndTrackAccess(diamondId)
        .then(canAccess => {
          if (canAccess && diamond) {
            // Send notification about registered user viewing the diamond
            sendAccessNotification(diamondId, 2138564172); // Replace with actual owner ID
          } else if (!canAccess) {
            // Redirect or handle access denial as needed
            console.warn('Access denied to shared diamond');
          }
        });
    }
  }, [diamondId, validateAndTrackAccess, sendAccessNotification, diamond]);

  const handleContact = () => {
    if (!diamond) return;

    const message = `I'm interested in diamond ${diamond.stockNumber} - ${diamond.carat}ct ${diamond.shape}`;
    const encodedMessage = encodeURIComponent(message);

    if (webApp) {
      webApp.switchInlineQuery(encodedMessage);
    } else {
      const telegramLink = `https://t.me/share/url?url=${encodedMessage}`;
      window.open(telegramLink, '_blank');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="w-full h-[400px] rounded-md" />
        <div className="mt-4 space-y-2">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-1/4 h-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        <AlertTriangle className="inline-block h-5 w-5 mr-2" />
        Error: {error}
      </div>
    );
  }

  if (!diamond) {
    return (
      <div className="container mx-auto p-4">
        Diamond not found.
      </div>
    );
  }

  return (
    <SecureNavigationWrapper>
      <div className="container mx-auto p-4">
        <div className="relative">
          {diamond.gem360Url ? (
            <iframe
              src={diamond.gem360Url}
              title={`360 View of Diamond ${diamond.stockNumber}`}
              width="100%"
              height="400px"
              style={{ border: 'none', borderRadius: '0.5rem' }}
            />
          ) : diamond.imageUrl ? (
            <img
              src={diamond.imageUrl}
              alt={`Diamond ${diamond.stockNumber}`}
              className="w-full h-auto rounded-md"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          ) : (
            <div className="w-full h-[400px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              No media available
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">{diamond.status || 'Available'}</Badge>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">{diamond.carat} ct {diamond.shape}</h1>
          <p className="text-gray-600">Stock #: {diamond.stockNumber}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Color</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{diamond.color}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clarity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{diamond.clarity}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cut</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{diamond.cut}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900">Price</h2>
          <p className="text-2xl text-blue-600 font-bold">${diamond.price?.toLocaleString()}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={handleContact} className="bg-blue-500 text-white hover:bg-blue-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button onClick={handleShare} className="bg-green-500 text-white hover:bg-green-700">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <ShareOptionsModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        diamond={diamond}
        showStoreOption={true}
      />
    </SecureNavigationWrapper>
  );
}

export default DiamondDetailPage;
