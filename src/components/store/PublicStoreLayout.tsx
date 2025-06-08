
import { ReactNode } from "react";
import { Search, Filter, SortAsc, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PublicStoreLayoutProps {
  children: ReactNode;
  onSearch: (query: string) => void;
  searchQuery: string;
  onToggleFilters: () => void;
  resultsCount: number;
  sortBy: string;
  onSortChange: (sort: any) => void;
}

export function PublicStoreLayout({
  children,
  onSearch,
  searchQuery,
  onToggleFilters,
  resultsCount,
  sortBy,
  onSortChange,
}: PublicStoreLayoutProps) {
  const { toast } = useToast();

  const handleShareStore = () => {
    const storeUrl = `${window.location.origin}/store`;
    
    if (navigator.share) {
      navigator.share({
        title: "Diamond Collection",
        text: "Check out our premium diamond collection",
        url: storeUrl
      });
    } else {
      navigator.clipboard.writeText(storeUrl);
      toast({
        title: "Store Link Copied!",
        description: "Store link has been copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Diamond Collection</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search diamonds..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Share Store & Contact Info */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareStore}
                className="hidden md:flex"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Store
              </Button>
              <div className="hidden md:flex text-sm text-gray-600">
                <span>Contact: +1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFilters}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <span className="text-sm text-gray-600">
                {resultsCount} diamonds found
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareStore}
                className="md:hidden"
              >
                <Share className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <SortAsc className="h-4 w-4 text-gray-400" />
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="carat-desc">Carat: Large to Small</SelectItem>
                    <SelectItem value="carat-asc">Carat: Small to Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Premium Diamond Collection</h3>
            <p className="text-gray-400 mb-4">Certified diamonds with exceptional quality and value</p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <span>GIA Certified</span>
              <span>Lifetime Warranty</span>
              <span>Free Shipping</span>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
