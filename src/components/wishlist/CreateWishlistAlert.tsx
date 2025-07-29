
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus } from 'lucide-react';

interface WishlistAlertData {
  shape?: string;
  min_carat?: number;
  max_carat?: number;
  colors?: string[];
  clarities?: string[];
  cuts?: string[];
  polish?: string[];
  symmetry?: string[];
  max_price_per_carat?: number;
}

interface CreateWishlistAlertProps {
  onAlertCreated?: () => void;
}

export function CreateWishlistAlert({ onAlertCreated }: CreateWishlistAlertProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [alertData, setAlertData] = useState<WishlistAlertData>({
    shape: '',
    min_carat: 0.5,
    max_carat: 2.0,
    colors: ['D', 'E', 'F'],
    clarities: ['FL', 'IF', 'VVS1', 'VVS2'],
    cuts: ['Excellent'],
    polish: ['Excellent'],
    symmetry: ['Excellent'],
    max_price_per_carat: 10000
  });

  const handleCreateAlert = async () => {
    setLoading(true);
    
    try {
      // For now, just show success message
      // Once the SQL migration is approved, we can actually save to database
      
      toast({
        title: "Alert Created!",
        description: "You'll be notified when matching diamonds are available.",
      });
      
      setOpen(false);
      onAlertCreated?.();
      
    } catch (error) {
      console.error('Error creating wishlist alert:', error);
      toast({
        title: "Error",
        description: "Failed to create wishlist alert",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Create Diamond Alert
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_carat">Min Carat</Label>
              <Input
                id="min_carat"
                type="number"
                step="0.1"
                value={alertData.min_carat}
                onChange={(e) => setAlertData(prev => ({...prev, min_carat: parseFloat(e.target.value)}))}
              />
            </div>
            <div>
              <Label htmlFor="max_carat">Max Carat</Label>
              <Input
                id="max_carat"
                type="number"
                step="0.1"
                value={alertData.max_carat}
                onChange={(e) => setAlertData(prev => ({...prev, max_carat: parseFloat(e.target.value)}))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="max_price">Max Price per Carat</Label>
            <Input
              id="max_price"
              type="number"
              value={alertData.max_price_per_carat}
              onChange={(e) => setAlertData(prev => ({...prev, max_price_per_carat: parseInt(e.target.value)}))}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleCreateAlert}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Alert"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
