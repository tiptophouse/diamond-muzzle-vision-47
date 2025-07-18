
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterHeaderProps {
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function FilterHeader({ activeFiltersCount, onClearFilters }: FilterHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Refine Your Search</h2>
          <p className="text-sm text-slate-600">Find your perfect diamond</p>
        </div>
      </div>
      
      {/* Clear All button placed below header as per Helen's feedback */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 self-start">
            {activeFiltersCount} active filters
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 self-start"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
