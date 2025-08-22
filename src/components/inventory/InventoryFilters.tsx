
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Diamond } from '@/types/diamond';

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  shapeFilter: string;
  onShapeChange: (value: string) => void;
  colorFilter: string;
  onColorChange: (value: string) => void;
  clarityFilter: string;
  onClarityChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  diamonds: Diamond[];
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  shapeFilter,
  onShapeChange,
  colorFilter,
  onColorChange,
  clarityFilter,
  onClarityChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  diamonds
}: InventoryFiltersProps) {
  const handleClearFilters = () => {
    onSearchChange('');
    onShapeChange('all');
    onColorChange('all');
    onClarityChange('all');
    onStatusChange('all');
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Input
        placeholder="Search diamonds..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
      />

      <Select value={shapeFilter} onValueChange={onShapeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Shape" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Shapes</SelectItem>
          <SelectItem value="round">Round</SelectItem>
          <SelectItem value="princess">Princess</SelectItem>
          <SelectItem value="cushion">Cushion</SelectItem>
          <SelectItem value="emerald">Emerald</SelectItem>
          <SelectItem value="oval">Oval</SelectItem>
          <SelectItem value="pear">Pear</SelectItem>
          <SelectItem value="marquise">Marquise</SelectItem>
          <SelectItem value="heart">Heart</SelectItem>
          <SelectItem value="radiant">Radiant</SelectItem>
          <SelectItem value="asscher">Asscher</SelectItem>
        </SelectContent>
      </Select>

      <Select value={colorFilter} onValueChange={onColorChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Colors</SelectItem>
          <SelectItem value="D">D</SelectItem>
          <SelectItem value="E">E</SelectItem>
          <SelectItem value="F">F</SelectItem>
          <SelectItem value="G">G</SelectItem>
          <SelectItem value="H">H</SelectItem>
          <SelectItem value="I">I</SelectItem>
          <SelectItem value="J">J</SelectItem>
          <SelectItem value="K">K</SelectItem>
          <SelectItem value="L">L</SelectItem>
        </SelectContent>
      </Select>

      <Select value={clarityFilter} onValueChange={onClarityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Clarity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clarity</SelectItem>
          <SelectItem value="FL">FL</SelectItem>
          <SelectItem value="IF">IF</SelectItem>
          <SelectItem value="VVS1">VVS1</SelectItem>
          <SelectItem value="VVS2">VVS2</SelectItem>
          <SelectItem value="VS1">VS1</SelectItem>
          <SelectItem value="VS2">VS2</SelectItem>
          <SelectItem value="SI1">SI1</SelectItem>
          <SelectItem value="SI2">SI2</SelectItem>
          <SelectItem value="I1">I1</SelectItem>
          <SelectItem value="I2">I2</SelectItem>
          <SelectItem value="I3">I3</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
