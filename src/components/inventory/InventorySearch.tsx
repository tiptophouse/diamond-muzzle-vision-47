
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface InventorySearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function InventorySearch({ searchQuery, onSearchChange, onSubmit }: InventorySearchProps) {
  return (
    <form onSubmit={onSubmit} className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by stock number, shape, color, clarity..."
        className="pl-8"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </form>
  );
}
