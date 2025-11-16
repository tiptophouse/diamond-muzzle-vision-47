
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateDiamond } from "@/api/diamonds";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTutorial } from "@/contexts/TutorialContext";

interface StoreVisibilityToggleProps {
  stockNumber: string;
  diamondId: string; // Add diamond ID for FastAPI update
  isVisible: boolean;
  onToggle: (stockNumber: string, isVisible: boolean) => void;
}

export function StoreVisibilityToggle({ stockNumber, diamondId, isVisible, onToggle }: StoreVisibilityToggleProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const tutorial = useTutorial();
  const handleRequiredClick = tutorial?.handleRequiredClick || (() => {});

  const handleToggle = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to update diamond visibility",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Handle tutorial interaction
    handleRequiredClick();
    
    try {
      // Use FastAPI to update diamond store visibility
      const response = await updateDiamond(diamondId, {
        store_visible: !isVisible
      }, user.id);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update visibility');
      }

      onToggle(stockNumber, !isVisible);
      
      toast({
        title: isVisible ? "Hidden from store" : "Added to store",
        description: `Diamond ${stockNumber} ${isVisible ? 'hidden from' : 'added to'} the store.`,
      });
    } catch (error) {
      console.error('Error toggling store visibility:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update store visibility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      data-tutorial="store-visibility"
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={`h-8 w-8 p-0 ${
        isVisible 
          ? 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900' 
          : 'text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700'
      }`}
      title={isVisible ? 'Hide from store' : 'Show in store'}
    >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </Button>
  );
}
