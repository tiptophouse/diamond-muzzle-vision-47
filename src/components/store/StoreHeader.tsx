
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StoreHeaderProps {
  totalDiamonds: number;
  onOpenFilters: () => void;
}

export function StoreHeader({ totalDiamonds, onOpenFilters }: StoreHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Diamond Collection</h1>
                <p className="text-slate-600">
                  Discover our exquisite selection of {totalDiamonds.toLocaleString()} premium diamonds
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Mobile Filter Button */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search diamonds..."
                className="pl-10 w-64"
              />
            </div>

            {/* Mobile Filter Button */}
            <Button 
              variant="outline" 
              className="lg:hidden flex items-center gap-2"
              onClick={onOpenFilters}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
