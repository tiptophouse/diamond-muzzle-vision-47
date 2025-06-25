
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
  selectedDiamonds: Diamond[];
  onSuccess: () => void;
}

interface BulkUpdateData {
  status?: string;
  priceAdjustment?: number;
  priceAdjustmentType?: 'percentage' | 'fixed';
  storeVisible?: boolean;
}

export function BulkEditModal({ open, onClose, selectedDiamonds, onSuccess }: BulkEditModalProps) {
  const { toast } = useToast();
  const { updateDiamond } = useInventoryCrud();
  const [isLoading, setIsLoading] = useState(false);
  const [bulkData, setBulkData] = useState<BulkUpdateData>({});

  const handleBulkUpdate = async () => {
    if (selectedDiamonds.length === 0) return;

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const diamond of selectedDiamonds) {
        const updateData: any = {
          stockNumber: diamond.stockNumber,
          shape: diamond.shape,
          carat: diamond.carat,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut,
          price: diamond.price,
          status: diamond.status,
          storeVisible: diamond.store_visible || false,
          certificateNumber: diamond.certificateNumber,
          certificateUrl: diamond.certificateUrl,
          lab: diamond.lab,
        };

        // Apply bulk updates
        if (bulkData.status) {
          updateData.status = bulkData.status;
        }

        if (bulkData.priceAdjustment && bulkData.priceAdjustmentType) {
          if (bulkData.priceAdjustmentType === 'percentage') {
            updateData.price = diamond.price * (1 + bulkData.priceAdjustment / 100);
          } else {
            updateData.price = diamond.price + bulkData.priceAdjustment;
          }
        }

        if (bulkData.storeVisible !== undefined) {
          updateData.storeVisible = bulkData.storeVisible;
        }

        const success = await updateDiamond(diamond.id, updateData);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Bulk Update Complete ✅",
          description: `Successfully updated ${successCount} diamonds${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Bulk Update Failed ❌",
          description: "No diamonds were updated successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bulk Update Error ❌",
        description: "An error occurred during bulk update",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = selectedDiamonds.reduce((sum, d) => sum + d.price, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Edit - {selectedDiamonds.length} Diamonds</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Diamonds:</span>
                <Badge>{selectedDiamonds.length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Value:</span>
                <Badge variant="outline">${totalValue.toLocaleString()}</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedDiamonds.slice(0, 5).map(diamond => (
                  <Badge key={diamond.id} variant="secondary" className="text-xs">
                    #{diamond.stockNumber}
                  </Badge>
                ))}
                {selectedDiamonds.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedDiamonds.length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bulk Edit Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select 
                value={bulkData.status || ""} 
                onValueChange={(value) => setBulkData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Change</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price Adjustment</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={bulkData.priceAdjustment || ''}
                  onChange={(e) => setBulkData(prev => ({ 
                    ...prev, 
                    priceAdjustment: parseFloat(e.target.value) || undefined 
                  }))}
                />
                <Select 
                  value={bulkData.priceAdjustmentType || "percentage"} 
                  onValueChange={(value: 'percentage' | 'fixed') => 
                    setBulkData(prev => ({ ...prev, priceAdjustmentType: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">$ Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {bulkData.priceAdjustmentType === 'percentage' 
                  ? 'Percentage increase/decrease (e.g., 10 for +10%, -5 for -5%)'
                  : 'Fixed amount to add/subtract (e.g., 100 for +$100, -50 for -$50)'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label>Store Visibility</Label>
              <Select 
                value={bulkData.storeVisible?.toString() || ""} 
                onValueChange={(value) => setBulkData(prev => ({ 
                  ...prev, 
                  storeVisible: value === "true" ? true : value === "false" ? false : undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Change</SelectItem>
                  <SelectItem value="true">Visible in Store</SelectItem>
                  <SelectItem value="false">Hidden from Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUpdate} 
              disabled={isLoading || Object.keys(bulkData).length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Apply Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
