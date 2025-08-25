import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDiamondVisibility } from "@/lib/api";
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface AdminStoreControlsProps {
  stockNumber: string;
  isVisible: boolean;
  selectedDiamonds: string[];
  setSelectedDiamonds: (diamonds: string[]) => void;
}

export function AdminStoreControls() {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedDiamonds, setSelectedDiamonds] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { webApp } = useTelegramWebApp();

  const handleVisibilityToggle = async (stockNumber: string, isVisible: boolean) => {
    setUpdatingItems(prev => new Set(prev).add(stockNumber));
    webApp?.HapticFeedback?.impactOccurred('light');

    try {
      await updateDiamondVisibility(stockNumber, isVisible);
      
      webApp?.HapticFeedback?.notificationOccurred('success');
      toast.success(
        isVisible ? 'Diamond is now visible in store' : 'Diamond hidden from store'
      );
      
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
    } catch (error) {
      console.error('Failed to update visibility:', error);
      webApp?.HapticFeedback?.notificationOccurred('error');
      toast.error('Failed to update diamond visibility');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(stockNumber);
        return newSet;
      });
    }
  };

  const handleBulkVisibilityToggle = async (visible: boolean) => {
    if (selectedDiamonds.length === 0) return;

    setBulkUpdating(true);
    webApp?.HapticFeedback?.impactOccurred('medium');

    try {
      await Promise.all(
        selectedDiamonds.map(stockNumber => 
          updateDiamondVisibility(stockNumber, visible)
        )
      );

      webApp?.HapticFeedback?.notificationOccurred('success');
      toast.success(
        `${selectedDiamonds.length} diamonds ${visible ? 'shown' : 'hidden'} in store`
      );
      
      setSelectedDiamonds([]);
      queryClient.invalidateQueries({ queryKey: ['diamonds'] });
    } catch (error) {
      console.error('Failed to bulk update visibility:', error);
      webApp?.HapticFeedback?.notificationOccurred('error');
      toast.error('Failed to update diamond visibility');
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Store Visibility</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkVisibilityToggle(true)}
            disabled={bulkUpdating || selectedDiamonds.length === 0}
          >
            Show All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkVisibilityToggle(false)}
            disabled={bulkUpdating || selectedDiamonds.length === 0}
          >
            Hide All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
