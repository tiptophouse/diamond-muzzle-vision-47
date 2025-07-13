
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface InventoryFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
}

export function InventoryFilters({ onFilterChange }: InventoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({
    shape: "all",
    color: "all",
    clarity: "all",
    caratMin: "",
    caratMax: "",
  });
  
  const { selectionChanged, impactOccurred } = useTelegramHapticFeedback();

  const shapes = [
    "Round", "Princess", "Cushion", "Emerald", 
    "Oval", "Pear", "Marquise", "Radiant", 
    "Asscher", "Heart"
  ];

  const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
  
  const clarities = [
    "FL", "IF", "VVS1", "VVS2", 
    "VS1", "VS2", "SI1", "SI2", 
    "I1", "I2", "I3"
  ];

  const handleChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Apply filters immediately
    const processedFilters = Object.keys(newFilters).reduce((acc, key) => {
      acc[key] = newFilters[key] === "all" ? "" : newFilters[key];
      return acc;
    }, {} as Record<string, string>);
    
    onFilterChange(processedFilters);
  };

  const applyFilters = () => {
    // Convert "all" values to empty strings for the parent component
    const processedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = filters[key] === "all" ? "" : filters[key];
      return acc;
    }, {} as Record<string, string>);
    
    onFilterChange(processedFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      shape: "all",
      color: "all",
      clarity: "all",
      caratMin: "",
      caratMax: "",
    };
    
    setFilters(emptyFilters);
    
    // Convert to empty strings for parent component
    const processedFilters = Object.keys(emptyFilters).reduce((acc, key) => {
      acc[key] = emptyFilters[key] === "all" ? "" : emptyFilters[key];
      return acc;
    }, {} as Record<string, string>);
    
    onFilterChange(processedFilters);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outline" 
          type="button"
          className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
          onClick={(e) => {
            e.preventDefault();
            impactOccurred('light');
            setIsOpen(!isOpen);
          }}
        >
          <Filter size={16} />
          Filters
        </Button>
        
        {/* Filter pills - show when active */}
        {filters.shape !== "all" && (
          <Button 
            variant="outline" 
            type="button"
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={(e) => {
              e.preventDefault();
              selectionChanged();
              handleChange('shape', 'all');
            }}
          >
            Shape: {filters.shape}
            <X size={14} className="ml-1" />
          </Button>
        )}
        {filters.color !== "all" && (
          <Button 
            variant="outline" 
            type="button"
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={(e) => {
              e.preventDefault();
              selectionChanged();
              handleChange('color', 'all');
            }}
          >
            Color: {filters.color}
            <X size={14} className="ml-1" />
          </Button>
        )}
        {filters.clarity !== "all" && (
          <Button 
            variant="outline" 
            type="button"
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={(e) => {
              e.preventDefault();
              selectionChanged();
              handleChange('clarity', 'all');
            }}
          >
            Clarity: {filters.clarity}
            <X size={14} className="ml-1" />
          </Button>
        )}
        {(filters.caratMin || filters.caratMax) && (
          <Button 
            variant="outline" 
            type="button"
            size="sm"
            className="bg-diamond-50 text-diamond-700 border-diamond-200"
            onClick={(e) => {
              e.preventDefault();
              selectionChanged();
              const newFilters = { ...filters, caratMin: '', caratMax: '' };
              setFilters(newFilters);
              
              // Apply filters immediately
              const processedFilters = Object.keys(newFilters).reduce((acc, key) => {
                acc[key] = newFilters[key] === "all" ? "" : newFilters[key];
                return acc;
              }, {} as Record<string, string>);
              
              onFilterChange(processedFilters);
            }}
          >
            Carat: {filters.caratMin || '0'} - {filters.caratMax || '∞'}
            <X size={14} className="ml-1" />
          </Button>
        )}
        
        {/* Clear all filters button - only show when at least one filter is active */}
        {(filters.shape !== "all" || filters.color !== "all" || filters.clarity !== "all" || filters.caratMin || filters.caratMax) && (
          <Button 
            variant="ghost" 
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              impactOccurred('medium');
              clearFilters();
            }}
          >
            Clear all
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="grid gap-4 p-4 mb-4 border rounded-lg bg-white">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shape">Shape</Label>
              <div className="relative">
                <select
                  id="shape"
                  value={filters.shape}
                  onChange={(e) => {
                    selectionChanged();
                    handleChange('shape', e.target.value);
                  }}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="all">Any shape</option>
                  {shapes.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="relative">
                <select
                  id="color"
                  value={filters.color}
                  onChange={(e) => {
                    selectionChanged();
                    handleChange('color', e.target.value);
                  }}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="all">Any color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clarity">Clarity</Label>
              <div className="relative">
                <select
                  id="clarity"
                  value={filters.clarity}
                  onChange={(e) => {
                    selectionChanged();
                    handleChange('clarity', e.target.value);
                  }}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                >
                  <option value="all">Any clarity</option>
                  {clarities.map((clarity) => (
                    <option key={clarity} value={clarity}>
                      {clarity}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caratMin">Carat (Min)</Label>
              <Input
                id="caratMin"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={filters.caratMin}
                onChange={(e) => handleChange('caratMin', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caratMax">Carat (Max)</Label>
              <Input
                id="caratMax"
                type="number"
                placeholder="No maximum"
                min="0"
                step="0.01"
                value={filters.caratMax}
                onChange={(e) => handleChange('caratMax', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                applyFilters();
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
