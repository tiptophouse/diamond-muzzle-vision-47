
import { useUserRole } from "@/hooks/useUserRole";
import { StoreHeader } from "./StoreHeader";
import { Diamond, Sparkles, Heart } from "lucide-react";

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

  // For free users, show minimal header that doesn't interfere with the menu
  return (
    <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Diamond className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">MAZAL Diamond Assistant</h1>
            <p className="text-sm text-gray-600">Your Personal Diamond Expert</p>
          </div>
        </div>
      </div>
    </div>
  );
}
