
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { shapes, colors, clarities } from "./singleStoneFormConstants";

interface BasicInfoSectionProps {
  formData: {
    stockNumber: string;
    shape: string;
    carat: string;
    color: string;
    clarity: string;
    cut: string;
    price: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function BasicInfoSection({ formData, onInputChange }: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="stockNumber">Stock Number *</Label>
        <Input
          id="stockNumber"
          value={formData.stockNumber}
          onChange={(e) => onInputChange('stockNumber', e.target.value)}
          placeholder="e.g., STK-001"
          required
        />
      </div>

      <div>
        <Label htmlFor="shape">Shape *</Label>
        <Select value={formData.shape} onValueChange={(value) => onInputChange('shape', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select shape" />
          </SelectTrigger>
          <SelectContent>
            {shapes.map(shape => (
              <SelectItem key={shape} value={shape}>{shape}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="carat">Carat Weight *</Label>
        <Input
          id="carat"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.carat}
          onChange={(e) => onInputChange('carat', e.target.value)}
          placeholder="e.g., 1.25"
          required
        />
      </div>

      <div>
        <Label htmlFor="color">Color *</Label>
        <Select value={formData.color} onValueChange={(value) => onInputChange('color', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {colors.map(color => (
              <SelectItem key={color} value={color}>{color}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="clarity">Clarity *</Label>
        <Select value={formData.clarity} onValueChange={(value) => onInputChange('clarity', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select clarity" />
          </SelectTrigger>
          <SelectContent>
            {clarities.map(clarity => (
              <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="price">Price (USD) *</Label>
        <Input
          id="price"
          type="number"
          min="1"
          value={formData.price}
          onChange={(e) => onInputChange('price', e.target.value)}
          placeholder="e.g., 5000"
          required
        />
      </div>
    </div>
  );
}
