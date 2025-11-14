import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStoreData } from "@/hooks/useStoreData";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramDiamondViewTracking } from "@/hooks/useTelegramDiamondViewTracking";
import { TelegramShareButton } from '@/components/store/TelegramShareButton';
import { OptimizedDiamondImage } from '@/components/store/OptimizedDiamondImage';
import { Diamond } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, ExternalLink, Camera, Award, Gem, Palette, Eye, MessageSquare, Upload, X, Sparkles, Gavel } from "lucide-react";
import { CreateAuctionModal } from '@/components/auction/CreateAuctionModal';
import { V360Viewer } from "@/components/store/V360Viewer";
import { Gem360Viewer } from "@/components/store/Gem360Viewer";
import { UniversalImageHandler } from "@/components/store/UniversalImageHandler";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function DiamondDetailPage() {
  const { stockNumber: diamondId } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { diamonds, loading, refetch } = useStoreData();
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const { autoTrackView } = useTelegramDiamondViewTracking();
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);

  // Track diamond view when opened from Telegram
  useEffect(() => {
    if (diamondId) {
      autoTrackView(diamondId);
    }
  }, [diamondId, autoTrackView]);

  // Simple navigation without haptic feedback to prevent loops
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoized admin check
  const isAdmin = useMemo(() => user?.id === 2138564172, [user?.id]);

  // Memoized diamond finding using stock number
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

  // Memoized meta data for better performance
  const metaData = useMemo(() => {
    if (!diamond) return null;
    
    const title = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond - Mazalbot`;
    const description = `Premium ${diamond.cut} cut ${diamond.shape} diamond. ${diamond.color} color, ${diamond.clarity} clarity. Stock #${diamond.stockNumber}. Price: $${diamond.price.toLocaleString()}`;
    const imageUrl = diamond.imageUrl || `https://miniapp.mazalbot.com/api/diamond-image/${diamond.stockNumber}`;
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
      // Use Web Share API if available, otherwise fallback
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`);
        toast({ title: "Diamond details copied to clipboard!" });
        return;
      }
      toast({ title: "Diamond details shared!" });
    } catch (error) {
      // Final fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`);
        toast({ title: "Diamond details copied to clipboard!" });
      } catch (clipboardError) {
        toast({ 
          title: "Share failed", 
          description: "Could not share diamond details",
          variant: "destructive" 
        });
      }
    }
  }, [diamond, formatPrice, toast]);

  const handleContact = useCallback(async () => {
    if (!isAuthenticated || !user || !diamond) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the diamond owner",
        variant: "destructive"
      });
      return;
    }

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
            imageUrl: diamond.imageUrl,
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
  }, [isAuthenticated, user, diamond, toast]);

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <TelegramShareButton
              title={metaData?.title || 'Diamond Details'}
              text={`💎 ${diamond.carat}ct ${diamond.shape} Diamond\n\n🎨 ${diamond.color} • 💎 ${diamond.clarity} • ✂️ ${diamond.cut}\n💰 ${formatPrice(diamond.price)}\n📋 Stock #${diamond.stockNumber}`}
              url={window.location.href}
              variant="ghost"
              size="sm"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Image/360° Section */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 relative">
{diamond.gem360Url ? (
                    <UniversalImageHandler
                      imageUrl={diamond.gem360Url}
                      stockNumber={diamond.stockNumber}
                      isInline={true}
                      className="w-full h-full"
                    />
                  ) : (
                    <OptimizedDiamondImage
                      imageUrl={diamond.imageUrl}
                      gem360Url={diamond.gem360Url}
                      stockNumber={diamond.stockNumber}
                      shape={diamond.shape}
                      className="w-full h-full"
                      priority={true}
                    />
                  )}
                  
                  {/* Admin Image Upload Button */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        className="bg-white/90 hover:bg-white"
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
                      <h4 className="font-medium">Upload Diamond Image</h4>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowImageUpload(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isImageUploading}
                      className="w-full p-2 border rounded-md"
                    />
                    {isImageUploading && (
                      <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Enhanced Action Buttons - Only show if no 360° viewer displayed */}
              {!diamond.gem360Url && (
                <div className="grid grid-cols-2 gap-4">
                  {diamond.certificateUrl && (
                    <Button asChild variant="outline" className="h-12">
                      <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Certificate
                      </a>
                    </Button>
                  )}
                </div>
              )}
              
              {/* Additional 360° Options - Show as secondary options */}
              {diamond.gem360Url && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">360° View Options</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={diamond.gem360Url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Direct
                      </a>
                    </Button>
                    {diamond.certificateUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Certificate
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
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
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{diamond.cut}</p>
                      <Button
                        onClick={handleShare}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
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
                      <Camera className="h-5 w-5" />
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

              {/* Contact CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">Interested in this diamond?</h3>
                  <p className="text-muted-foreground mb-4">
                    Contact us for more information, additional images, or to schedule a viewing.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <Button 
                        size="lg" 
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200" 
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
                        className="px-4 border-2 border-primary/20 bg-gradient-to-r from-background to-muted/30 hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {isAdmin && (
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full border-2 border-amber-500/50 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 hover:border-amber-500 shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => {
                          console.log('🔨 Auction button clicked');
                          setShowAuctionModal(true);
                        }}
                      >
                        <Gavel className="h-4 w-4 mr-2" />
                        צור מכרז
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Auction Modal - Moved outside nested structure */}
        <CreateAuctionModal
          open={showAuctionModal}
          onOpenChange={setShowAuctionModal}
          stockNumber={diamond.stockNumber}
          diamondName={`${diamond.carat}ct ${diamond.shape}`}
          diamond={{
            stockNumber: diamond.stockNumber,
            carat: diamond.carat,
            shape: diamond.shape,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            picture: diamond.picture,
          }}
        />
      </div>
    </>
  );
}

export default memo(DiamondDetailPage);