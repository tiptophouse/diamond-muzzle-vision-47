
import { EnhancedStoreHeader } from '@/components/store/EnhancedStoreHeader';
import { EnhancedStoreGrid } from '@/components/store/EnhancedStoreGrid';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useStoreData } from '@/hooks/useStoreData';
import { useStoreFilters } from '@/hooks/useStoreFilters';

export default function Store() {
  const { diamonds, loading, error } = useStoreData();
  const { filters, sortBy, setSortBy, setFilter, clearFilters } = useStoreFilters();

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  const handleOpenFilters = () => {
    // Handle opening filters modal/drawer
    console.log('Opening filters');
  };

  if (error) {
    return (
      <TelegramLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Store</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </TelegramLayout>
    );
  }

  return (
    <TelegramLayout>
      <div className="min-h-screen bg-gray-50">
        <EnhancedStoreHeader
          totalDiamonds={diamonds.length}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onOpenFilters={handleOpenFilters}
        />
        <EnhancedStoreGrid
          diamonds={diamonds}
          loading={loading}
        />
      </div>
    </TelegramLayout>
  );
}
