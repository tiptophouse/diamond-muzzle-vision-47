
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InventoryFiltersProps {
  onFilterChange?: (filters: any) => void;
}

export function InventoryFilters({ onFilterChange }: InventoryFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Select onValueChange={(value) => handleFilterChange('shape', value)}>
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

      <Select onValueChange={(value) => handleFilterChange('color', value)}>
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

      <Select onValueChange={(value) => handleFilterChange('clarity', value)}>
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

      <Button 
        variant="outline" 
        onClick={() => onFilterChange && onFilterChange({})}
      >
        Clear Filters
      </Button>
    </div>
  );
}
