
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { labs } from "./singleStoneFormConstants";

interface CertificateInfoSectionProps {
  formData: {
    certificateNumber: string;
    lab: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function CertificateInfoSection({ formData, onInputChange }: CertificateInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="certificateNumber">Certificate Number</Label>
        <Input
          id="certificateNumber"
          value={formData.certificateNumber}
          onChange={(e) => onInputChange('certificateNumber', e.target.value)}
          placeholder="e.g., 1234567890"
        />
      </div>

      <div>
        <Label htmlFor="lab">Lab</Label>
        <Select value={formData.lab} onValueChange={(value) => onInputChange('lab', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {labs.map(lab => (
              <SelectItem key={lab} value={lab}>{lab}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
