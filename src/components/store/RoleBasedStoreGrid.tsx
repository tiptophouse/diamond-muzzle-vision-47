
import { useUserRole } from "@/hooks/useUserRole";
import { StoreGrid } from "./StoreGrid";
import { DiamondEducationCard } from "./education/DiamondEducationCard";
import { DiamondCardSkeleton } from "./DiamondCardSkeleton";
import { Diamond } from "@/components/inventory/InventoryTable";
import { AlertCircle, GraduationCap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (diamonds.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-full"></div>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Diamonds Found</h3>
          <p className="text-sm sm:text-base text-slate-600">Try adjusting your filters to see more diamonds.</p>
        </div>
      </div>
    );
  }

  // For paid users, show the professional store grid
  if (userRole === 'PAID_USER') {
    return <StoreGrid diamonds={diamonds} loading={loading} error={error} onUpdate={onUpdate} />;
  }

  // For free users, show educational grid
  return (
    <div className="space-y-6">
      {/* Educational Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-purple-900">Educational Mode</div>
              <div className="text-sm text-purple-700">Learning about diamond characteristics - upgrade to see pricing and purchase options</div>
            </div>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </div>

      {/* Educational Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {diamonds.map((diamond) => (
          <DiamondEducationCard 
            key={diamond.id} 
            diamond={diamond}
          />
        ))}
      </div>

      {/* Bottom Conversion CTA */}
      {diamonds.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready to See Pricing & Make Purchases?</h3>
          <p className="text-purple-100 mb-4">Join thousands of professionals who trust our platform for diamond trading</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Professional
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Sales Team
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
