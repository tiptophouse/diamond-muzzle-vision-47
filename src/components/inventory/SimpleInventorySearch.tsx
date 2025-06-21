
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SimpleInventorySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export function SimpleInventorySearch({ 
  searchQuery, 
  onSearchChange, 
  totalCount 
}: SimpleInventorySearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search diamonds..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="text-sm text-gray-600">
        {totalCount} diamonds total
      </div>
    </div>
  );
}
