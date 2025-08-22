import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { StoreGrid } from '@/components/store/StoreGrid';
import { TelegramStoreFilters } from '@/components/store/TelegramStoreFilters';
import { FloatingShareButton } from '@/components/store/FloatingShareButton';
import { OptimizedDiamondCard } from '@/components/store/OptimizedDiamondCard';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useStoreData } from '@/hooks/useStoreData';
import { useStoreFilters } from '@/hooks/useStoreFilters';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Diamond } from '@/types/diamond';
import { Heart, Share2, Eye, Filter, SlidersHorizontal, X } from 'lucide-react';

interface CatalogPageProps {}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useTelegramAuth();
  const { webApp } = useTelegramWebApp();
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    diamonds,
    loading,
    error,
    refetch
  } = useStoreData();

  const {
    filters,
    updateFilter,
    filteredDiamonds
  } = useStoreFilters(diamonds);

  useEffect(() => {
    if (webApp) {
      webApp.BackButton.hide();
      webApp.MainButton.hide();
    }
  }, [webApp]);

  const handleShare = (diamond: Diamond) => {
    if (webApp) {
      webApp.MainButton.text = `Share ${diamond.shape} ${diamond.carat}ct`;
      webApp.MainButton.show();
      webApp.MainButton.onClick(() => {
        webApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this ${diamond.shape} ${diamond.carat}ct diamond!`)}`);
      });
    } else {
      toast({
        title: "Share",
        description: "Share this diamond with your friends!",
      });
    }
  };

  const handleAddToWishlist = (diamond: Diamond) => {
    toast({
      title: "Wishlist",
      description: "Added to wishlist!",
    });
  };

  const handleOpenFilters = () => {
    setIsFilterOpen(true);
  };

  const handleCloseFilters = () => {
    setIsFilterOpen(false);
  };

  return (
    <TelegramLayout>
      <EnhancedStoreHeader
        totalDiamonds={diamonds.length}
        onOpenFilters={handleOpenFilters}
      />

      <TelegramStoreFilters
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onUpdateFilter={updateFilter}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {filteredDiamonds.map((diamond) => (
          <OptimizedDiamondCard
            key={diamond.id}
            diamond={diamond}
            onUpdate={refetch}
          />
        ))}
      </div>
    </TelegramLayout>
  );
}
