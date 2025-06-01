
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Diamond } from 'lucide-react';
import { Diamond as DiamondType } from '@/components/inventory/InventoryTable';

interface DiamondViewerProps {
  diamonds: DiamondType[];
  loading?: boolean;
}

export function DiamondViewer({ diamonds, loading }: DiamondViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentDiamond = diamonds[currentIndex];

  const nextDiamond = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % diamonds.length);
      setIsAnimating(false);
    }, 150);
  };

  const prevDiamond = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + diamonds.length) % diamonds.length);
      setIsAnimating(false);
    }, 150);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevDiamond();
      if (e.key === 'ArrowRight') nextDiamond();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating]);

  if (loading) {
    return (
      <Card className="glass-card h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="diamond-viewer">
            <div className="diamond-shine"></div>
            <Diamond className="h-24 w-24 text-diamond-600 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentDiamond) {
    return (
      <Card className="glass-card h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Diamond className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No diamonds in inventory</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-96 overflow-hidden">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevDiamond}
            className="absolute left-2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background"
            disabled={diamonds.length <= 1}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className={`diamond-viewer transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
            <div className="diamond-shine"></div>
            <div className="relative z-10 text-center">
              <Diamond className="h-24 w-24 text-white mx-auto mb-4 drop-shadow-lg" />
              <div className="text-white drop-shadow-lg">
                <h3 className="text-2xl font-bold mb-1">{currentDiamond.carat}ct</h3>
                <p className="text-lg">{currentDiamond.shape}</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextDiamond}
            className="absolute right-2 z-10 h-12 w-12 rounded-full bg-background/80 hover:bg-background"
            disabled={diamonds.length <= 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Color</span>
              <Badge variant="secondary">{currentDiamond.color}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Clarity</span>
              <Badge variant="secondary">{currentDiamond.clarity}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cut</span>
              <Badge variant="secondary">{currentDiamond.cut}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-semibold text-diamond-600">${currentDiamond.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={currentDiamond.status === 'Available' ? 'default' : 'destructive'}>
                {currentDiamond.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Stock</span>
              <span className="text-sm">{currentDiamond.stockNumber}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {diamonds.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-diamond-600' : 'bg-muted'
                }`}
              />
            ))}
            {diamonds.length > 5 && (
              <span className="text-xs text-muted-foreground ml-2">
                {currentIndex + 1} of {diamonds.length}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
