
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, Rotate3D } from "lucide-react";

interface ImageAvailabilityFilterProps {
  hasImages: boolean;
  has360: boolean;
  onHasImagesChange: (value: boolean) => void;
  onHas360Change: (value: boolean) => void;
}

export function ImageAvailabilityFilter({
  hasImages,
  has360,
  onHasImagesChange,
  onHas360Change,
}: ImageAvailabilityFilterProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <Label htmlFor="has-images" className="text-sm font-medium">
            Only with Photos
          </Label>
        </div>
        <Switch
          id="has-images"
          checked={hasImages}
          onCheckedChange={onHasImagesChange}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rotate3D className="h-4 w-4 text-primary" />
          <Label htmlFor="has-360" className="text-sm font-medium">
            Only with 360°/3D
          </Label>
        </div>
        <Switch
          id="has-360"
          checked={has360}
          onCheckedChange={onHas360Change}
        />
      </div>
    </div>
  );
}
