import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Eye, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatPrice } from '@/utils/numberUtils';

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {diamonds.map((diamond) => (
          <Card key={diamond.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-base">{diamond.stockNumber}</div>
                      <Badge variant="outline" className="text-xs">{diamond.shape}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatPrice(diamond.price || 0)}</div>
                      <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'} className={diamond.status === 'Available' ? 'bg-green-600 text-xs' : 'text-xs'}>
                        {diamond.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">משקל: </span>
                      <span className="font-medium">{diamond.carat?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">צבע: </span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">{diamond.color}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ניקיון: </span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">{diamond.clarity}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">חיתוך: </span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">{diamond.cut || 'N/A'}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(diamond)}
                      className="flex-1"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      ערוך
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(diamond.id)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      מחק
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStoreToggle(diamond.stockNumber, !diamond.store_visible)}
                    >
                      <Eye className={`h-4 w-4 ${diamond.store_visible ? 'text-green-600' : 'text-muted-foreground'}`} />
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
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
                      onClick={() => onDelete(diamond.id)}
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