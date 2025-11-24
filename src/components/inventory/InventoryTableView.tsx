import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Eye, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { OptimizedDiamondImage } from '@/components/store/OptimizedDiamondImage';

interface InventoryTableViewProps {
  diamonds: Diamond[];
  onEdit: (diamond: Diamond) => void;
  onDelete: (diamondId: string) => void;
  onStoreToggle: (stockNumber: string, isVisible: boolean) => void;
}

export function InventoryTableView({
  diamonds,
  onEdit,
  onDelete,
  onStoreToggle
}: InventoryTableViewProps) {
  if (diamonds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No diamonds found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {diamonds.map((diamond) => (
        <Card key={diamond.id} className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted">
              <OptimizedDiamondImage
                imageUrl={diamond.picture}
                gem360Url={diamond.gem360Url}
                stockNumber={diamond.stockNumber}
                shape={diamond.shape}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="font-semibold text-base mb-1">
                    #{diamond.stockNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{diamond.shape}</span>
                    <span className="text-sm text-muted-foreground">
                      {diamond.carat?.toFixed(2) || 'N/A'}ct
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-base mb-1">
                    ${diamond.price?.toLocaleString() || '0'}
                  </div>
                  <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
                    {diamond.status}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {diamond.color}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {diamond.clarity}
                </Badge>
                {diamond.cut && (
                  <Badge variant="outline" className="text-xs">
                    {diamond.cut}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => onStoreToggle(diamond.stockNumber, !diamond.store_visible)}
                >
                  <Eye className={`h-4 w-4 mr-1 ${diamond.store_visible ? 'text-primary' : ''}`} />
                  <span className="text-xs">Store</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  onClick={() => onEdit(diamond)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-destructive"
                  onClick={() => onDelete(diamond.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="text-xs">Delete</span>
                </Button>
                {diamond.certificateUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9"
                    asChild
                  >
                    <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}