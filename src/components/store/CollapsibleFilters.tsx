import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Diamond } from '@/types/diamond';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface CollapsibleFiltersProps {
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}

export function CollapsibleFilters({ onApplyFilters, onClearFilters }: CollapsibleFiltersProps) {
  const [shape, setShape] = useState('');
  const [color, setColor] = useState('');
  const [clarity, setClarity] = useState('');

  const handleApplyFilters = () => {
    const filters = {
      shape,
      color,
      clarity,
    };
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setShape('');
    setColor('');
    setClarity('');
    onClearFilters();
  };

  return (
    <Card className="w-full">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Filters
            <Filter className="w-4 h-4 mr-2" />
            <ChevronDown className="w-4 h-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border p-4">
          <div className="grid gap-4">
            <div>
              <label htmlFor="shape" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                Shape
              </label>
              <input
                type="text"
                id="shape"
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="color" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                Color
              </label>
              <input
                type="text"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="clarity" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                Clarity
              </label>
              <input
                type="text"
                id="clarity"
                value={clarity}
                onChange={(e) => setClarity(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
