import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStoreData } from "@/hooks/useStoreData";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { TelegramShareButton } from '@/components/store/TelegramShareButton';
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

  // Simple navigation without haptic feedback to prevent loops
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoized admin check
  const isAdmin = useMemo(() => user?.id === 2138564172, [user?.id]);

  // Memoized diamond finding with correct stock number matching
  const diamond = useMemo(() => {
    if (!diamonds || !diamondId) return null;
    return diamonds.find(d => d.stockNumber === diamondId || d.id === diamondId) || null;
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm mx-auto border border-border bg-card">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary/40 rounded animate-pulse"></div>
              <div className="h-3 bg-secondary/20 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!diamond) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto border border-border bg-card">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
              <Gem className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-card-foreground">Diamond Not Found</h2>
              <p className="text-muted-foreground text-sm">The diamond you're looking for doesn't exist or is no longer available.</p>
            </div>
            <Link to="/store">
              <Button className="w-full">Back to Store</Button>
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

      <div className="min-h-screen bg-background">
        {/* Mobile-First Header */}
        <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-3 flex items-center justify-between max-w-screen-xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 min-w-0"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Back</span>
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

        <div className="px-4 py-6 max-w-screen-xl mx-auto">
          <div className="space-y-6">
            {/* Mobile-First Image Section */}
            <Card className="overflow-hidden border border-border bg-card">
              <div className="aspect-square bg-gradient-to-br from-secondary/20 to-secondary/40 relative">
                <OptimizedDiamondImage
                  imageUrl={diamond.imageUrl}
                  gem360Url={diamond.gem360Url}
                  stockNumber={diamond.stockNumber}
                  shape={diamond.shape}
                  className="w-full h-full"
                  priority={true}
                />
                
                {/* Admin Image Upload Button */}
                {isAdmin && (
                  <div className="absolute top-3 right-3">
                    <Button 
                      size="icon" 
                      variant="secondary"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="bg-card/90 hover:bg-card shadow-md"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Image Upload Interface */}
              {isAdmin && showImageUpload && (
                <div className="p-4 border-t border-border bg-secondary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">Upload Diamond Image</h4>
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
                    className="w-full p-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {isImageUploading && (
                    <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                  )}
                </div>
              )}
            </Card>

            {/* Mobile-First Title & Price Section */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {diamond.carat}ct {diamond.shape} Diamond
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatPrice(diamond.price)}
                  </span>
                  <Badge variant="secondary" className="w-fit">
                    Stock #{diamond.stockNumber}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mobile-First Specifications Grid */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Award className="h-5 w-5 text-primary" />
                  Diamond Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pt-0">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shape</label>
                  <p className="text-base font-semibold text-card-foreground">{diamond.shape}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Carat</label>
                  <p className="text-base font-semibold text-card-foreground">{diamond.carat}ct</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</label>
                  <p className="text-base font-semibold text-card-foreground">{diamond.color}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Clarity</label>
                  <p className="text-base font-semibold text-card-foreground">{diamond.clarity}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cut</label>
                  <p className="text-base font-semibold text-card-foreground">{diamond.cut}</p>
                </div>
                {diamond.lab && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lab</label>
                    <p className="text-base font-semibold text-card-foreground">{diamond.lab}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate Information */}
            {(diamond.certificateNumber || diamond.lab) && (
              <Card className="border border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Gem className="h-5 w-5 text-primary" />
                    Certificate Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {diamond.certificateNumber && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Certificate Number</label>
                      <p className="text-sm font-mono bg-secondary/20 px-3 py-2 rounded-md text-card-foreground">
                        {diamond.certificateNumber}
                      </p>
                    </div>
                  )}
                  {diamond.lab && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Certification Lab</label>
                      <p className="text-base font-semibold text-card-foreground">{diamond.lab}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={handleContact}
                  disabled={isContactLoading}
                  className="h-12 text-base font-medium"
                  size="lg"
                >
                  {isContactLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contact About This Diamond
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="h-12 text-base font-medium"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Diamond
                </Button>
              </div>

              {(diamond.certificateUrl || diamond.gem360Url) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {diamond.certificateUrl && (
                    <Button asChild variant="secondary" className="h-11">
                      <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Certificate
                      </a>
                    </Button>
                  )}
                  {diamond.gem360Url && (
                    <Button asChild variant="secondary" className="h-11">
                      <a href={diamond.gem360Url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        360° View
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(DiamondDetailPage);