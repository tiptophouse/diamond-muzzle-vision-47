import React, { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Diamond, Copy, Share, Eye, Sparkles } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';

interface DiamondMiniCardProps {
  diamond: {
    stock_number: string;
    shape: string;
    weight: number;
    color: string;
    clarity: string;
    cut?: string;
    price_per_carat: number;
    total_price?: number;
    status: string;
    confidence?: number;
    image_url?: string;
  };
  onViewDetails?: (diamond: any) => void;
  onContact?: (diamond: any) => void;
  compact?: boolean;
}

export function TelegramDiamondMiniCard({ 
  diamond, 
  onViewDetails, 
  onContact, 
  compact = false 
}: DiamondMiniCardProps) {
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();
  const { share } = useTelegramWebApp();
  const { toast } = useToast();

  const price = diamond.total_price || (diamond.price_per_carat * diamond.weight);
  const formattedPrice = price.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  });

  const handleViewDetails = useCallback(() => {
    impactOccurred('light');
    onViewDetails?.(diamond);
    selectionChanged();
  }, [diamond, onViewDetails, impactOccurred, selectionChanged]);

  const handleContact = useCallback(() => {
    impactOccurred('medium');
    onContact?.(diamond);
    notificationOccurred('success');
  }, [diamond, onContact, impactOccurred, notificationOccurred]);

  const handleCopy = useCallback(() => {
    const diamondText = `💎 ${diamond.shape} ${diamond.weight}ct ${diamond.color} ${diamond.clarity}\n💰 ${formattedPrice}\n📦 Stock: ${diamond.stock_number}`;
    
    navigator.clipboard.writeText(diamondText).then(() => {
      notificationOccurred('success');
      toast({
        title: "Copied!",
        description: `Diamond ${diamond.stock_number} copied to clipboard`,
      });
    });
  }, [diamond, formattedPrice, notificationOccurred, toast]);

  const handleShare = useCallback(() => {
    const shareText = `💎 Premium Diamond\n\n${diamond.shape} ${diamond.weight}ct ${diamond.color} ${diamond.clarity}\n${formattedPrice}\nStock: ${diamond.stock_number}`;
    
    if (share) {
      share(shareText);
    } else {
      navigator.share?.({
        title: 'Premium Diamond',
        text: shareText
      });
    }
    impactOccurred('medium');
  }, [diamond, formattedPrice, share, impactOccurred]);

  return (
    <Card className={`
      relative overflow-hidden bg-gradient-to-br from-background/95 to-background/80 
      border border-border/50 backdrop-blur-sm transition-all duration-200
      hover:shadow-md active:scale-[0.98] touch-manipulation
      ${compact ? 'p-3' : 'p-4'}
    `}>
      {/* Status & Confidence */}
      <div className="flex items-center justify-between mb-2">
        <Badge 
          variant={diamond.status === 'Available' ? 'default' : 'secondary'}
          className="text-xs px-2 py-1"
        >
          {diamond.status}
        </Badge>
        {diamond.confidence && (
          <Badge variant="outline" className="text-xs bg-primary/10">
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            {Math.round(diamond.confidence * 100)}%
          </Badge>
        )}
      </div>

      {/* Diamond Image Placeholder */}
      <div className="relative mb-3">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          {diamond.image_url ? (
            <img 
              src={diamond.image_url} 
              alt={`${diamond.shape} diamond`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Diamond className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        {/* Stock Number Overlay */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          #{diamond.stock_number}
        </div>
      </div>

      {/* Diamond Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{diamond.shape}</h3>
          <span className="text-sm font-medium">{diamond.weight}ct</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center bg-background/50 rounded p-1.5">
            <p className="text-muted-foreground">Color</p>
            <p className="font-medium">{diamond.color}</p>
          </div>
          <div className="text-center bg-background/50 rounded p-1.5">
            <p className="text-muted-foreground">Clarity</p>
            <p className="font-medium">{diamond.clarity}</p>
          </div>
        </div>

        {diamond.cut && (
          <div className="text-center bg-background/50 rounded p-1.5">
            <p className="text-xs text-muted-foreground">Cut</p>
            <p className="font-medium text-xs">{diamond.cut}</p>
          </div>
        )}

        {/* Price */}
        <div className="text-center bg-primary/10 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-bold text-primary">{formattedPrice}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={compact ? "flex gap-1" : "space-y-2"}>
        {compact ? (
          <>
            <Button size="sm" variant="outline" onClick={handleViewDetails} className="flex-1 h-7 text-xs">
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1 h-7 text-xs">
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare} className="flex-1 h-7 text-xs">
              <Share className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1 h-8 text-xs">
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare} className="flex-1 h-8 text-xs">
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
            
            <Button size="sm" onClick={handleViewDetails} className="w-full h-8 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            
            {onContact && (
              <Button size="sm" variant="secondary" onClick={handleContact} className="w-full h-8 text-xs">
                Contact for This Diamond
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}