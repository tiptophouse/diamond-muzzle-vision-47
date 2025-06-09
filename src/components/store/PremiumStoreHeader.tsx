
import { Search, Filter, SlidersHorizontal, Sparkles, Award, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PremiumStoreHeaderProps {
  totalDiamonds: number;
  onOpenFilters: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function PremiumStoreHeader({ 
  totalDiamonds, 
  onOpenFilters, 
  searchQuery = "",
  onSearchChange 
}: PremiumStoreHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Premium Collection
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {totalDiamonds} Certified Diamonds
                  </Badge>
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
                    <Award className="h-3 w-3 mr-1" />
                    GIA Certified
                  </Badge>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:max-w-md lg:flex-1">
              {/* Enhanced Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by shape, color, clarity..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                />
              </div>
              
              {/* Filter Button */}
              <Button 
                variant="outline" 
                onClick={onOpenFilters}
                className="bg-white border-slate-300 hover:bg-slate-50 shadow-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="pb-4 flex flex-wrap gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>All diamonds certified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Competitive pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Expert consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
            <span>Premium quality guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
