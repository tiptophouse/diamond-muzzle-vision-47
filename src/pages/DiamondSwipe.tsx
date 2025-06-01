
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryData } from '@/hooks/useInventoryData';
import { Heart, X, Star, Diamond as DiamondIcon, Zap } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Diamond {
  id: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat: number;
  stock_number: string;
  cut?: string;
  fluorescence?: string;
  lab?: string;
}

export default function DiamondSwipe() {
  const { allDiamonds, loading } = useInventoryData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Diamond[]>([]);
  const [passed, setPassed] = useState<Diamond[]>([]);

  const currentDiamond = allDiamonds[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentDiamond) return;

    if (direction === 'right') {
      setMatches(prev => [...prev, currentDiamond]);
      toast({
        title: "💎 Diamond Matched!",
        description: `${currentDiamond.weight}ct ${currentDiamond.shape} added to your matches`,
      });
    } else {
      setPassed(prev => [...prev, currentDiamond]);
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleSuperLike = () => {
    if (!currentDiamond) return;
    
    setMatches(prev => [...prev, { ...currentDiamond, superLiked: true } as any]);
    toast({
      title: "⭐ Super Match!",
      description: `${currentDiamond.weight}ct ${currentDiamond.shape} super liked!`,
    });
    setCurrentIndex(prev => prev + 1);
  };

  const resetStack = () => {
    setCurrentIndex(0);
    setMatches([]);
    setPassed([]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (currentIndex >= allDiamonds.length) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-4 text-center">
          <DiamondIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No More Diamonds!</h2>
          <p className="text-muted-foreground mb-6">
            You've seen all available diamonds. Check your matches or reset to start over.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border">
              <h3 className="font-semibold text-green-800">Your Matches: {matches.length}</h3>
              <p className="text-sm text-green-600">
                Total value: ${matches.reduce((sum, d) => sum + ((d.price_per_carat || 0) * (d.weight || 0)), 0).toLocaleString()}
              </p>
            </div>
            <Button onClick={resetStack} className="w-full">
              Start Over
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentDiamond) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-4 text-center">
          <p>No diamonds available</p>
        </div>
      </Layout>
    );
  }

  const totalValue = (currentDiamond.price_per_carat || 0) * (currentDiamond.weight || 0);

  return (
    <Layout>
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">💎 Diamond Swipe</h1>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} of {allDiamonds.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">
              Matches: {matches.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Passed: {passed.length}
            </p>
          </div>
        </div>

        {/* Diamond Card */}
        <Card className="mb-6 overflow-hidden shadow-xl">
          <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <DiamondIcon className="h-24 w-24 text-blue-500" />
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/80">
                {currentDiamond.lab || 'Certified'}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {currentDiamond.weight}ct {currentDiamond.shape}
                  </h2>
                  <p className="text-lg font-semibold text-blue-600">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {currentDiamond.color} {currentDiamond.clarity}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cut:</span>
                  <p className="font-medium">{currentDiamond.cut || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price/Ct:</span>
                  <p className="font-medium">${(currentDiamond.price_per_carat || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fluorescence:</span>
                  <p className="font-medium">{currentDiamond.fluorescence || 'None'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock #:</span>
                  <p className="font-medium">{currentDiamond.stock_number}</p>
                </div>
              </div>

              {/* Investment Potential */}
              <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Investment Score</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Market Demand:</span>
                  <span className="font-medium">High</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price Trend:</span>
                  <span className="font-medium text-green-600">↗️ +12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-red-200 hover:bg-red-50"
            onClick={() => handleSwipe('left')}
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-blue-200 hover:bg-blue-50"
            onClick={handleSuperLike}
          >
            <Star className="h-8 w-8 text-blue-500" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-green-200 hover:bg-green-50"
            onClick={() => handleSwipe('right')}
          >
            <Heart className="h-8 w-8 text-green-500" />
          </Button>
        </div>

        <div className="text-center mt-4 text-sm text-muted-foreground">
          <p>← Pass • ⭐ Super Like • Like →</p>
        </div>
      </div>
    </Layout>
  );
}
