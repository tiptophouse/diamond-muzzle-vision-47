import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diamond, Eye, Phone, Clock, RotateCcw } from 'lucide-react';
import { useSharedDiamondAccess } from '@/hooks/useSharedDiamondAccess';
import { useDiamondShareAnalytics } from '@/hooks/useDiamondShareAnalytics';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';

interface DiamondData {
  id: string;
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  price_per_carat: number;
  picture: string;
  gem360_url?: string;
  certificate_url?: string;
  user_id: number;
}

export function SecureDiamondViewer() {
  const { stockNumber } = useParams();
  const [searchParams] = useSearchParams();
  const [diamond, setDiamond] = useState<DiamondData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [viewTime, setViewTime] = useState(0);
  const { validateAndTrackAccess, sendAccessNotification } = useSharedDiamondAccess();
  const { trackDiamondView, trackTimeSpent } = useDiamondShareAnalytics(stockNumber || '');
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const { toast } = useToast();

  useEffect(() => {
    let viewTimer: NodeJS.Timeout;
    
    if (accessGranted) {
      viewTimer = setInterval(() => {
        setViewTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (viewTimer) {
        clearInterval(viewTimer);
        // Track time spent when component unmounts
        if (viewTime > 0) {
          trackTimeSpent(viewTime, false);
        }
      }
    };
  }, [accessGranted, viewTime, trackTimeSpent]);

  useEffect(() => {
    const initializeViewer = async () => {
      if (!stockNumber) return;

      try {
        // Validate access first
        const hasAccess = await validateAndTrackAccess(stockNumber);
        
        if (!hasAccess) {
          setLoading(false);
          return;
        }

        setAccessGranted(true);

        // Fetch diamond data
        const { data: diamondData, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('stock_number', stockNumber)
          .eq('store_visible', true)
          .single();

        if (error || !diamondData) {
          console.error('Error fetching diamond:', error);
          toast({
            title: "Diamond Not Found",
            description: "The requested diamond is not available or has been removed.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        setDiamond(diamondData);

        // Track diamond view
        await trackDiamondView({
          deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          userAgent: navigator.userAgent,
          referrer: document.referrer
        });

        // Notify owner of the access
        if (searchParams.get('shared') === 'true') {
          await sendAccessNotification(stockNumber, diamondData.user_id);
        }

      } catch (error) {
        console.error('Error initializing viewer:', error);
        toast({
          title: "Access Error",
          description: "Failed to load diamond details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeViewer();
  }, [stockNumber, searchParams, validateAndTrackAccess, trackDiamondView, sendAccessNotification, toast]);

  const handleContactOwner = () => {
    impactOccurred('medium');
    
    // Send contact request via Telegram
    if ((window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      
      webApp.sendData(JSON.stringify({
        action: 'contact_diamond_owner',
        data: {
          diamondStockNumber: stockNumber,
          diamondDetails: {
            shape: diamond?.shape,
            carat: diamond?.weight,
            color: diamond?.color,
            clarity: diamond?.clarity
          },
          ownerId: diamond?.user_id,
          timestamp: Date.now()
        }
      }));

      notificationOccurred('success');
      toast({
        title: "Contact Request Sent",
        description: "The diamond owner has been notified of your interest."
      });
    }
  };

  const handle360View = () => {
    impactOccurred('light');
    if (diamond?.gem360_url) {
      window.open(diamond.gem360_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Diamond className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Diamond...</h3>
            <p className="text-muted-foreground">Verifying access and loading details</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accessGranted || !diamond) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <Eye className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-800">Access Restricted</h3>
            <p className="text-red-600 mb-4">
              This diamond is only viewable by registered users within the Telegram Mini App.
            </p>
            <Button 
              variant="outline" 
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => window.location.href = '/'}
            >
              Register Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header with viewing stats */}
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Diamond className="h-5 w-5 text-purple-600" />
                Secure Diamond View
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {Math.floor(viewTime / 60)}m {viewTime % 60}s
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main diamond card */}
        <Card className="mb-6 overflow-hidden bg-white shadow-xl">
          <div className="grid md:grid-cols-2">
            {/* Image section */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 min-h-[400px] flex items-center justify-center">
              {diamond.picture ? (
                <img 
                  src={diamond.picture} 
                  alt={`${diamond.weight}ct ${diamond.shape} Diamond`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Diamond className="h-24 w-24 text-gray-400" />
              )}
              
              {diamond.gem360_url && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur"
                  onClick={handle360View}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  360° View
                </Button>
              )}
            </div>

            {/* Details section */}
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {diamond.weight} ct {diamond.shape} Diamond
                  </h1>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    Stock #{diamond.stock_number}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Color</label>
                      <p className="text-lg font-semibold">{diamond.color}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Clarity</label>
                      <p className="text-lg font-semibold">{diamond.clarity}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cut</label>
                      <p className="text-lg font-semibold">{diamond.cut || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Price/Carat</label>
                      <p className="text-lg font-semibold">
                        ${diamond.price_per_carat?.toLocaleString() || 'Contact for Price'}
                      </p>
                    </div>
                  </div>
                </div>

                {diamond.price_per_carat && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-purple-700">Total Estimated Price</label>
                    <p className="text-2xl font-bold text-purple-800">
                      ${(() => {
                        const weight = diamond.weight || 0;
                        const rawPpc = diamond.price_per_carat || 0;
                        let totalPrice = 0;
                        if (rawPpc > 100 && rawPpc < 50000 && weight > 0 && weight < 20) {
                          totalPrice = Math.round(rawPpc * weight);
                        } else if (rawPpc > 0 && rawPpc < 1000000) {
                          totalPrice = Math.round(rawPpc);
                        } else {
                          totalPrice = Math.round(weight * 15000);
                        }
                        return totalPrice.toLocaleString();
                      })()}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleContactOwner}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Diamond Owner
                </Button>

                {diamond.certificate_url && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(diamond.certificate_url, '_blank')}
                  >
                    View Certificate
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Security notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-blue-700">
              🔒 This is a secure diamond view. All interactions are tracked and the owner is notified.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}