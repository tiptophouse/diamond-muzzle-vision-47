
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { generateSampleDiamonds } from "@/utils/sampleDataGenerator";
import { useOptimizedPostgresInventory } from "@/hooks/useOptimizedPostgresInventory";
import { useToast } from "@/components/ui/use-toast";

export function SampleDataButton() {
  const [isAdding, setIsAdding] = useState(false);
  const { createDiamond } = useOptimizedPostgresInventory();
  const { toast } = useToast();

  const addSampleData = async () => {
    setIsAdding(true);
    try {
      const sampleDiamonds = generateSampleDiamonds(5);
      let successCount = 0;

      for (const diamond of sampleDiamonds) {
        const success = await createDiamond(diamond);
        if (success) successCount++;
      }

      toast({
        title: "Sample Data Added! 🎉",
        description: `Successfully added ${successCount} sample diamonds to test the optimized PostgreSQL system.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add sample data. Please try again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button 
      onClick={addSampleData} 
      disabled={isAdding}
      variant="outline"
      className="bg-gradient-to-r from-green-50 to-blue-50 border-green-300 hover:from-green-100 hover:to-blue-100"
    >
      {isAdding ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      {isAdding ? "Adding..." : "Add Sample Data"}
    </Button>
  );
}
