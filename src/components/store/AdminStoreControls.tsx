
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { Diamond } from '@/types/diamond';

interface AdminStoreControlsProps {
  diamond: Diamond;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function AdminStoreControls({ diamond, onUpdate, onDelete }: AdminStoreControlsProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleToggleVisibility = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    setIsToggling(true);
    try {
      const numericDiamondId = parseInt(diamond.id);
      const response = await api.put(
        apiEndpoints.updateDiamond(numericDiamondId, userId),
        { store_visible: !diamond.store_visible }
      );

      if (!response.error) {
        toast({
          title: "✅ Visibility Updated",
          description: diamond.store_visible ? "Hidden from store" : "Added to store",
        });
        onUpdate?.();
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to toggle visibility",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    setIsDeleting(true);
    try {
      const numericDiamondId = parseInt(diamond.id);
      const response = await api.delete(
        apiEndpoints.deleteDiamond(numericDiamondId, userId)
      );

      if (!response.error) {
        toast({
          title: "✅ Diamond Deleted",
          description: "Diamond removed successfully",
        });
        onDelete?.();
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete diamond",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleVisibility}
        disabled={isToggling}
        className={`h-8 w-8 p-0 ${
          diamond.store_visible 
            ? 'text-green-600 hover:bg-green-100' 
            : 'text-slate-400 hover:bg-slate-100'
        }`}
        title={diamond.store_visible ? 'Hide from store' : 'Show in store'}
      >
        {diamond.store_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-100"
        title="Delete diamond"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
