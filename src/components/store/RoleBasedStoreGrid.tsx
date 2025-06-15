
import { useUserRole } from "@/hooks/useUserRole";
import { StoreGrid } from "./StoreGrid";
import { DiamondEducationFlow } from "./education/DiamondEducationFlow";
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

  if (loading || roleLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 12 }, (_, i) => (
          <DiamondCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Diamonds</h3>
          <p className="text-sm sm:text-base text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // For paid users, show the professional store grid
  if (userRole === 'PAID_USER') {
    return <StoreGrid diamonds={diamonds} loading={loading} error={error} onUpdate={onUpdate} />;
  }

  // For free users, show the conversational education flow
  return (
    <div className="h-[calc(100vh-12rem)]">
      <DiamondEducationFlow />
    </div>
  );
}
