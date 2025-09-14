import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramTheme } from '@/hooks/useTelegramTheme';
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';
import { useStoreData } from '@/hooks/useStoreData';
import { useStoreFilters } from '@/hooks/useStoreFilters';
import { TelegramStoreHeader } from '@/components/store/TelegramStoreHeader';
import { TelegramVirtualGrid } from '@/components/store/TelegramVirtualGrid';
import { TelegramDetailsSheet } from '@/components/store/TelegramDetailsSheet';
import { TelegramStoreFilters } from '@/components/store/TelegramStoreFilters';
import { TelegramSortSheet } from '@/components/store/TelegramSortSheet';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Filter, SortAsc } from 'lucide-react';
import { toast } from 'sonner';

type MediaSegment = '3d' | 'photos' | 'info';

export default function TelegramStore() {
  const { webApp, isReady, mainButton, backButton, hapticFeedback } = useTelegramWebApp();
  const { isReady: themeReady } = useTelegramTheme();
  const { savePreferences, loadPreferences, preferences } = useTelegramCloudStorage();
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  
  const [searchParams] = useSearchParams();
  const [currentSegment, setCurrentSegment] = useState<MediaSegment>('3d');
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('media-priority');

  // Initialize Telegram WebApp
  useEffect(() => {
    if (!isReady || !webApp) return;

    // Call ready and expand
    webApp.ready();
    webApp.expand();

    // Set safe area CSS variables
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

  }, [isReady, webApp]);

  // Load saved filters from cloud storage
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        await loadPreferences();
        // Default segment and sort are already set in state
      } catch (error) {
        console.log('Failed to load saved filters');
      }
    };

    if (isReady) {
      loadSavedFilters();
    }
  }, [isReady, loadPreferences]);

  // Save filters to cloud storage
  const saveFiltersToCloud = useCallback(async (segment: MediaSegment, sort: string) => {
    try {
      await savePreferences({
        viewPreferences: {
          ...preferences.viewPreferences,
          sortBy: sort as any
        }
      });
    } catch (error) {
      console.log('Failed to save filters');
    }
  }, [savePreferences, preferences]);

  // Media priority detection
  const getMediaPriority = useCallback((diamond: Diamond) => {
    if (diamond.gem360Url && diamond.gem360Url.trim()) return 0; // 3D
    if (diamond.imageUrl && diamond.imageUrl !== 'default' && diamond.imageUrl.trim()) return 1; // Photos
    return 2; // Info only
  }, []);

  // Filter diamonds by media segment
  const segmentFilteredDiamonds = useMemo(() => {
    let filtered = [...filteredDiamonds];

    switch (currentSegment) {
      case '3d':
        filtered = filtered.filter(d => getMediaPriority(d) === 0);
        break;
      case 'photos':
        filtered = filtered.filter(d => getMediaPriority(d) === 1);
        break;
      case 'info':
        filtered = filtered.filter(d => getMediaPriority(d) === 2);
        break;
    }

    // Sort diamonds
    filtered.sort((a, b) => {
      const priorityA = getMediaPriority(a);
      const priorityB = getMediaPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      switch (sortBy) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'carat-low-high':
          return a.carat - b.carat;
        case 'carat-high-low':
          return b.carat - a.carat;
        case 'newest':
          return a.stockNumber.localeCompare(b.stockNumber);
        default:
          return a.stockNumber.localeCompare(b.stockNumber);
      }
    });

    return filtered;
  }, [filteredDiamonds, currentSegment, sortBy, getMediaPriority]);

  // Calculate media counts
  const mediaCounts = useMemo(() => {
    const with3D = filteredDiamonds.filter(d => getMediaPriority(d) === 0).length;
    const withImages = filteredDiamonds.filter(d => getMediaPriority(d) === 1).length;
    const infoOnly = filteredDiamonds.filter(d => getMediaPriority(d) === 2).length;
    return {
      total: filteredDiamonds.length,
      with3D,
      withImages,
      infoOnly
    };
  }, [filteredDiamonds, getMediaPriority]);

  // Active filters count
  const activeFiltersCount = useMemo(() => 
    filters.shapes.length + 
    filters.colors.length + 
    filters.clarities.length + 
    filters.cuts.length + 
    filters.fluorescence.length,
    [filters]
  );

  // Handle segment change
  const handleSegmentChange = useCallback((segment: MediaSegment) => {
    setCurrentSegment(segment);
    saveFiltersToCloud(segment, sortBy);
  }, [sortBy, saveFiltersToCloud]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort);
    saveFiltersToCloud(currentSegment, newSort);
    setShowSort(false);
    hapticFeedback.selection();
  }, [currentSegment, saveFiltersToCloud, hapticFeedback]);

  // Handle diamond selection for MainButton
  useEffect(() => {
    if (!isReady || !selectedDiamond) return;

    mainButton.show('Contact Seller', () => {
      handleContact(selectedDiamond);
    }, 'var(--tg-btn)');

    return () => {
      mainButton.hide();
    };
  }, [isReady, selectedDiamond, mainButton]);

  // Handle BackButton for details sheet
  useEffect(() => {
    if (!isReady) return;

    if (selectedDiamond) {
      backButton.show(() => {
        setSelectedDiamond(null);
        hapticFeedback.impact('light');
      });
    } else {
      backButton.hide();
    }

    return () => {
      backButton.hide();
    };
  }, [isReady, selectedDiamond, backButton, hapticFeedback]);

  // Event handlers
  const handleViewDetails = useCallback((diamond: Diamond) => {
    setSelectedDiamond(diamond);
    hapticFeedback.impact('light');
  }, [hapticFeedback]);

  const handleContact = useCallback((diamond: Diamond) => {
    hapticFeedback.impact('medium');
    
    if (webApp) {
      const sellerUsername = 'diamondmazalbot'; // Replace with actual seller username
      const deepLink = `https://t.me/${sellerUsername}?start=diamond_${diamond.stockNumber}`;
      webApp.openTelegramLink(deepLink);
    }
    
    setSelectedDiamond(null);
  }, [webApp, hapticFeedback]);

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      toast.success('Catalog refreshed!');
      hapticFeedback.notification('success');
    } catch (error) {
      toast.error('Failed to refresh');
      hapticFeedback.notification('error');
      throw error;
    }
  }, [refetch, hapticFeedback]);

  const handleApplyFilters = useCallback(() => {
    setShowFilters(false);
    hapticFeedback.selection();
  }, [hapticFeedback]);

  // Auto-scroll to diamond from URL
  useEffect(() => {
    const stockNumber = searchParams.get('stock');
    if (stockNumber && segmentFilteredDiamonds.length > 0) {
      const diamond = segmentFilteredDiamonds.find(d => d.stockNumber === stockNumber);
      if (diamond) {
        setTimeout(() => {
          handleViewDetails(diamond);
        }, 500);
      }
    }
  }, [searchParams, segmentFilteredDiamonds, handleViewDetails]);

  if (!themeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Telegram theme...</p>
        </div>
      </div>
    );
  }

  return (
    <MobilePullToRefresh onRefresh={handleRefresh} enabled={!loading}>
      <div 
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: 'var(--tg-bg)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Header */}
        <TelegramStoreHeader
          mediaCounts={mediaCounts}
          activeFiltersCount={activeFiltersCount}
          currentSegment={currentSegment}
          onSegmentChange={handleSegmentChange}
          onOpenFilters={() => setShowFilters(true)}
          onOpenSort={() => setShowSort(true)}
        />

        {/* Virtual Grid */}
        <TelegramVirtualGrid
          diamonds={segmentFilteredDiamonds}
          onViewDetails={handleViewDetails}
          onContact={handleContact}
          loading={loading}
        />

        {/* Details Sheet */}
        <TelegramDetailsSheet
          diamond={selectedDiamond}
          isOpen={!!selectedDiamond}
          onClose={() => setSelectedDiamond(null)}
          onContact={handleContact}
        />

        {/* Filters Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent 
            side="bottom" 
            className="h-[80vh] p-0"
            style={{ backgroundColor: 'var(--tg-bg)' }}
          >
            <SheetHeader className="px-4 py-3 border-b border-[var(--tg-hint)]/20">
              <SheetTitle className="flex items-center gap-2 text-sm" style={{ color: 'var(--tg-text)' }}>
                <Filter className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <TelegramStoreFilters
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              onApplyFilters={handleApplyFilters}
              diamonds={diamonds || []}
            />
          </SheetContent>
        </Sheet>

        {/* Sort Sheet */}
        <Sheet open={showSort} onOpenChange={setShowSort}>
          <SheetContent 
            side="bottom" 
            className="h-auto p-0"
            style={{ backgroundColor: 'var(--tg-bg)' }}
          >
            <SheetHeader className="px-4 py-3 border-b border-[var(--tg-hint)]/20">
              <SheetTitle className="flex items-center gap-2 text-sm" style={{ color: 'var(--tg-text)' }}>
                <SortAsc className="h-4 w-4" />
                Sort by
              </SheetTitle>
            </SheetHeader>
            <TelegramSortSheet
              currentSort={sortBy}
              onSortChange={handleSortChange}
            />
          </SheetContent>
        </Sheet>

        {/* Error Display */}
        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </MobilePullToRefresh>
  );
}