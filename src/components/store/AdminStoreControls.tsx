import { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Diamond } from "@/components/inventory/InventoryTable";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useDiamondManagement } from "@/hooks/inventory/useDiamondManagement";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface AdminStoreControlsProps {
  diamond: Diamond;
  onUpdate: () => void;
  onDelete: () => void;
}

export function AdminStoreControls({ diamond, onUpdate, onDelete }: AdminStoreControlsProps) {
  const { user } = useTelegramAuth();
  const { isAdmin } = useIsAdmin();
  const { deleteStone } = useDiamondManagement(user?.id || 0);

  if (!isAdmin || !user?.id) {
    return null;
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this diamond?')) {
      deleteStone.mutate(diamond.stockNumber, {
        onSuccess: () => {
          onDelete();
        },
      });
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
