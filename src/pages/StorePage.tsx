
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreData } from "@/hooks/useStoreData";
import { useStoreFilters } from "@/hooks/useStoreFilters";
import { BeautifulStorePage } from "@/components/store/BeautifulStorePage";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { toast } from 'sonner';

export default function StorePage() {
  const { diamonds, loading, error, refetch } = useStoreData();
  const { filters, filteredDiamonds, updateFilter, clearFilters } = useStoreFilters(diamonds || []);
  const [searchParams] = useSearchParams();
  const { impactOccurred } = useTelegramHapticFeedback();

  const navigate = useNavigate();

  // Sort diamonds based on selected sort option
  const sortedDiamonds = useMemo(() => {
    const diamonds = [...filteredDiamonds];
    
    // Default sort: featured diamonds first, then by price
    return diamonds.sort((a, b) => {
      // Prioritize diamonds with images
      if (a.imageUrl && !b.imageUrl) return -1;
      if (!a.imageUrl && b.imageUrl) return 1;
      
      // Then by price (ascending)
      return a.price - b.price;
    });
  }, [filteredDiamonds]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      impactOccurred('light');
      await refetch();
      toast.success('Store refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh store');
      throw error;
    }
  }, [refetch, impactOccurred]);

  // Auto-scroll to diamond if found via stock parameter
  const stockNumber = searchParams.get('stock');
  useEffect(() => {
    if (stockNumber && sortedDiamonds.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`diamond-${stockNumber}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [stockNumber, sortedDiamonds]);

  return (
    <BeautifulStorePage 
      diamonds={sortedDiamonds}
      loading={loading}
      error={error}
      onRefresh={handleRefresh}
    />
  );
}
