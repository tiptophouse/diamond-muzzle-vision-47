
import { Search, Filter, SortAsc, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SecureStoreShare } from "./SecureStoreShare";
import { useState } from "react";

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  onSortClick: () => void;
  totalCount: number;
  filteredCount: number;
  storeOwnerName?: string;
}

export function StoreHeader({
  searchQuery,
  onSearchChange,
  onFilterClick,
  onSortClick,
  totalCount,
  filteredCount,
  storeOwnerName = "Diamond Store"
}: StoreHeaderProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {storeOwnerName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {filteredCount} of {totalCount} diamonds
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(!showShareDialog)}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Store
          </Button>
        </div>
      </div>

      {showShareDialog && (
        <div className="mt-4">
          <SecureStoreShare 
            storeTitle={storeOwnerName}
            diamondCount={totalCount}
            showAnalytics={true}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search diamonds..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="whitespace-nowrap"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSortClick}
            className="whitespace-nowrap"
          >
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </div>
      </div>
    </div>
  );
}
