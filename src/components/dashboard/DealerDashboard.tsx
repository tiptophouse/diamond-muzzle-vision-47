import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useTelegramCloudStorage } from '@/hooks/useTelegramCloudStorage';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useNotifications } from '@/hooks/useNotifications';
import { useSearchResults } from '@/hooks/useSearchResults';
import { Diamond } from '@/components/inventory/InventoryTable';
import { BuyerDemandCarousel } from './BuyerDemandCarousel';
import { ActionAlertsSection } from './ActionAlertsSection';
import { FloatingSpeedDial } from './FloatingSpeedDial';
import { RecentDiamondsCompact } from './RecentDiamondsCompact';
import { DealerQuickStats } from './DealerQuickStats';
import { Loader2 } from 'lucide-react';

interface DealerDashboardProps {
  allDiamonds: Diamond[];
}

export function DealerDashboard({ allDiamonds }: DealerDashboardProps) {
  const { notificationOccurred } = useTelegramHapticFeedback();
  const { setItem, getItem } = useTelegramCloudStorage();
  const { searchResults, refetch: refetchSearchResults } = useSearchResults();
  const { refetch: refetchNotifications } = useNotifications();

  const handleRefresh = async () => {
    await Promise.all([
      refetchSearchResults(),
      refetchNotifications(),
    ]);
    notificationOccurred('success');
  };

  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  return (
    <div className="relative min-h-screen bg-background pb-24">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex justify-center z-50 transition-opacity"
          style={{ 
            opacity: Math.min(pullDistance / 80, 1),
            transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`
          }}
        >
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
            {isRefreshing ? (
              <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Refreshing...</>
            ) : (
              <>Pull to refresh</>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-6 space-y-6">
        {/* Dealer Stats */}
        <DealerQuickStats allDiamonds={allDiamonds} />

        {/* HERO: Buyer Demand */}
        <BuyerDemandCarousel searchResults={searchResults} />

        {/* Action Alerts */}
        <ActionAlertsSection allDiamonds={allDiamonds} />

        {/* Recent Diamonds */}
        <RecentDiamondsCompact diamonds={allDiamonds.slice(0, 10)} />
      </div>

      {/* Floating Speed Dial */}
      <FloatingSpeedDial />
    </div>
  );
}
