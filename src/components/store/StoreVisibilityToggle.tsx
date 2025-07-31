
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreVisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function StoreVisibilityToggle({ isVisible, onToggle, isLoading }: StoreVisibilityToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      disabled={isLoading}
      className="h-8 w-8 p-0 bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
      ) : isVisible ? (
        <Eye className="h-4 w-4 text-green-600" />
      ) : (
        <EyeOff className="h-4 w-4 text-gray-400" />
      )}
    </Button>
  );
}
