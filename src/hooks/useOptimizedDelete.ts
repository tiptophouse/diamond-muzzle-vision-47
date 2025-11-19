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
        
        console.error('❌ Delete failed for diamond:', diamondId);
        toast({
          title: "❌ Delete Failed",
          description: `Failed to delete diamond ${diamondData?.stockNumber || diamondId}. Please try again.`,
          variant: "destructive",
        });
      } else {
        console.log('✅ Diamond deleted successfully:', diamondId);
        toast({
          title: "✅ Success",
          description: `Diamond ${diamondData?.stockNumber || diamondId} has been deleted and removed from your store.`,
        });
      }

      return success;
    } catch (error) {
      // Restore on error
      if (onOptimisticRestore && diamondData) {
        onOptimisticRestore(diamondData);
      }
      
      console.error('❌ Delete error:', error);
      toast({
        title: "❌ Delete Error",
        description: `An error occurred while deleting ${diamondData?.stockNumber || diamondId}. Please try again.`,
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