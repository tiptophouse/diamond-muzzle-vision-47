import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStoreData } from "@/hooks/useStoreData";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { Diamond } from "@/components/inventory/InventoryTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, ExternalLink, Camera, Award, Gem, Palette, Eye, MessageSquare, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DiamondDetailPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { diamonds, loading, refetch } = useStoreData();
  const { user, isAuthenticated } = useTelegramAuth();
  const { toast } = useToast();
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Admin check
  const isAdmin = user?.id === 2138564172;

  console.log('🔍 DiamondDetailPage - stockNumber from URL:', stockNumber);
  console.log('🔍 DiamondDetailPage - available diamonds:', diamonds?.length);
  console.log('🔍 DiamondDetailPage - all stock numbers:', diamonds?.map(d => d.stockNumber));

  const diamond = diamonds?.find(d => d.stockNumber === stockNumber);

  console.log('🔍 DiamondDetailPage - found diamond:', diamond ? 'YES' : 'NO');
  console.log('🔍 DiamondDetailPage - diamond data:', diamond);
  
  // Check for potential duplicates
  const matchingDiamonds = diamonds?.filter(d => d.stockNumber === stockNumber) || [];
  if (matchingDiamonds.length > 1) {
    console.warn('🚨 DiamondDetailPage - Multiple diamonds found with same stock number:', stockNumber, matchingDiamonds);
  }

  useEffect(() => {
    if (!loading && !diamond && stockNumber) {
      console.log('❌ Diamond not found, redirecting to store');
      // Diamond not found, redirect to store
      navigate('/store');
    }
  }, [diamond, loading, stockNumber, navigate]);

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
        // Fallback to clipboard
        navigator.clipboard.writeText(secureUrl);
        toast({ title: "Secure link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(secureUrl);
      toast({ title: "Secure link copied to clipboard!" });
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated || !user) {
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
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  // Generate meta tags for this specific diamond
  const title = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond - Mazalbot`;
  const description = `Premium ${diamond.cut} cut ${diamond.shape} diamond. ${diamond.color} color, ${diamond.clarity} clarity. Stock #${diamond.stockNumber}. Price: $${diamond.price.toLocaleString()}`;
  const imageUrl = diamond.imageUrl || `https://miniapp.mazalbot.com/api/diamond-image/${diamond.stockNumber}`;
  const url = `https://miniapp.mazalbot.com/diamond/${diamond.stockNumber}`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Dynamic Meta Tags for Link Previews */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="Mazalbot Diamond Store" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        
        {/* Product Schema */}
        <meta name="keywords" content={`diamond, ${diamond.shape}, ${diamond.color}, ${diamond.clarity}, ${diamond.cut}, jewelry, precious stones`} />
        <meta property="product:price:amount" content={diamond.price.toString()} />
        <meta property="product:price:currency" content="USD" />
        <meta property="product:availability" content="in stock" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/store">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Store
              </Button>
            </Link>
            <Button onClick={handleShare} size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                  {diamond.imageUrl ? (
                    <img 
                      src={diamond.imageUrl} 
                      alt={`${diamond.shape} Diamond`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Gem className="h-24 w-24 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Diamond Image</p>
                    </div>
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
                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handleContact}
                    disabled={isContactLoading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isContactLoading ? "Sending..." : "Contact Us"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}