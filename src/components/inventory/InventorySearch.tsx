
import { InventoryAutocomplete } from "./InventoryAutocomplete";
import { Diamond } from "./InventoryTable";

interface InventorySearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  allDiamonds: Diamond[];
}

export function InventorySearch({ 
  searchQuery, 
  onSearchChange, 
  onSubmit, 
  allDiamonds 
}: InventorySearchProps) {
  return (
    <InventoryAutocomplete
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onSubmit={onSubmit}
      allDiamonds={allDiamonds}
    />
  );
}
