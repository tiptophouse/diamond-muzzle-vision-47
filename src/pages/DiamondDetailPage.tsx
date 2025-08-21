import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, Heart, Phone, MessageCircle, Star, Eye } from 'lucide-react';
import { useStoreData } from '@/hooks/useStoreData';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useWishlist } from '@/hooks/useWishlist';
import { ShareButton } from '@/components/store/ShareButton';
import { useSharedDiamondAccess } from '@/hooks/useSharedDiamondAccess';
import { toast } from 'sonner';

const DiamondDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { diamonds, loading } = useStoreData();
  const { webApp, user } = useTelegramWebApp();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { validateAndTrackAccess, sendAccessNotification } = useSharedDiamondAccess();
  const [hasValidatedAccess, setHasValidatedAccess] = useState(false);

  // Find the diamond, ensuring diamonds is an array
  const diamond = Array.isArray(diamonds) ? diamonds.find(d => d.id === id || d.stockNumber === id) : null;
  const isWishlisted = diamond ? isInWishlist(diamond.id) : false;

  useEffect(() => {
    const validateAccess = async () => {
      if (!id || hasValidatedAccess) return;
      
      const isValid = await validateAndTrackAccess(id);
      if (!isValid) {
        navigate('/', { replace: true });
        return;
      }
      
      setHasValidatedAccess(true);
      
      // Send notification if this is a shared access
      if (diamond && user) {
        await sendAccessNotification(diamond.stockNumber || diamond.id, user.id);
      }
    };

    validateAccess();
  }, [id, diamond, user, validateAndTrackAccess, sendAccessNotification, navigate, hasValidatedAccess]);

  const handleBack = () => {
    if (webApp?.BackButton) {
      webApp.BackButton.hide();
    }
    navigate(-1);
  };

  const handleContact = () => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred('medium');
    }
    
    const message = `היי, אני מעוניין ביהלום הזה:\n\n💎 ${diamond?.shape} ${diamond?.carat} קרט\n🎨 צבע: ${diamond?.color}\n💎 ניקיון: ${diamond?.clarity}\n✂️ ליטוש: ${diamond?.cut}\n📋 מלאי: ${diamond?.stockNumber}\n\nתודה!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    if (webApp?.openLink) {
      webApp.openLink(whatsappUrl);
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleWishlistToggle = () => {
    if (!diamond) return;
    
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred('light');
    }

    if (isWishlisted) {
      removeFromWishlist(diamond.id);
      toast.success('הוסר מרשימת המשאלות');
    } else {
      addToWishlist(diamond);
      toast.success('נוסף לרשימת המשאלות');
    }
  };

  useEffect(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleBack);
      
      return () => {
        if (webApp.BackButton) {
          webApp.BackButton.hide();
        }
      };
    }
  }, [webApp, handleBack]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600" dir="rtl">טוען פרטי יהלום...</p>
        </div>
      </div>
    );
  }

  if (!diamond) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-2xl font-bold mb-2" dir="rtl">יהלום לא נמצא</h2>
            <p className="text-gray-600 mb-4" dir="rtl">היהלום שחיפשת לא קיים במערכת</p>
            <Button onClick={handleBack} className="w-full">
              <ArrowLeft className="ml-2 h-4 w-4" />
              חזור לחנות
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          חזור לחנות
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-2xl font-bold text-gray-900" dir="rtl">
              <div className="flex items-center gap-2">
                💎 {diamond.shape} Diamond
                {diamond.clarity && diamond.color && diamond.cut && (
                  <Badge variant="secondary" className="text-xs">
                    {diamond.clarity} | {diamond.color} | {diamond.cut}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <div className="space-x-2 flex items-center">
              <ShareButton diamond={diamond} />
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                className={`transition-colors ${isWishlisted ? 'text-red-600 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {isWishlisted ? <Heart className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              {diamond.imageUrl ? (
                <img src={diamond.imageUrl} alt="Diamond" className="rounded-lg max-h-96 w-full object-contain" />
              ) : (
                <div className="text-gray-500 text-center">No Image Available</div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800" dir="rtl">פרטי היהלום:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p className="text-gray-600" dir="rtl">
                    <Star className="inline-block h-4 w-4 mr-1" />
                    קט: <span className="font-medium">{diamond.carat} קרט</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    <Eye className="inline-block h-4 w-4 mr-1" />
                    צורה: <span className="font-medium">{diamond.shape}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    🎨 צבע: <span className="font-medium">{diamond.color}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    💎 ניקיון: <span className="font-medium">{diamond.clarity}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    ✂️ ליטוש: <span className="font-medium">{diamond.cut}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    📏 עומק: <span className="font-medium">{diamond.depth}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    ✨ ברק: <span className="font-medium">{diamond.polish}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    🧿 סימטריה: <span className="font-medium">{diamond.symmetry}</span>
                  </p>
                  <p className="text-gray-600" dir="rtl">
                    📋 מלאי: <span className="font-medium">{diamond.stockNumber}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800" dir="rtl">מחיר:</h3>
                <p className="text-green-600 text-xl font-bold" dir="rtl">
                  ${diamond.price ? diamond.price.toLocaleString() : 'צור קשר לפרטים'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button className="w-full" onClick={handleContact}>
                  <Phone className="mr-2 h-4 w-4" />
                  צור קשר
                </Button>
                {diamond.gem360Url && (
                  <Button variant="secondary" className="w-full" asChild>
                    <a href={diamond.gem360Url} target="_blank" rel="noopener noreferrer">
                      <Share2 className="mr-2 h-4 w-4" />
                      צפה ב-360
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiamondDetailPage;
