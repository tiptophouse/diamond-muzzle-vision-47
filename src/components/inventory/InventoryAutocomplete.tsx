import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Diamond } from '@/types/diamond';

interface InventoryAutocompleteProps {
  diamonds: Diamond[];
  onSelect: (diamond: Diamond) => void;
}

export function InventoryAutocomplete({ diamonds, onSelect }: InventoryAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const filteredDiamonds = diamonds.filter((diamond) =>
    diamond.shape.toLowerCase().includes(value.toLowerCase()) ||
    diamond.carat.toString().includes(value.toLowerCase()) ||
    diamond.color.toLowerCase().includes(value.toLowerCase()) ||
    diamond.clarity.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <Command className="rounded-md border">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search diamonds..."
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        className="h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0"
      />
      <CommandList>
        <CommandInput placeholder="Type to search..." />
        <CommandEmpty>No diamonds found.</CommandEmpty>
        <CommandGroup heading="Diamonds">
          {filteredDiamonds.slice(0, 5).map((diamond) => (
            <CommandItem
              key={diamond.id}
              onSelect={() => {
                onSelect(diamond);
                setOpen(false);
                setValue('');
              }}
            >
              <Search className="mr-2 h-4 w-4 opacity-50" />
              {diamond.shape} {diamond.carat}ct {diamond.color} {diamond.clarity}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
