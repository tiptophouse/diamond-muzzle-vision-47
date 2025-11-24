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
        <Card key={diamond.id} className="p-3 hover:shadow-md transition-shadow">
          <div className="flex gap-3">
            {/* Image */}
            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
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
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">
                    #{diamond.stockNumber}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {diamond.shape}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {diamond.carat?.toFixed(2) || 'N/A'}ct
                    </span>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm">
                    ${diamond.price?.toLocaleString() || '0'}
                  </div>
                  <Badge 
                    variant={diamond.status === 'Available' ? 'default' : 'secondary'}
                    className={`text-xs mt-1 ${diamond.status === 'Available' ? 'bg-green-600' : ''}`}
                  >
                    {diamond.status}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-yellow-100 text-yellow-800">
                  {diamond.color}
                </Badge>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-blue-100 text-blue-800">
                  {diamond.clarity}
                </Badge>
                {diamond.cut && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-green-100 text-green-800">
                    {diamond.cut}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onStoreToggle(diamond.stockNumber, !diamond.store_visible)}
                >
                  {diamond.store_visible ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-xs ml-1">Store</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onEdit(diamond)}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="text-xs ml-1">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  onClick={() => onDelete(diamond.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-xs ml-1">Delete</span>
                </Button>
                {diamond.certificateUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
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