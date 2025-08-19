
import { Badge } from "@/components/ui/badge";

interface FancyColorBadgeProps {
  color: string;
  colorType?: 'Fancy' | 'Standard';
  className?: string;
}

export function FancyColorBadge({ color, colorType, className }: FancyColorBadgeProps) {
  const isFancy = colorType === 'Fancy' || 
    !['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].includes(color);

  if (isFancy) {
    return (
      <Badge 
        variant="default" 
        className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white ${className}`}
      >
        {color}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      {color}
    </Badge>
  );
}
