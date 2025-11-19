import { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useDeleteDiamond } from "@/hooks/api/useDiamonds";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { extractDiamondId } from "@/api/diamondTransformers";

interface AdminStoreControlsProps {
  diamond: Diamond;
  onUpdate: () => void;
  onDelete: () => void;
}

export function AdminStoreControls({ diamond, onUpdate, onDelete }: AdminStoreControlsProps) {
  const { user } = useTelegramAuth();
  const { isAdmin } = useIsAdmin();
  const deleteStone = useDeleteDiamond();

  if (!isAdmin || !user?.id) {
    return null;
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const diamondId = extractDiamondId(diamond);
    
    if (!diamondId) {
      console.error('❌ Cannot delete diamond: Invalid or missing diamond_id');
      alert('Cannot delete this diamond: Missing ID from backend. Please refresh and try again.');
      return;
    }
    
    if (confirm(`Delete diamond ${diamond.stockNumber}?`)) {
      deleteStone.mutate(
        { diamondId, userId: user.id },
        {
          onSuccess: () => {
            console.log('✅ Diamond deleted successfully');
            onDelete();
          },
          onError: (error) => {
            console.error('❌ Delete failed:', error);
          },
        }
      );
    }
  };

  return (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={deleteStone.isPending}
        className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-red-600 shadow-sm"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
