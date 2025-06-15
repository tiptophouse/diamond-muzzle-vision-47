
import { useUserRole } from "@/hooks/useUserRole";
import { StoreHeader } from "./StoreHeader";
import { EducationalStoreHeader } from "./education/EducationalStoreHeader";

interface RoleBasedStoreHeaderProps {
  totalDiamonds: number;
  onOpenFilters: () => void;
}

export function RoleBasedStoreHeader({ totalDiamonds, onOpenFilters }: RoleBasedStoreHeaderProps) {
  const { userRole, isLoading } = useUserRole();

  // Show loading or default header while determining role
  if (isLoading) {
    return <StoreHeader totalDiamonds={totalDiamonds} onOpenFilters={onOpenFilters} />;
  }

  // For paid users, show professional header
  if (userRole === 'PAID_USER') {
    return <StoreHeader totalDiamonds={totalDiamonds} onOpenFilters={onOpenFilters} />;
  }

  // For free users, show educational header
  return <EducationalStoreHeader totalDiamonds={totalDiamonds} />;
}
