
import { useUserRole } from "@/hooks/useUserRole";
import { PremiumStoreFilters } from "./PremiumStoreFilters";
import { Diamond } from "@/components/inventory/InventoryTable";

interface RoleBasedStoreFiltersProps {
  filters: {
    shapes: string[];
    colors: string[];
    clarities: string[];
    caratRange: [number, number];
    priceRange: [number, number];
  };
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  diamonds: Diamond[];
}

export function RoleBasedStoreFilters(props: RoleBasedStoreFiltersProps) {
  const { userRole, isLoading } = useUserRole();

  // For free users in conversational flow, don't show filters
  if (!isLoading && userRole === 'FREE_USER') {
    return null;
  }

  // Show professional filters for paid users or while loading
  return <PremiumStoreFilters {...props} />;
}
