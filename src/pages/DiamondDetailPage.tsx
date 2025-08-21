
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Share2, Diamond, Eye, Heart } from 'lucide-react';
import { api, apiEndpoints } from '@/lib/api';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';

interface DiamondData {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  price_per_carat?: number;
  certificate_number?: string;
  lab?: string;
  picture?: string;
  video_url?: string;
  certificate_url?: string;
  gem360_url?: string;
  v360_url?: string;
  length?: number;
  width?: number;
  depth?: number;
  table_percentage?: number;
  depth_percentage?: number;
  gridle?: string;
  culet?: string;
  certificate_comment?: string;
}

export default function DiamondDetailPage() {
  const { stockNumber } = useParams<{ stockNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { haptics } = useEnhancedTelegramWebApp();
  const [diamond, setDiamond] = useState<DiamondData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiamond = async () => {
      if (!stockNumber) return;
      
      try {
        setLoading(true);
        
        // Get all stones and find the one with matching stock number
        const response = await api.get(apiEndpoints.getAllStones());
        const stones = response.data;
        
        const foundDiamond = stones.find((stone: any) => stone.stock_number === stockNumber);
        
        if (foundDiamond) {
          setDiamond(foundDiamond);
        } else {
          toast({
            title: "Diamond not found",
            description: "The requested diamond could not be found.",
            variant: "destructive",
          });
          navigate('/store');
        }
      } catch (error) {
        console.error('Error loading diamond:', error);
        toast({
          title: "Error",
          description: "Failed to load diamond details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDiamond();
  }, [stockNumber, toast, navigate]);

  const handleShare = async () => {
    haptics.impact('light');
    
    if (navigator.share && diamond) {
      try {
        await navigator.share({
          title: `${diamond.shape} Diamond - ${diamond.weight}ct`,
          text: `Check out this beautiful ${diamond.weight}ct ${diamond.shape} diamond!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share canceled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Diamond link copied to clipboard",
        });
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  const handleBack = () => {
    haptics.impact('light');
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Diamond className="h-12 w-12 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading diamond details...</p>
        </div>
      </div>
    );
  }

  if (!diamond) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Diamond className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Diamond not found</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="font-semibold">Diamond Details</h1>
          <Button variant="ghost" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Image */}
        {diamond.picture && (
          <Card>
            <CardContent className="p-4">
              <img
                src={diamond.picture}
                alt={`${diamond.shape} Diamond`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Diamond className="h-5 w-5" />
              {diamond.shape} Diamond
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-semibold">{diamond.weight} ct</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Color</p>
                <Badge variant="outline">{diamond.color}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Clarity</p>
                <Badge variant="outline">{diamond.clarity}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock #</p>
                <p className="font-mono text-sm">{diamond.stock_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price */}
        {diamond.price_per_carat && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Price per Carat</p>
                <p className="text-2xl font-bold text-green-600">
                  ${diamond.price_per_carat.toLocaleString()}
                </p>
                <p className="text-lg text-gray-800">
                  Total: ${(diamond.price_per_carat * diamond.weight).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diamond.cut && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cut:</span>
                <Badge variant="outline">{diamond.cut}</Badge>
              </div>
            )}
            {diamond.polish && (
              <div className="flex justify-between">
                <span className="text-gray-600">Polish:</span>
                <Badge variant="outline">{diamond.polish}</Badge>
              </div>
            )}
            {diamond.symmetry && (
              <div className="flex justify-between">
                <span className="text-gray-600">Symmetry:</span>
                <Badge variant="outline">{diamond.symmetry}</Badge>
              </div>
            )}
            {diamond.fluorescence && (
              <div className="flex justify-between">
                <span className="text-gray-600">Fluorescence:</span>
                <Badge variant="outline">{diamond.fluorescence}</Badge>
              </div>
            )}
            {diamond.lab && (
              <div className="flex justify-between">
                <span className="text-gray-600">Lab:</span>
                <Badge variant="outline">{diamond.lab}</Badge>
              </div>
            )}
            {diamond.certificate_number && (
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate:</span>
                <span className="font-mono text-sm">{diamond.certificate_number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Measurements */}
        {(diamond.length || diamond.width || diamond.depth) && (
          <Card>
            <CardHeader>
              <CardTitle>Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                {diamond.length && (
                  <div>
                    <p className="text-sm text-gray-600">Length</p>
                    <p className="font-semibold">{diamond.length} mm</p>
                  </div>
                )}
                {diamond.width && (
                  <div>
                    <p className="text-sm text-gray-600">Width</p>
                    <p className="font-semibold">{diamond.width} mm</p>
                  </div>
                )}
                {diamond.depth && (
                  <div>
                    <p className="text-sm text-gray-600">Depth</p>
                    <p className="font-semibold">{diamond.depth} mm</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
