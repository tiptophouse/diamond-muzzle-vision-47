import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStoreData } from "@/hooks/useStoreData";
import { useTelegramHapticControl } from '@/hooks/useTelegramHapticControl';
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { TelegramShareButton } from '@/components/store/TelegramShareButton';
import { getImageUrl } from "@/utils/imageUtils";
import { OptimizedDiamondImage } from '@/components/store/OptimizedDiamondImage';
import { Diamond } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, ExternalLink, Camera, Award, Gem, Palette, Eye, MessageSquare, Upload, X, Sparkles } from "lucide-react";
import { V360Viewer } from "@/components/store/V360Viewer";
import { Gem360Viewer } from "@/components/store/Gem360Viewer";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

function DiamondDetailPage() {
  const { stockNumber: diamondId } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { diamonds, loading, refetch } = useStoreData();
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Controlled haptic feedback to prevent loops
  const { triggerHaptic } = useTelegramHapticControl({
    enableHaptic: true,
    maxHapticsPerSecond: 1,
    debounceTime: 1000
  });

  // Memoized admin check
  const isAdmin = useMemo(() => user?.id === 2138564172, [user?.id]);

  // Memoized diamond finding with stockNumber instead of id
  const diamond = useMemo(() => {
    if (!diamonds || !diamondId) return null;
    return diamonds.find(d => d.stockNumber === diamondId) || null;
  }, [diamonds, diamondId]);

  // Memoized price formatting to avoid recreation
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  }, []);

  // Memoized meta data for better performance with proper image fallback
  const metaData = useMemo(() => {
    if (!diamond) return null;
    
    const title = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond - Mazalbot`;
    const description = `Premium ${diamond.cut} cut ${diamond.shape} diamond. ${diamond.color} color, ${diamond.clarity} clarity. Stock #${diamond.stockNumber}. Price: $${diamond.price.toLocaleString()}`;
    const imageUrl = getImageUrl(diamond) || `https://miniapp.mazalbot.com/api/diamond-image/${diamond.stockNumber}`;
    const url = `https://miniapp.mazalbot.com/diamond/${diamond.stockNumber}`;
    
    return { title, description, imageUrl, url };
  }, [diamond]);

  useEffect(() => {
    if (!loading && !diamond && diamondId) {
      console.log('❌ Diamond not found, redirecting to store');
      // Diamond not found, redirect to store
      navigate('/store');
    }
  }, [diamond, loading, diamondId, navigate]);

  const handleShare = useCallback(async () => {
    if (!diamond) return;
    
    triggerHaptic('light');
    
    const shareTitle = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond`;
    const shareText = `💎 ${diamond.carat}ct ${diamond.shape} Diamond

🔸 Shape: ${diamond.shape}
⚖️ Weight: ${diamond.carat}ct
🎨 Color: ${diamond.color}
💎 Clarity: ${diamond.clarity}
✂️ Cut: ${diamond.cut}
💰 Price: ${formatPrice(diamond.price)}
📋 Stock #: ${diamond.stockNumber}
${diamond.lab ? `🏛️ Lab: ${diamond.lab}` : ''}
${diamond.certificateNumber ? `🆔 Certificate: ${diamond.certificateNumber}` : ''}

${diamond.gem360Url ? `🌐 360° View: ${diamond.gem360Url}` : ''}
${diamond.certificateUrl ? `📜 Certificate: ${diamond.certificateUrl}` : ''}`;

    const shareUrl = window.location.href;
    
    try {
      // Use native Telegram Web App sharing if available
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`);
        toast({ title: "Diamond details copied to clipboard!" });
      }
    } catch (error) {
      toast({ 
        title: "Share failed", 
        description: "Could not share diamond details",
        variant: "destructive" 
      });
    }
  }, [diamond, formatPrice, toast, triggerHaptic]);

  const handleContact = useCallback(async () => {
    if (!isAuthenticated || !user || !diamond) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the diamond owner",
        variant: "destructive"
      });
      return;
    }

    triggerHaptic('medium');
    setIsContactLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-diamond-contact', {
        body: {
          diamondData: {
            stockNumber: diamond.stockNumber,
            shape: diamond.shape,
            carat: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            lab: diamond.lab,
            certificateNumber: diamond.certificateNumber,
            imageUrl: getImageUrl(diamond),
            certificateUrl: diamond.certificateUrl
          },
          visitorInfo: {
            telegramId: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username
          },
          ownerTelegramId: 2138564172 // Default to admin as diamond owner
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "The diamond owner has been notified of your interest",
      });
    } catch (error) {
      console.error('Contact error:', error);
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly",
        variant: "destructive"
      });
    } finally {
      setIsContactLoading(false);
    }
  }, [isAuthenticated, user, diamond, toast, triggerHaptic]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !diamond) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setIsImageUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `diamond-${diamond.stockNumber}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diamond-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diamond-images')
        .getPublicUrl(fileName);

      // Update diamond record with new image URL
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ picture: publicUrl })
        .eq('stock_number', diamond.stockNumber)
        .eq('user_id', 2138564172); // Admin telegram ID

      if (updateError) throw updateError;

      toast({
        title: "Image Uploaded Successfully",
        description: "The diamond image has been updated",
      });

      // Refresh the data
      refetch();
      setShowImageUpload(false);
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImageUploading(false);
    }
  }, [diamond, toast, refetch]);

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
            <h2 className="text-xl font-semibold mb-4">Diamond Not Found</h2>
            <p className="text-muted-foreground mb-4">The diamond you're looking for doesn't exist or is no longer available.</p>
            <Link to="/store">
              <Button>Back to Store</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <>
      {/* Dynamic Meta Tags for Link Previews */}
      {metaData && (
        <Helmet>
          <title>{metaData.title}</title>
          <meta name="description" content={metaData.description} />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="product" />
          <meta property="og:title" content={metaData.title} />
          <meta property="og:description" content={metaData.description} />
          <meta property="og:image" content={metaData.imageUrl} />
          <meta property="og:url" content={metaData.url} />
          <meta property="og:site_name" content="Mazalbot Diamond Store" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaData.title} />
          <meta name="twitter:description" content={metaData.description} />
          <meta name="twitter:image" content={metaData.imageUrl} />
          
          {/* Product Schema */}
          <meta name="keywords" content={`diamond, ${diamond.shape}, ${diamond.color}, ${diamond.clarity}, ${diamond.cut}, jewelry, precious stones`} />
          <meta property="product:price:amount" content={diamond.price.toString()} />
          <meta property="product:price:currency" content="USD" />
          <meta property="product:availability" content="in stock" />
        </Helmet>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-safe">
        {/* Header - Telegram Mini App Optimized */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 safe-area-inset-top">
          <div className="px-4 py-2 flex items-center justify-between min-h-[44px]">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 touch-target min-h-[44px] px-3"
              onClick={() => {
                triggerHaptic('light');
                navigate(-1);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <TelegramShareButton
                title={metaData?.title || 'Diamond Details'}
                text={`💎 ${diamond.carat}ct ${diamond.shape} Diamond\n\n🎨 ${diamond.color} • 💎 ${diamond.clarity} • ✂️ ${diamond.cut}\n💰 ${formatPrice(diamond.price)}\n📋 Stock #${diamond.stockNumber}`}
                url={window.location.href}
                variant="ghost"
                size="sm"
                className="touch-target min-h-[44px]"
              />
            </div>
          </div>
        </div>

        <div className="px-4 py-4 max-w-lg mx-auto">
          {/* Mobile-First Layout */}
          <div className="space-y-4">
            {/* Image Section - Optimized for Mobile */}
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative">
                <OptimizedDiamondImage
                  imageUrl={getImageUrl(diamond)}
                  gem360Url={diamond.gem360Url}
                  stockNumber={diamond.stockNumber}
                  shape={diamond.shape}
                  className="w-full h-full object-cover"
                  priority={true}
                />
                
                {/* Admin Image Upload Button */}
                {isAdmin && (
                  <div className="absolute top-2 right-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="bg-white/90 hover:bg-white touch-target min-h-[44px] min-w-[44px]"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Image Upload Interface */}
              {isAdmin && showImageUpload && (
                <div className="p-4 border-t bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Upload Diamond Image</h4>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setShowImageUpload(false)}
                      className="touch-target min-h-[44px] min-w-[44px] p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isImageUploading}
                    className="w-full p-3 border rounded-md text-sm touch-target"
                  />
                  {isImageUploading && (
                    <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                  )}
                </div>
              )}
            </Card>

            {/* Title & Price - Mobile Optimized */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold leading-tight">
                {diamond.carat}ct {diamond.shape}
              </h1>
              <div className="space-y-2">
                <span className="text-3xl font-bold text-primary block">
                  {formatPrice(diamond.price)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Stock #{diamond.stockNumber}
                </Badge>
              </div>
            </div>

            {/* Main Specs - Mobile Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" />
                  Diamond Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 2x2 Grid for mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Shape</p>
                    <p className="font-semibold">{diamond.shape}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Weight</p>
                    <p className="font-semibold">{diamond.carat}ct</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Color</p>
                    <p className="font-semibold">{diamond.color}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Clarity</p>
                    <p className="font-semibold">{diamond.clarity}</p>
                  </div>
                </div>
                
                {/* Cut Grade - Full Width */}
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Cut Grade</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="font-semibold text-blue-700">{diamond.cut}</p>
                    <Button
                      onClick={handleShare}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100 touch-target"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Info - Mobile Optimized */}
            {(diamond.lab || diamond.certificateNumber) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Camera className="h-5 w-5" />
                    Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diamond.lab && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Lab</span>
                      <span className="font-semibold">{diamond.lab}</span>
                    </div>
                  )}
                  {diamond.certificateNumber && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">Certificate #</span>
                      <span className="font-semibold text-sm">{diamond.certificateNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Mobile Optimized */}
            <div className="space-y-3">
              {/* Certificate Link */}
              {diamond.certificateUrl && (
                <Button asChild variant="outline" className="w-full min-h-[48px] touch-target">
                  <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Certificate
                  </a>
                </Button>
              )}
              
              {/* 360° View */}
              {diamond.gem360Url && (
                <Button asChild variant="outline" className="w-full min-h-[48px] touch-target">
                  <a href={diamond.gem360Url} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    360° View
                  </a>
                </Button>
              )}
            </div>

            {/* Contact CTA - Mobile Optimized */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-center">Interested in this diamond?</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center leading-relaxed">
                  Contact us for more information, additional images, or to schedule a viewing.
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full min-h-[48px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 touch-target" 
                    onClick={handleContact}
                    disabled={isContactLoading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isContactLoading ? "Sending..." : "Contact Us"}
                  </Button>
                  <Button 
                    onClick={handleShare} 
                    size="lg"
                    variant="outline"
                    className="w-full min-h-[48px] border-2 border-primary/20 bg-gradient-to-r from-background to-muted/30 hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-200 touch-target"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Diamond
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safe area padding for devices with home indicator */}
        <div className="pb-safe"></div>
      </div>
    </>
  );
}

export default memo(DiamondDetailPage);