import React from 'react';
import { Search } from 'lucide-react';
import { Diamond } from '@/types/diamond';
import { Input } from '@/components/ui/input';

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function InventorySearch({ searchTerm, onSearchChange }: InventorySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search inventory..."
        className="pl-9"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
