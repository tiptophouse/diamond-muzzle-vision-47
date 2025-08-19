
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";
import { Edit, Trash2, Eye, Share2 } from "lucide-react";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { toast } from "sonner";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface InventoryTableRowProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamond: Diamond) => void;
  onView?: (diamond: Diamond) => void;
  onStoreToggle?: (stockNumber: string, isVisible: boolean) => void;
  onImageUpdate?: () => void;
}

export function InventoryTableRow({ 
  diamond, 
  onEdit, 
  onDelete, 
  onView,
  onStoreToggle,
  onImageUpdate
}: InventoryTableRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { shareWithInlineButtons, isAvailable: sharingAvailable } = useSecureDiamondSharing();
  const { user } = useTelegramAuth();

  const handleDelete = async () => {
    if (!user || !diamond.id) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting diamond:', diamond.id, 'for user:', user.id);
      
      // Use the correct FastAPI endpoint for deletion
      await api.delete(apiEndpoints.deleteDiamond(diamond.id, user.id));
      
      console.log('✅ Diamond deleted successfully');
      
      // Dispatch success event for notifications
      window.dispatchEvent(new CustomEvent('diamondDeleted', {
        detail: { 
          success: true, 
          message: `Diamond ${diamond.stockNumber} deleted successfully!` 
        }
      }));
      
      // Call the onDelete callback if provided
      onDelete?.(diamond);
      
    } catch (error) {
      console.error('❌ Failed to delete diamond:', error);
      
      // Dispatch failure event for notifications
      window.dispatchEvent(new CustomEvent('diamondDeleted', {
        detail: { 
          success: false, 
          message: `Failed to delete diamond ${diamond.stockNumber}` 
        }
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSecureShare = async () => {
    if (!sharingAvailable) {
      toast.error('🔒 Secure sharing requires Telegram Mini App');
      return;
    }

    try {
      const success = await shareWithInlineButtons(diamond);
      
      if (success) {
        // Dispatch success event for notifications
        window.dispatchEvent(new CustomEvent('diamondShared', {
          detail: { 
            success: true, 
            message: `Diamond ${diamond.stockNumber} shared securely!` 
          }
        }));
      }
    } catch (error) {
      console.error('❌ Failed to share diamond:', error);
      
      // Dispatch failure event for notifications
      window.dispatchEvent(new CustomEvent('diamondShared', {
        detail: { 
          success: false, 
          message: `Failed to share diamond ${diamond.stockNumber}` 
        }
      }));
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
      <TableCell>{diamond.shape}</TableCell>
      <TableCell>{diamond.carat}</TableCell>
      <TableCell>
        <Badge variant="outline">{diamond.color}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{diamond.clarity}</Badge>
      </TableCell>
      <TableCell>{diamond.cut}</TableCell>
      <TableCell className="text-right">
        ${diamond.price?.toLocaleString() || 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
          {diamond.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(diamond)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSecureShare}
            disabled={!sharingAvailable}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(diamond)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
