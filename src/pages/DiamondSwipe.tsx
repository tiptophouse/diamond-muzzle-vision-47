
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Star, Eye, Diamond as DiamondIcon } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { Diamond } from '@/components/inventory/InventoryTable';

const DiamondSwipe = () => {
  const { allDiamonds, loading } = useInventoryData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedDiamonds, setLikedDiamonds] = useState<Diamond[]>([]);
  const [passedDiamonds, setPassedDiamonds] = useState<Diamond[]>([]);

  const currentDiamond = allDiamonds[currentIndex];

  const handleLike = () => {
    if (currentDiamond) {
      setLikedDiamonds(prev => [...prev, currentDiamond]);
      nextDiamond();
    }
  };

  const handlePass = () => {
    if (currentDiamond) {
      setPassedDiamonds(prev => [...prev, currentDiamond]);
      nextDiamond();
    }
  };

  const nextDiamond = () => {
    if (currentIndex < allDiamonds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setLikedDiamonds([]);
    setPassedDiamonds([]);
  };

  const getQualityScore = (diamond: Diamond) => {
    // Simple quality scoring based on clarity and color
    const clarityScore = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'].indexOf(diamond.clarity || '') + 1;
    const colorScore = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].indexOf(diamond.color || '') + 1;
    return Math.max(1, 11 - Math.floor((clarityScore + colorScore) / 2));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <DiamondIcon className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-lg">Loading diamonds...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (allDiamonds.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <DiamondIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">No Diamonds Available</h2>
            <p className="mt-2 text-gray-600">Add some diamonds to your inventory to start swiping!</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (currentIndex >= allDiamonds.length) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md mx-auto p-6">
            <Heart className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold">You've seen all diamonds!</h2>
            <p className="mt-2 text-gray-600">
              You liked {likedDiamonds.length} diamonds out of {allDiamonds.length}
            </p>
            <Button onClick={reset} className="mt-4">
              Start Over
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto p-4 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Diamond Swipe</h1>
          <p className="text-sm text-gray-600">
            {currentIndex + 1} of {allDiamonds.length} diamonds
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / allDiamonds.length) * 100}%` }}
          />
        </div>

        {/* Diamond Card */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <Card className="w-full max-w-sm mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              {/* Diamond Icon */}
              <div className="text-center mb-4">
                <div className="relative">
                  <DiamondIcon className="mx-auto h-20 w-20 text-blue-500" />
                  <div className="absolute -top-2 -right-2">
                    {[...Array(getQualityScore(currentDiamond))].map((_, i) => (
                      <Star key={i} className="inline h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Diamond Details */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentDiamond.carat}ct {currentDiamond.shape}
                  </h3>
                  <p className="text-lg text-blue-600 font-semibold">
                    ${((currentDiamond.pricePerCarat || 0) * (currentDiamond.carat || 0)).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <Badge variant="outline">{currentDiamond.color}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clarity:</span>
                    <Badge variant="outline">{currentDiamond.clarity}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cut:</span>
                    <Badge variant="outline">{currentDiamond.cut || 'N/A'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lab:</span>
                    <Badge variant="outline">{currentDiamond.certificateNumber || 'N/A'}</Badge>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{currentDiamond.carat} carats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price/Carat:</span>
                    <span className="font-medium">${(currentDiamond.pricePerCarat || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Polish:</span>
                    <span className="font-medium">{currentDiamond.polish || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fluorescence:</span>
                    <span className="font-medium">{currentDiamond.fluorescence || 'None'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock #:</span>
                    <span className="font-medium">{currentDiamond.stockNumber}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-8">
          <Button
            onClick={handlePass}
            variant="outline"
            size="lg"
            className="rounded-full h-16 w-16 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            <X className="h-8 w-8" />
          </Button>
          
          <Button
            onClick={handleLike}
            variant="outline"
            size="lg"
            className="rounded-full h-16 w-16 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400"
          >
            <Heart className="h-8 w-8" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4 text-green-500" />
            <span>{likedDiamonds.length} liked</span>
          </div>
          <div className="flex items-center space-x-1">
            <X className="h-4 w-4 text-red-500" />
            <span>{passedDiamonds.length} passed</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiamondSwipe;
