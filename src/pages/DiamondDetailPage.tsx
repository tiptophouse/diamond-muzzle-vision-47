
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useStoreData } from "@/hooks/useStoreData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Gem, Award, Eye } from "lucide-react";
import { TelegramInlineShareButton } from "@/components/store/TelegramInlineShareButton";
import { useToast } from "@/hooks/use-toast";

export default function DiamondDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { diamonds, loading } = useStoreData();
  const { webApp } = useTelegramWebApp();
  const { toast } = useToast();

  const diamond = diamonds?.find(d => d.id === id);

  // Use Telegram viewport height or fallback
  const viewportHeight = webApp?.viewportStableHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);

  useEffect(() => {
    if (webApp) {
      // Show back button in Telegram
      webApp.BackButton?.show();
      webApp.BackButton?.onClick(() => navigate(-1));
      
      return () => {
        webApp.BackButton?.hide();
      };
    }
  }, [webApp, navigate]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-background"
        style={{ height: `${viewportHeight}px` }}
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!diamond) {
    return (
      <div 
        className="flex items-center justify-center bg-background p-4"
        style={{ height: `${viewportHeight}px` }}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Diamond Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The diamond you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => navigate('/store')}>
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const title = `${diamond.carat}ct ${diamond.shape} ${diamond.color} ${diamond.clarity} Diamond`;
  const description = `Premium ${diamond.cut} cut ${diamond.shape} diamond. ${diamond.color} color, ${diamond.clarity} clarity. Stock #${diamond.stockNumber}. Price: $${diamond.price.toLocaleString()}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Helmet>

      <div 
        className="bg-background overflow-y-auto"
        style={{ height: `${viewportHeight}px` }}
      >
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Professional Telegram Share Button */}
            <TelegramInlineShareButton 
              diamond={diamond}
              variant="default"
              size="sm"
            />
          </div>
        </div>

        <div className="p-4 space-y-6 pb-20">
          {/* Image Section */}
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
            </div>
          </Card>

          {/* Title & Price */}
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {diamond.carat}ct {diamond.shape} Diamond
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-primary">
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

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {diamond.gem360Url && (
              <Button asChild variant="outline">
                <a href={diamond.gem360Url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  360° View
                </a>
              </Button>
            )}
            {diamond.certificateUrl && (
              <Button asChild variant="outline">
                <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Certificate
                </a>
              </Button>
            )}
          </div>

          {/* Share Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">
                Share This Diamond
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Send this diamond with interactive buttons via Telegram
              </p>
              <TelegramInlineShareButton 
                diamond={diamond}
                variant="default"
                size="lg"
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
