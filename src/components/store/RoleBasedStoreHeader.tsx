
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

  // For free users, show conversational header
  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <Diamond className="h-8 w-8 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Find Your Perfect Ring
            </h1>
            <p className="text-gray-600 mt-1">
              Learn about diamonds and design your dream engagement ring with AI
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-pink-600">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Design</span>
          </div>
          <div className="flex items-center gap-2 text-purple-600">
            <Heart className="h-4 w-4" />
            <span>Personalized Journey</span>
          </div>
        </div>
      </div>
    </div>
  );
}
