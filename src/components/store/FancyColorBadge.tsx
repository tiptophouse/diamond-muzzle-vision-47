
import { Badge } from "@/components/ui/badge";
import { Gem, Award, Zap } from "lucide-react";
import { FancyColorInfo } from "@/utils/fancyColorUtils";

interface FancyColorBadgeProps {
  colorInfo: FancyColorInfo;
  className?: string;
}

export function FancyColorBadge({ colorInfo, className = "" }: FancyColorBadgeProps) {
  if (!colorInfo.isFancyColor) {
    return (
      <Badge className={`text-xs font-medium bg-gray-100 text-gray-700 border-gray-300 ${className}`}>
        {colorInfo.colorDescription}
      </Badge>
    );
  }

  // Determine badge color based on intensity and hue
  const getBadgeStyle = () => {
    const intensity = colorInfo.intensity?.toLowerCase() || '';
    const hue = colorInfo.hue?.toLowerCase() || '';
    
    // High-value fancy colors get special styling
    if (intensity.includes('vivid') || intensity.includes('intense')) {
      if (hue.includes('yellow')) {
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0';
      } else if (hue.includes('pink') || hue.includes('red')) {
        return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0';
      } else if (hue.includes('blue')) {
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0';
      } else if (hue.includes('green')) {
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0';
      }
    }
    
    // Default fancy color styling
    return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0';
  };

  return (
    <Badge className={`text-xs font-medium ${getBadgeStyle()} shadow-sm flex items-center gap-1 ${className}`}>
      <Gem className="h-3 w-3" />
      {colorInfo.colorDescription}
    </Badge>
  );
}

interface CertificationBadgeProps {
  lab?: string;
  certificateUrl?: string;
  className?: string;
}

export function CertificationBadge({ lab, certificateUrl, className = "" }: CertificationBadgeProps) {
  if (!lab) return null;

  const handleClick = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

  return (
    <Badge 
      className={`text-xs font-medium bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 cursor-pointer hover:bg-blue-200 transition-colors ${className}`}
      onClick={handleClick}
    >
      <Award className="h-3 w-3" />
      {lab} Certified
    </Badge>
  );
}

interface OriginBadgeProps {
  isNatural?: boolean;
  treatment?: string;
  className?: string;
}

export function OriginBadge({ isNatural, treatment, className = "" }: OriginBadgeProps) {
  if (isNatural === undefined && !treatment) return null;

  const getOriginText = () => {
    if (treatment && treatment.toLowerCase() !== 'none') {
      return `Treated (${treatment})`;
    }
    return isNatural ? 'Natural' : 'Lab-Grown';
  };

  const getOriginStyle = () => {
    if (treatment && treatment.toLowerCase() !== 'none') {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return isNatural 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-purple-100 text-purple-800 border-purple-300';
  };

  return (
    <Badge className={`text-xs font-medium ${getOriginStyle()} flex items-center gap-1 ${className}`}>
      <Zap className="h-3 w-3" />
      {getOriginText()}
    </Badge>
  );
}
