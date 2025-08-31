
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, FileText } from "lucide-react";

interface MediaPriorityBadgeProps {
  has360: boolean;
  hasImage: boolean;
  is3D?: boolean;
  className?: string;
}

export function MediaPriorityBadge({ has360, hasImage, is3D, className }: MediaPriorityBadgeProps) {
  if (has360) {
    return (
      <Badge variant="default" className={`gap-1 ${className}`}>
        <Sparkles className="h-3 w-3" />
        360° View
      </Badge>
    );
  }
  
  if (is3D && hasImage) {
    return (
      <Badge variant="default" className={`gap-1 ${className}`}>
        <Sparkles className="h-3 w-3" />
        3D View
      </Badge>
    );
  }
  
  if (hasImage) {
    return (
      <Badge variant="secondary" className={`gap-1 ${className}`}>
        <Camera className="h-3 w-3" />
        Photo
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <FileText className="h-3 w-3" />
      Info Only
    </Badge>
  );
}
