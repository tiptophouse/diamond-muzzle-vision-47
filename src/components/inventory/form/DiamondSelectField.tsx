
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiamondSelectFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function DiamondSelectField({ 
  id, 
  label, 
  value, 
  onValueChange, 
  options, 
  placeholder = `Select ${label.toLowerCase()}` 
}: DiamondSelectFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className="bg-background border shadow-lg z-50 max-h-64 overflow-y-auto"
          position="popper"
          sideOffset={4}
          align="start"
          avoidCollisions={true}
        >
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className="cursor-pointer hover:bg-accent focus:bg-accent"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
