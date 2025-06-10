
import { Filter, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreHeaderProps {
  totalDiamonds: number;
  onOpenFilters: () => void;
}

export function StoreHeader({ totalDiamonds, onOpenFilters }: StoreHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Gem className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Diamond Collection</h1>
              <p className="text-slate-600 mt-1">
                Discover our exquisite selection of {totalDiamonds} premium diamonds
              </p>
            </div>
          </div>
          
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="lg:hidden flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
