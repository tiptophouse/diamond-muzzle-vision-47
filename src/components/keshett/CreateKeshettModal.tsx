import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKeshettManagement, CreateKeshettData } from '@/hooks/useKeshettManagement';
import { Diamond } from '@/components/inventory/InventoryTable';
import { Handshake, Clock, DollarSign, User } from 'lucide-react';

interface CreateKeshettModalProps {
  diamond: Diamond | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateKeshettModal({ diamond, isOpen, onClose, onSuccess }: CreateKeshettModalProps) {
  const { createKeshett, isLoading } = useKeshettManagement();
  const [formData, setFormData] = useState<CreateKeshettData>({
    buyer_telegram_id: 0,
    agreed_price: diamond?.price || 0,
    expiry_hours: 24,
    terms: {},
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diamond) return;

    const success = await createKeshett(diamond, formData);
    if (success) {
      onClose();
      onSuccess?.();
      // Reset form
      setFormData({
        buyer_telegram_id: 0,
        agreed_price: diamond.price || 0,
        expiry_hours: 24,
        terms: {},
        notes: '',
      });
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      buyer_telegram_id: 0,
      agreed_price: diamond?.price || 0,
      expiry_hours: 24,
      terms: {},
      notes: '',
    });
  };

  if (!diamond) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-primary" />
            Create Keshett Agreement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Diamond Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">Diamond: #{diamond.stockNumber}</p>
            <p className="text-sm text-muted-foreground">
              {diamond.carat}ct {diamond.color} {diamond.clarity} {diamond.shape}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Buyer Telegram ID */}
            <div className="space-y-2">
              <Label htmlFor="buyer_id" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Buyer Telegram ID
              </Label>
              <Input
                id="buyer_id"
                type="number"
                value={formData.buyer_telegram_id || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  buyer_telegram_id: parseInt(e.target.value) || 0
                }))}
                placeholder="Enter buyer's Telegram ID"
                required
              />
            </div>

            {/* Agreed Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Agreed Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.agreed_price}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  agreed_price: parseFloat(e.target.value) || 0
                }))}
                required
              />
            </div>

            {/* Expiry Hours */}
            <div className="space-y-2">
              <Label htmlFor="expiry" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Agreement Duration
              </Label>
              <Select
                value={formData.expiry_hours.toString()}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  expiry_hours: parseInt(value)
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                  <SelectItem value="48">48 Hours</SelectItem>
                  <SelectItem value="72">72 Hours</SelectItem>
                  <SelectItem value="168">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                placeholder="Any special terms or conditions..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.buyer_telegram_id}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Keshett'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}