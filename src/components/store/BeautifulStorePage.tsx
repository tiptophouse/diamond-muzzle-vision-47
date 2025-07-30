
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { Diamond } from "@/components/inventory/InventoryTable";
import { MobilePullToRefresh } from "@/components/mobile/MobilePullToRefresh";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Filter, SortAsc, Search, Plus, Eye, Heart, Zap, Sparkles, ArrowRight } from "lucide-react";
import { toast } from 'sonner';
import { Gem360Viewer } from "./Gem360Viewer";
import { ThreeDViewer } from "./ThreeDViewer";
import { MobileShareButton } from "./MobileShareButton";
import { WishlistButton } from "./WishlistButton";
import { motion, AnimatePresence } from "framer-motion";

interface BeautifulStorePageProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onRefresh: () => Promise<void>;
}

export function BeautifulStorePage({ diamonds, loading, error, onRefresh }: BeautifulStorePageProps) {
  const [searchParams] = useSearchParams();
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const stockNumber = searchParams.get('stock');
  
  // Filter diamonds for sharing - show only visible ones
  const visibleDiamonds = diamonds.filter(diamond => diamond.store_visible !== false);
  
  // Handle sharing the entire store
  const handleShareStore = () => {
    selectionChanged();
    const storeUrl = `${window.location.origin}/store`;
    const shareText = `💎 Premium Diamond Collection\n\n${visibleDiamonds.length} exquisite diamonds available.\n\nView our collection: ${storeUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Premium Diamond Collection',
        text: shareText,
        url: storeUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Store link copied to clipboard!');
    }
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      impactOccurred('light');
      await onRefresh();
      toast.success('Store refreshed!');
    } catch (error) {
      toast.error('Failed to refresh store');
      throw error;
    }
  }, [onRefresh, impactOccurred]);

  const handleDiamondClick = (diamond: Diamond) => {
    selectionChanged();
    navigate(`/diamond/${diamond.stockNumber}`);
  };

  const handleViewDetails = (diamond: Diamond, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent the card click event
    }
    selectionChanged();
    navigate(`/diamond/${diamond.stockNumber}`);
  };

  if (loading) {
    return <StorePageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Store Unavailable</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Beautiful Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="px-4 py-4">
            {/* Store Title */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Diamond Boutique
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {visibleDiamonds.length} Premium Diamonds Available
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <SortAsc className="h-4 w-4 mr-1" />
                  Sort
                </Button>
              </div>
              
              <Button 
                onClick={handleShareStore}
                size="sm" 
                className="h-9 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Store
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Diamond (if viewing specific diamond) */}
        {stockNumber && (
          <FeaturedDiamondSection 
            diamond={visibleDiamonds.find(d => d.stockNumber === stockNumber)}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Diamond Grid */}
        <div className="px-4 py-6">
          {visibleDiamonds.length === 0 ? (
            <EmptyStoreState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {visibleDiamonds.map((diamond, index) => (
                  <DiamondCard 
                    key={diamond.id}
                    diamond={diamond}
                    index={index}
                    onClick={() => handleDiamondClick(diamond)}
                    onViewDetails={(e) => handleViewDetails(diamond, e)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Store Footer */}
        <div className="px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Diamond Collection</h3>
            <p className="text-slate-600 text-sm">
              Handpicked diamonds with certificates and detailed specifications
            </p>
          </div>
        </div>
      </div>
    </MobilePullToRefresh>
  );
}

// Featured Diamond Section Component
function FeaturedDiamondSection({ diamond, onViewDetails }: { 
  diamond?: Diamond; 
  onViewDetails: (diamond: Diamond, e?: React.MouseEvent) => void;
}) {
  if (!diamond) return null;

  return (
    <div className="px-4 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
      <Card className="overflow-hidden shadow-2xl border-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Side */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-900 to-slate-700">
            {diamond.imageUrl ? (
              <ThreeDViewer 
                imageUrl={diamond.imageUrl}
                stockNumber={diamond.stockNumber}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Details Side */}
          <CardContent className="p-6 bg-white">
            <Badge className="mb-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              Featured Diamond
            </Badge>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {diamond.carat} ct {diamond.shape}
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-slate-500">Color</div>
                <Badge variant="outline" className="mt-1">{diamond.color}</Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500">Clarity</div>
                <Badge variant="outline" className="mt-1">{diamond.clarity}</Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-500">Cut</div>
                <Badge variant="outline" className="mt-1">{diamond.cut}</Badge>
              </div>
            </div>

            <div className="text-3xl font-bold text-slate-900 mb-4">
              ${diamond.price.toLocaleString()}
            </div>

            <div className="flex gap-2">
              <MobileShareButton diamond={diamond} className="flex-1" />
              <WishlistButton diamond={diamond} />
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                onClick={(e) => onViewDetails(diamond, e)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

// Individual Diamond Card Component
function DiamondCard({ diamond, index, onClick, onViewDetails }: { 
  diamond: Diamond; 
  index: number; 
  onClick: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200/50 hover:border-blue-300/50 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {diamond.imageUrl ? (
            <ThreeDViewer 
              imageUrl={diamond.imageUrl}
              stockNumber={diamond.stockNumber}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600 text-white shadow-lg">
              Available
            </Badge>
          </div>

          {/* Stock Number */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs">
              #{diamond.stockNumber}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
            {diamond.carat} ct {diamond.shape}
          </h3>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-xs text-slate-500">Color</div>
              <Badge variant="outline" className="mt-1 text-xs">{diamond.color}</Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Clarity</div>
              <Badge variant="outline" className="mt-1 text-xs">{diamond.clarity}</Badge>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">Cut</div>
              <Badge variant="outline" className="mt-1 text-xs">{diamond.cut}</Badge>
            </div>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-slate-900 mb-3">
            ${diamond.price.toLocaleString()}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <MobileShareButton diamond={diamond} className="flex-1" />
            <WishlistButton diamond={diamond} />
            <Button 
              size="sm" 
              variant="outline"
              onClick={onViewDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading Skeleton Component
function StorePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <div className="px-4 py-6">
        <div className="h-8 bg-slate-200 rounded-lg mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded mb-4 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-slate-200 rounded animate-pulse ml-auto"></div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-slate-200 animate-pulse"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-9 bg-slate-200 rounded animate-pulse flex-1"></div>
                <div className="h-9 w-9 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-9 w-9 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyStoreState() {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-12 h-12 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Diamonds Available</h3>
        <p className="text-slate-600 mb-6">
          Our collection is being updated. Check back soon for new arrivals.
        </p>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Diamonds
        </Button>
      </CardContent>
    </Card>
  );
}
