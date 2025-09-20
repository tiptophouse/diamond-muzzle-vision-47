import { useCallback, useState } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useToast } from '@/hooks/use-toast';

interface UseOptimizedDeleteProps {
  onDelete: (diamondId: string, diamondData?: Diamond) => Promise<boolean>;
  onOptimisticRemove?: (diamondId: string) => void;
  onOptimisticRestore?: (diamond: Diamond) => void;
}

export function useOptimizedDelete({ onDelete, onOptimisticRemove, onOptimisticRestore }: UseOptimizedDeleteProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDelete = useCallback(async (diamondId: string, diamondData?: Diamond) => {
    if (deletingIds.has(diamondId)) {
      return false; // Already deleting
    }

    try {
      setDeletingIds(prev => new Set(prev).add(diamondId));
      
      // Optimistically remove from UI
      if (onOptimisticRemove) {
        onOptimisticRemove(diamondId);
      }

      // Attempt actual deletion
      const success = await onDelete(diamondId, diamondData);
      
      if (!success) {
        // Restore if deletion failed
        if (onOptimisticRestore && diamondData) {
          onOptimisticRestore(diamondData);
        }
        
        toast({
          title: "❌ Delete Failed",
          description: "Failed to delete diamond. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Diamond Deleted",
          description: "Diamond removed from inventory successfully",
        });
      }

      return success;
    } catch (error) {
      // Restore on error
      if (onOptimisticRestore && diamondData) {
        onOptimisticRestore(diamondData);
      }
      
      toast({
        title: "❌ Delete Error",
        description: "An error occurred while deleting. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(diamondId);
        return newSet;
      });
    }
  }, [onDelete, onOptimisticRemove, onOptimisticRestore, deletingIds, toast]);

  return {
    handleDelete,
    deletingIds
  };
}