import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useSimpleTelegramAuth } from "@/hooks/useSimpleTelegramAuth";
import { useStoreData } from "@/hooks/useStoreData";
import { useDiamondShareAnalytics } from "@/hooks/useDiamondShareAnalytics";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, ExternalLink, Gem, Award, Eye, Shield, Clock, Users, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { OptimizedDiamondImage } from "@/components/store/OptimizedDiamondImage";

export default function SecureDiamondPage() {
  const { encryptedData } = useParams<{ encryptedData: string }>();
  const navigate = useNavigate();
  const { diamonds, loading } = useStoreData();
  const { webApp } = useTelegramWebApp();
  const { user, isTelegramEnvironment } = useSimpleTelegramAuth();
  const { toast } = useToast();
  const [sessionStartTime] = useState(Date.now());
  const [hasViewedOthers, setHasViewedOthers] = useState(false);
  const [stockNumber, setStockNumber] = useState<string | null>(null);

  // Decrypt the data to get stock number
  useEffect(() => {
    if (encryptedData) {
      try {
        const decryptedData = JSON.parse(atob(encryptedData));
        setStockNumber(decryptedData.stockNumber);
      } catch (error) {
        console.error('Failed to decrypt diamond data:', error);
        toast({
          title: "Invalid Link",
          description: "This diamond link is invalid or corrupted",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [encryptedData, navigate, toast]);

  // Track analytics
  const { 
    trackDiamondView, 
    trackTimeSpent, 
    trackOtherDiamondsViewed,
    getAnalytics,
    analytics 
  } = useDiamondShareAnalytics(stockNumber || '');

  const diamond = diamonds?.find(d => d.stockNumber === stockNumber);
  const isAdmin = user?.id === 2138564172;

  // Security: Only allow access from Telegram
  useEffect(() => {
    if (!loading && !isTelegramEnvironment) {
      // Redirect to a secure page or show access denied
      toast({
        title: "Access Denied",
        description: "This content is only accessible via Telegram",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [isTelegramEnvironment, loading, navigate, toast]);

  // Track initial view
  useEffect(() => {
    if (diamond && isTelegramEnvironment && user) {
      trackDiamondView({
        viewerTelegramId: user.id,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        referrer: document.referrer
      });
    }
  }, [diamond, isTelegramEnvironment, user, trackDiamondView]);

  // Track time spent when component unmounts
  useEffect(() => {
    return () => {
      if (diamond) {
        const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
        trackTimeSpent(timeSpent, hasViewedOthers);
      }
    };
  }, [diamond, sessionStartTime, hasViewedOthers, trackTimeSpent]);

  // Track if user views other diamonds - only for admin
  const handleViewOtherDiamonds = () => {
    if (isAdmin) {
      setHasViewedOthers(true);
      trackOtherDiamondsViewed();
      navigate('/store');
    } else {
      toast({
        title: "Contact Us",
        description: "Please contact us to view more diamonds from our collection"
      });
    }
  };

  const handleShare = async () => {
    // Create secure encrypted link that only shows this diamond
    const diamondData = {
      stockNumber: diamond?.stockNumber,
      timestamp: Date.now()
    };
    
    // Simple base64 encoding for the secure link
    const encryptedData = btoa(JSON.stringify(diamondData));
    const secureUrl = `https://miniapp.mazalbot.com/secure-diamond/${encryptedData}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${diamond?.carat}ct ${diamond?.shape} ${diamond?.color} ${diamond?.clarity} Diamond`,
          text: `Check out this beautiful ${diamond?.shape} diamond!`,
          url: secureUrl,
        });
        toast({ title: "Secure link shared!" });
      } catch (error) {
        navigator.clipboard.writeText(secureUrl);
        toast({ title: "Secure link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(secureUrl);
      toast({ title: "Secure link copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!diamond) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Diamond Not Found</h2>
            <p className="text-muted-foreground mb-4">The diamond you're looking for doesn't exist or is no longer available.</p>
            {isAdmin && (
              <Button onClick={() => navigate('/store')} className="mb-2">
                Back to Store
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate meta tags for this specific diamond
  const title = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond`;
  const description = `Premium ${diamond.cut} cut ${diamond.shape} diamond. ${diamond.color} color, ${diamond.clarity} clarity. Stock #${diamond.stockNumber}. Price: $${diamond.price.toLocaleString()}`;
  const imageUrl = diamond.imageUrl || `https://miniapp.mazalbot.com/api/diamond-image/${diamond.stockNumber}`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header - Only show back button for admin */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {isAdmin ? (
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => navigate('/store')}>
                <ArrowLeft className="h-4 w-4" />
                Back to Store
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Secure View
              </div>
            )}
            <Button onClick={handleShare} size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section - Large Hero Display */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative h-96 md:h-[500px]">
                  {diamond.imageUrl ? (
                    <OptimizedDiamondImage
                      imageUrl={diamond.imageUrl}
                      stockNumber={diamond.stockNumber}
                      shape={diamond.shape}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Gem className="h-32 w-32 text-slate-400 mx-auto mb-6" />
                      <p className="text-slate-500 text-xl">Diamond Image</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* 360 View / Certificate Links */}
              <div className="grid grid-cols-2 gap-4">
                {diamond.gem360Url && (
                  <Button asChild variant="outline" className="h-12">
                    <a href={diamond.gem360Url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      360° View
                    </a>
                  </Button>
                )}
                {diamond.certificateUrl && (
                  <Button asChild variant="outline" className="h-12">
                    <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Certificate
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {diamond.carat}ct {diamond.shape} Diamond
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(diamond.price)}
                  </span>
                  <Badge variant="secondary">Stock #{diamond.stockNumber}</Badge>
                </div>
              </div>

              {/* Main Specs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Diamond Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shape</label>
                    <p className="text-lg font-semibold">{diamond.shape}</p>
                  </div>
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
                  {diamond.fluorescence && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fluorescence</label>
                      <p className="text-lg font-semibold">{diamond.fluorescence}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certificate Info */}
              {(diamond.lab || diamond.certificateNumber) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certificate Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {diamond.lab && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Grading Lab</label>
                        <p className="text-lg font-semibold">{diamond.lab}</p>
                      </div>
                    )}
                    {diamond.certificateNumber && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Certificate Number</label>
                        <p className="text-lg font-semibold">{diamond.certificateNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

               {/* View More CTA */}
               <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                 <CardContent className="pt-6">
                   <h3 className="text-xl font-semibold mb-2">
                     {isAdmin ? "Explore Our Collection" : "Interested in More Diamonds?"}
                   </h3>
                   <p className="text-muted-foreground mb-4">
                     {isAdmin 
                       ? "Discover more premium diamonds in our curated collection."
                       : "Contact us to view more premium diamonds from our exclusive collection."
                     }
                   </p>
                   <Button onClick={handleViewOtherDiamonds} size="lg" className="w-full">
                     <Gem className="h-4 w-4 mr-2" />
                     {isAdmin ? "View More Diamonds" : "Contact Us"}
                   </Button>
                 </CardContent>
               </Card>

              {/* Admin Analytics */}
              {isAdmin && analytics && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Users className="h-5 w-5" />
                      Diamond Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analytics.totalViews}</div>
                        <div className="text-sm text-green-700">Total Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analytics.uniqueViewers}</div>
                        <div className="text-sm text-green-700">Unique Viewers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analytics.mobileViews}%</div>
                        <div className="text-sm text-green-700">Mobile Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analytics.avgTimeSpent}s</div>
                        <div className="text-sm text-green-700">Avg Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}