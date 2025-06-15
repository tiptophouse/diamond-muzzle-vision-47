
import { useUserRole } from "@/hooks/useUserRole";
import { PremiumStoreFilters } from "./PremiumStoreFilters";
import { DiamondLearningFilters } from "./education/DiamondLearningFilters";
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

  // Show professional filters while loading or for paid users
  if (isLoading || userRole === 'PAID_USER') {
    return <PremiumStoreFilters {...props} />;
  }

  // Show educational filters for free users
  return <DiamondLearningFilters {...props} />;
}
