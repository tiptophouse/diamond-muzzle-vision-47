
import { Filter, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreHeaderProps {
  totalDiamonds: number;
  onOpenFilters: () => void;
}

export function StoreHeader({ totalDiamonds, onOpenFilters }: StoreHeaderProps) {
  return (
    <div className="w-full">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
            <Gem className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
              Diamond Collection
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Discover our exquisite selection of </span>
              <span className="font-medium">{totalDiamonds}</span> 
              <span className="hidden sm:inline"> premium diamonds</span>
              <span className="sm:hidden"> diamonds</span>
            </p>
          </div>
        </div>
        
        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 flex-shrink-0 h-10 px-3 sm:px-4"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>
    </div>
  );
}
