import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">תמונה</TableHead>
              <TableHead>מלאי #</TableHead>
              <TableHead>צורה</TableHead>
              <TableHead>משקל</TableHead>
              <TableHead>צבע</TableHead>
              <TableHead>ניקיון</TableHead>
              <TableHead>חיתוך</TableHead>
              <TableHead>מחיר</TableHead>
              <TableHead>סך הכל</TableHead>
              <TableHead>סטטוס</TableHead>
              <TableHead>חנות</TableHead>
              <TableHead className="w-32">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diamonds.map((diamond) => (
              <TableRow key={diamond.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <OptimizedDiamondImage
                      imageUrl={diamond.imageUrl || diamond.picture}
                      gem360Url={diamond.gem360Url}
                      stockNumber={diamond.stockNumber}
                      shape={diamond.shape}
                      className="w-full h-full"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{diamond.stockNumber}</TableCell>
                <TableCell>
                  <Badge variant="outline">{diamond.shape}</Badge>
                </TableCell>
                <TableCell>{diamond.carat?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    {diamond.color}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {diamond.clarity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {diamond.cut || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  ${diamond.price?.toLocaleString() || '0'}
                </TableCell>
                <TableCell className="font-semibold">
                  ${(diamond.price || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={diamond.status === 'Available' ? 'default' : 'secondary'}
                    className={diamond.status === 'Available' ? 'bg-green-600' : ''}
                  >
                    {diamond.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStoreToggle(diamond.stockNumber, !diamond.store_visible)}
                  >
                    {diamond.store_visible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(diamond)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(diamond.diamondId || diamond.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {diamond.certificateUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={diamond.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}