
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedDiamondAccess } from '@/hooks/useSharedDiamondAccess';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Diamond } from '@/types/diamond';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Diamond as DiamondIcon, Share2, Eye, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShareButton } from '@/components/store/ShareButton';

export default function SecureDiamondPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const webApp = useTelegramWebApp();
  const [diamond, setDiamond] = useState<Diamond | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);

  const { 
    validateAccess, 
    trackView, 
    isValidating 
  } = useSharedDiamondAccess();

  useEffect(() => {
    if (shareId) {
      handleValidateAccess();
    }
  }, [shareId]);

  const handleValidateAccess = async () => {
    if (!shareId) return;

    try {
      setIsLoading(true);
      const result = await validateAccess(shareId);
      
      if (result.success && result.diamond) {
        setDiamond(result.diamond);
        setAccessGranted(true);
        
        // Track the view
        await trackView(shareId);
        
        // Configure Telegram WebApp
        if (webApp) {
          webApp.expand();
          webApp.ready();
        }
      } else {
        setError(result.error || 'Access denied');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate access');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Validating access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !accessGranted || !diamond) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Access Restricted</CardTitle>
            <CardDescription>
              {error || 'You do not have permission to view this diamond.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Security Notice */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Eye className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            This is a secure, private diamond listing. Access is tracked and logged.
          </AlertDescription>
        </Alert>

        {/* Main Diamond Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DiamondIcon className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">
                  {diamond.shape} Diamond
                </CardTitle>
              </div>
              <ShareButton diamond={diamond} />
            </div>
            <CardDescription>
              Premium certified diamond with secure sharing
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Image Section */}
            {diamond.picture && (
              <div className="aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={diamond.picture}
                  alt={`${diamond.shape} ${diamond.carat}ct Diamond`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Key Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{diamond.carat}</div>
                <div className="text-sm text-muted-foreground">Carat</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{diamond.color}</div>
                <div className="text-sm text-muted-foreground">Color</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{diamond.clarity}</div>
                <div className="text-sm text-muted-foreground">Clarity</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{diamond.cut || 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Cut</div>
              </div>
            </div>

            {/* Price */}
            {diamond.price && (
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-primary mb-2">
                  ${diamond.price.toLocaleString()}
                </div>
                <div className="text-muted-foreground">
                  ${Math.round(diamond.price / diamond.carat).toLocaleString()} per carat
                </div>
              </div>
            )}

            <Separator />

            {/* Detailed Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detailed Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {diamond.polish && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Polish:</span>
                      <span className="font-medium">{diamond.polish}</span>
                    </div>
                  )}
                  {diamond.symmetry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Symmetry:</span>
                      <span className="font-medium">{diamond.symmetry}</span>
                    </div>
                  )}
                  {diamond.fluorescence && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fluorescence:</span>
                      <span className="font-medium">{diamond.fluorescence}</span>
                    </div>
                  )}
                  {diamond.depth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depth:</span>
                      <span className="font-medium">{diamond.depth}%</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {diamond.table && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Table:</span>
                      <span className="font-medium">{diamond.table}%</span>
                    </div>
                  )}
                  {diamond.measurements && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Measurements:</span>
                      <span className="font-medium">{diamond.measurements}</span>
                    </div>
                  )}
                  {diamond.lab && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lab:</span>
                      <span className="font-medium">{diamond.lab}</span>
                    </div>
                  )}
                  {diamond.stockNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock #:</span>
                      <span className="font-medium">{diamond.stockNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Certificate Information */}
            {diamond.certificateUrl && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Certificate</h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Certificate Number</div>
                      <div className="text-sm text-muted-foreground">{diamond.certificateUrl}</div>
                    </div>
                    <Badge variant="outline">Certified</Badge>
                  </div>
                </div>
              </>
            )}

            {/* Additional Information */}
            {diamond.comment && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <p className="text-muted-foreground">{diamond.comment}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Interested in this diamond?</span>
            </CardTitle>
            <CardDescription>
              Contact us for more information, additional images, or to schedule a viewing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="w-full" size="lg">
                Request More Info
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Schedule Viewing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
