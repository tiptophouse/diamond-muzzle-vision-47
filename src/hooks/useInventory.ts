
import { useInventoryData } from './useInventoryData';

export function useInventory(userId?: number) {
  const { diamonds, loading, error, handleRefresh } = useInventoryData();
  
  return {
    data: diamonds,
    isLoading: loading,
    error,
    refetch: handleRefresh
  };
}
