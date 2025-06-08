
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface LuxuryStoreLayoutProps {
  children: React.ReactNode;
  onSearch: (query: string) => void;
  searchQuery: string;
  onToggleFilters: () => void;
  resultsCount: number;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function LuxuryStoreLayout({
  children,
  onSearch,
  searchQuery,
  onToggleFilters,
  resultsCount,
  sortBy,
  onSortChange
}: LuxuryStoreLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Luxury Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Brand Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
                Diamond Collection
              </h1>
              <p className="text-slate-600 mt-2 text-lg font-light">
                Discover exceptional diamonds crafted for perfection
              </p>
            </div>
            
            {/* Search and Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search diamonds..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-10 py-3 bg-white/50 border-slate-300 focus:border-slate-500 text-slate-900 placeholder:text-slate-500"
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={onToggleFilters}
                  className="lg:hidden border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 font-medium">
                    {resultsCount} diamonds
                  </span>
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="w-40 bg-white/50 border-slate-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="carat-asc">Carat: Low to High</SelectItem>
                      <SelectItem value="carat-desc">Carat: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
