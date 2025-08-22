
import React from 'react';
import { Diamond } from '@/types/diamond';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';

interface InventoryMobileCardProps {
  diamond: Diamond;
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamond: Diamond) => void;
  onToggleVisibility: (diamond: Diamond) => void;
  onViewDetails: (diamond: Diamond) => void;
}

export function InventoryMobileCard({
  diamond,
  onEdit,
  onDelete,
  onToggleVisibility,
  onViewDetails,
}: InventoryMobileCardProps) {
  const handleAddToWishlist = () => {
    // For mobile, just show details
    onViewDetails(diamond);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">
              {diamond.shape} {diamond.carat}ct
            </h3>
            <p className="text-sm text-muted-foreground">
              {diamond.color} {diamond.clarity}
            </p>
            {diamond.stockNumber && (
              <p className="text-xs text-muted-foreground">
                Stock: {diamond.stockNumber}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            {diamond.price && (
              <p className="font-bold text-lg">
                ${diamond.price.toLocaleString()}
              </p>
            )}
            <Badge variant={diamond.store_visible ? "default" : "secondary"}>
              {diamond.store_visible ? "Visible" : "Hidden"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {diamond.cut && (
            <div>
              <span className="text-muted-foreground">Cut:</span> {diamond.cut}
            </div>
          )}
          {diamond.polish && (
            <div>
              <span className="text-muted-foreground">Polish:</span> {diamond.polish}
            </div>
          )}
          {diamond.symmetry && (
            <div>
              <span className="text-muted-foreground">Symmetry:</span> {diamond.symmetry}
            </div>
          )}
          {diamond.fluorescence && (
            <div>
              <span className="text-muted-foreground">Fluor:</span> {diamond.fluorescence}
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(diamond)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleVisibility(diamond)}
            className="flex items-center gap-1"
          >
            {diamond.store_visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {diamond.store_visible ? 'Hide' : 'Show'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(diamond)}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Details
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(diamond)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
