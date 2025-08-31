
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTutorial } from "@/contexts/TutorialContext";

interface StoreVisibilityToggleProps {
  stockNumber: string;
  isVisible: boolean;
  onToggle: (stockNumber: string, isVisible: boolean) => void;
}

export function StoreVisibilityToggle({ stockNumber, isVisible, onToggle }: StoreVisibilityToggleProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const tutorial = useTutorial();
  const handleRequiredClick = tutorial?.handleRequiredClick || (() => {});

  const handleToggle = async () => {
    setLoading(true);
    
    // Handle tutorial interaction
    handleRequiredClick();
    
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ store_visible: !isVisible })
        .eq('stock_number', stockNumber);

      if (error) throw error;

      onToggle(stockNumber, !isVisible);
      
      toast({
        title: isVisible ? "Hidden from store" : "Added to store",
        description: `Diamond ${stockNumber} ${isVisible ? 'hidden from' : 'added to'} the store.`,
      });
    } catch (error) {
      console.error('Error toggling store visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update store visibility",
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
