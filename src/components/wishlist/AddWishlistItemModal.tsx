
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddWishlistItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const SHAPES = ['Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 'Oval', 'Radiant', 'Pear', 'Heart', 'Cushion'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
const CUTS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const FLUORESCENCES = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];

export function AddWishlistItemModal({ open, onOpenChange, onSuccess }: AddWishlistItemModalProps) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    shape: '',
    caratMin: '',
    caratMax: '',
    color: '',
    clarity: '',
    cut: '',
    fluorescence: '',
    priceMin: '',
    priceMax: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Saving custom wishlist preference...');
      
      // Save the wishlist preference with custom data
      const { error } = await supabase.from('wishlist').insert({
        visitor_telegram_id: user.id,
        diamond_owner_telegram_id: 0, // 0 indicates custom preference
        diamond_stock_number: `CUSTOM-${Date.now()}`,
        diamond_data: {
          stockNumber: `CUSTOM-${Date.now()}`,
          shape: formData.shape,
          carat: parseFloat(formData.caratMin) || 0,
          color: formData.color,
          clarity: formData.clarity,
          cut: formData.cut,
          fluorescence: formData.fluorescence,
          price: parseFloat(formData.priceMin) || 0,
          imageUrl: '',
          certificateUrl: '',
          lab: '',
          // Custom preference specific fields
          caratMin: formData.caratMin,
          caratMax: formData.caratMax,
          priceMin: formData.priceMin,
          priceMax: formData.priceMax,
          notes: formData.notes,
          isCustomPreference: true
        },
      });

      if (error) {
        console.error('❌ Error saving wishlist preference:', error);
        toast({
          title: "❌ Save Failed",
          description: "Failed to save your diamond preference. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Wishlist preference saved successfully');
      
      toast({
        title: "✅ Preference Saved",
        description: "Your diamond preference has been saved! You'll be notified when matching diamonds are uploaded.",
      });
      
      // Reset form
      setFormData({
        shape: '',
        caratMin: '',
        caratMax: '',
        color: '',
        clarity: '',
        cut: '',
        fluorescence: '',
        priceMin: '',
        priceMax: '',
        notes: ''
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Custom Diamond Preference to Wishlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shape">Shape *</Label>
              <Select value={formData.shape} onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {SHAPES.map(shape => (
                    <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="caratMin">Min Carat</Label>
                <Input
                  id="caratMin"
                  type="number"
                  step="0.01"
                  value={formData.caratMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, caratMin: e.target.value }))}
                  placeholder="0.50"
                />
              </div>
              <div>
                <Label htmlFor="caratMax">Max Carat</Label>
                <Input
                  id="caratMax"
                  type="number"
                  step="0.01"
                  value={formData.caratMax}
                  onChange={(e) => setFormData(prev => ({ ...prev, caratMax: e.target.value }))}
                  placeholder="2.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clarity">Clarity</Label>
              <Select value={formData.clarity} onValueChange={(value) => setFormData(prev => ({ ...prev, clarity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clarity" />
                </SelectTrigger>
                <SelectContent>
                  {CLARITIES.map(clarity => (
                    <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cut">Cut</Label>
              <Select value={formData.cut} onValueChange={(value) => setFormData(prev => ({ ...prev, cut: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cut" />
                </SelectTrigger>
                <SelectContent>
                  {CUTS.map(cut => (
                    <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fluorescence">Fluorescence</Label>
              <Select value={formData.fluorescence} onValueChange={(value) => setFormData(prev => ({ ...prev, fluorescence: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fluorescence" />
                </SelectTrigger>
                <SelectContent>
                  {FLUORESCENCES.map(fluor => (
                    <SelectItem key={fluor} value={fluor}>{fluor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="priceMin">Min Price ($)</Label>
                <Input
                  id="priceMin"
                  type="number"
                  value={formData.priceMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceMin: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="priceMax">Max Price ($)</Label>
                <Input
                  id="priceMax"
                  type="number"
                  value={formData.priceMax}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceMax: e.target.value }))}
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.shape}>
              {isLoading ? 'Saving...' : 'Add to Wishlist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
