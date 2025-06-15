
import { useUserRole } from "@/hooks/useUserRole";
import { StoreGrid } from "./StoreGrid";
import { MainMenuFlow } from "./education/MainMenuFlow";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle } from "lucide-react";

interface RoleBasedStoreGridProps {
  diamonds: Diamond[];
  loading: boolean;
  error?: string | null;
  onUpdate?: () => void;
}

export function RoleBasedStoreGrid({ diamonds, loading, error, onUpdate }: RoleBasedStoreGridProps) {
  const { userRole, isLoading: roleLoading } = useUserRole();

  console.log('🔍 RoleBasedStoreGrid - User role:', userRole, 'Loading:', roleLoading);

  if (loading || roleLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 12 }, (_, i) => (
          <DiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-6 sm:py-8 lg:py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">Error Loading Diamonds</h3>
          <p className="text-sm sm:text-base text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // For FREE_USER (non-paid users), show the B2C conversational experience
  if (userRole === 'FREE_USER') {
    console.log('✅ Showing B2C MainMenuFlow for FREE_USER');
    return (
      <div className="h-full min-h-[60vh] sm:min-h-[70vh]">
        <MainMenuFlow />
      </div>
    );
  }

  // For PAID_USER, show the professional store grid
  console.log('✅ Showing professional StoreGrid for PAID_USER');
  return <StoreGrid diamonds={diamonds} loading={loading} error={error} onUpdate={onUpdate} />;
}
