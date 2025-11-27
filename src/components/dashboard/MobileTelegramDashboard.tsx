import { useInventoryData } from '@/hooks/useInventoryData';
import { DealerDashboard } from './DealerDashboard';

export function MobileTelegramDashboard() {
  const { allDiamonds, loading } = useInventoryData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <DealerDashboard allDiamonds={allDiamonds} />;
}