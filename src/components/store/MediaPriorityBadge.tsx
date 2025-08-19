
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, FileText } from "lucide-react";

interface MediaPriorityBadgeProps {
  type: '3d' | 'image' | 'info';
  className?: string;
}

export function MediaPriorityBadge({ type, className }: MediaPriorityBadgeProps) {
  if (type === '3d') {
    return (
      <Badge variant="default" className={`gap-1 ${className}`}>
        <Sparkles className="h-3 w-3" />
        3D View
      </Badge>
    );
  }
  
  if (type === 'image') {
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
