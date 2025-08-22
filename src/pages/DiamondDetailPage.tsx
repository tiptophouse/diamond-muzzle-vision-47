import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Diamond as DiamondIcon, Share2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api, apiEndpoints } from '@/lib/api';
import { Diamond } from '@/types/diamond';
import { ShareButton } from '@/components/store/ShareButton';

export default function DiamondDetailPage() {
  const { diamondId } = useParams<{ diamondId: string }>();
  const [diamond, setDiamond] = useState<Diamond | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiamond = async () => {
      if (!diamondId) {
        setError('Diamond ID is missing');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(apiEndpoints.getDiamondById(diamondId));
        if (response.error) {
          setError(response.error);
        } else {
          setDiamond(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch diamond');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiamond();
  }, [diamondId]);

  if (isLoading) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading diamond details...</p>
            </CardContent>
          </Card>
        </div>
      </TelegramLayout>
    );
  }

  if (error) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Error</CardTitle>
              <CardDescription>
                {error || 'Failed to load diamond details.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/'} className="w-full" variant="outline">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading diamond details...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Failed to load diamond details.'}
            </AlertDescription>
          </Alert>
        )}

        {diamond && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DiamondIcon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">
                      {diamond.shape} Diamond
                    </CardTitle>
                  </div>
                </div>
                <CardDescription>
                  Premium certified diamond with secure sharing
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {diamond.picture && (
                  <div className="aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={diamond.picture}
                      alt={`${diamond.shape} ${diamond.carat}ct Diamond`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

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
            
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {diamond.shape} Diamond - {diamond.carat}ct
              </h1>
              <ShareButton diamond={diamond} />
            </div>
          </div>
        )}
      </div>
    </TelegramLayout>
  );
}
