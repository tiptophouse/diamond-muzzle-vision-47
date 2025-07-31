
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { Diamond } from "@/components/inventory/InventoryTable";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { EnhancedStoreHeader } from "./EnhancedStoreHeader";
import { StoreGrid } from "./StoreGrid";
import { CollapsibleFilters } from "./CollapsibleFilters";
import { toast } from "sonner";

interface BeautifulStorePageProps {
  diamonds?: Diamond[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<void>;
}

export function BeautifulStorePage({ 
  diamonds: propDiamonds, 
  loading: propLoading, 
  error: propError, 
  onRefresh: propOnRefresh 
}: BeautifulStorePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectionChanged } = useTelegramHapticFeedback();
  const [sortBy, setSortBy] = useState("most-popular");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Use store data hook if props are not provided
  const { 
    diamonds: hookDiamonds, 
    loading: hookLoading, 
    error: hookError, 
    refetch 
  } = useStoreData();
  
  // Use props if available, otherwise use hook data
  const diamonds = propDiamonds || hookDiamonds || [];
  const loading = propLoading ?? hookLoading;
  const error = propError || hookError;
  const onRefresh = propOnRefresh || (async () => { await refetch(); });

  const stockNumber = searchParams.get('stock');
  
  // Show all available diamonds
  const visibleDiamonds = diamonds;
  
  console.log('🏪 BeautifulStorePage: Rendering with', visibleDiamonds.length, 'diamonds');
  console.log('🏪 BeautifulStorePage: Loading state:', loading);
  console.log('🏪 BeautifulStorePage: Error state:', error);
  
  // Handle sharing the entire store
  const handleShareStore = () => {
    selectionChanged();
    const storeUrl = `${window.location.origin}/store`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Diamond Store',
        text: 'Check out our premium diamond collection!',
        url: storeUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(storeUrl).then(() => {
        toast.success('Store link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  // Handle individual diamond sharing
  const handleShareDiamond = useCallback((diamond: Diamond) => {
    selectionChanged();
    const shareUrl = `${window.location.origin}/store?stock=${diamond.stockNumber}`;
    const shareText = `${diamond.carat}ct ${diamond.color} ${diamond.clarity} ${diamond.shape} Diamond - $${diamond.price.toLocaleString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${diamond.shape} Diamond`,
        text: shareText,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        toast.success('Diamond details copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy details');
      });
    }
  }, [selectionChanged]);

  const handleViewDetails = (diamond: Diamond, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    selectionChanged();
    navigate(`/diamond/${diamond.stockNumber}`);
  };

  const handleUpdate = () => {
    onRefresh();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleOpenFilters = () => {
    setIsFiltersOpen(true);
  };

  // Auto-scroll to diamond if found via stock parameter
  useEffect(() => {
    if (stockNumber && visibleDiamonds.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`diamond-${stockNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [stockNumber, visibleDiamonds]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <MobilePullToRefresh onRefresh={onRefresh}>
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 pt-6 pb-4">
            <EnhancedStoreHeader 
              totalDiamonds={visibleDiamonds.length}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              onOpenFilters={handleOpenFilters}
            />
          </div>
          
          {/* Main Content */}
          <div className="px-4 pb-6">
            <StoreGrid 
              diamonds={visibleDiamonds}
              loading={loading}
              error={error}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      </MobilePullToRefresh>
    </div>
  );
}
