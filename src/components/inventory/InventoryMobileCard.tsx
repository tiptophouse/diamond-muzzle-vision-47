
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "./InventoryTable";
import { Edit, Trash2, Eye, Share2 } from "lucide-react";
import { useSecureDiamondSharing } from "@/hooks/useSecureDiamondSharing";
import { toast } from "sonner";

interface InventoryMobileCardProps {
  diamond: Diamond;
  onEdit?: (diamond: Diamond) => void;
  onDelete?: (diamond: Diamond) => void;
  onView?: (diamond: Diamond) => void;
}

export function InventoryMobileCard({ 
  diamond, 
  onEdit, 
  onDelete, 
  onView 
}: InventoryMobileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { shareWithInlineButtons, isAvailable: sharingAvailable } = useSecureDiamondSharing();

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(diamond);
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
        window.dispatchEvent(new CustomEvent('diamondShared', {
          detail: { 
            success: true, 
            message: `Diamond ${diamond.stockNumber} shared securely!` 
          }
        }));
      }
    } catch (error) {
      console.error('❌ Failed to share diamond:', error);
      
      window.dispatchEvent(new CustomEvent('diamondShared', {
        detail: { 
          success: false, 
          message: `Failed to share diamond ${diamond.stockNumber}` 
        }
      }));
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium text-lg">#{diamond.stockNumber}</div>
          <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
            {diamond.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Shape:</span>
            <div className="font-medium">{diamond.shape}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Carat:</span>
            <div className="font-medium">{diamond.carat}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Color:</span>
            <div><Badge variant="outline">{diamond.color}</Badge></div>
          </div>
          <div>
            <span className="text-muted-foreground">Clarity:</span>
            <div><Badge variant="outline">{diamond.clarity}</Badge></div>
          </div>
          <div>
            <span className="text-muted-foreground">Cut:</span>
            <div className="font-medium">{diamond.cut}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Price:</span>
            <div className="font-medium">${diamond.price?.toLocaleString() || 'N/A'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
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
      </CardContent>
    </Card>
  );
}
