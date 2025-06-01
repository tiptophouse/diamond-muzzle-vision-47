
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    telegram_id: '',
    first_name: '',
    last_name: '',
    username: '',
    phone_number: '',
    language_code: 'en',
    is_premium: false,
    photo_url: '',
    status: 'active',
    subscription_plan: 'free',
    payment_status: 'none',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.telegram_id || !formData.first_name) {
        throw new Error('Telegram ID and First Name are required');
      }

      const telegramId = parseInt(formData.telegram_id);
      if (isNaN(telegramId)) {
        throw new Error('Telegram ID must be a valid number');
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('telegram_id')
        .eq('telegram_id', telegramId)
        .single();

      if (existingUser) {
        throw new Error('User with this Telegram ID already exists');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          telegram_id: telegramId,
          first_name: formData.first_name,
          last_name: formData.last_name || null,
          username: formData.username || null,
          phone_number: formData.phone_number || null,
          language_code: formData.language_code,
          is_premium: formData.is_premium,
          photo_url: formData.photo_url || null,
          status: formData.status,
          subscription_plan: formData.subscription_plan,
          payment_status: formData.payment_status,
          notes: formData.notes || null
        });

      if (profileError) throw profileError;

      // Create user analytics entry
      const { error: analyticsError } = await supabase
        .from('user_analytics')
        .insert({
          telegram_id: telegramId,
          total_visits: 0,
          api_calls_count: 0,
          storage_used_mb: 0,
          cost_per_user: 0,
          revenue_per_user: 0,
          profit_loss: 0,
          lifetime_value: 0,
          subscription_status: formData.subscription_plan
        });

      if (analyticsError) throw analyticsError;

      // Log admin action
      const { error: logError } = await supabase
        .from('user_management_log')
        .insert({
          admin_telegram_id: 2138564172,
          action_type: 'created',
          target_telegram_id: telegramId,
          changes: formData,
          reason: 'User created via admin panel'
        });

      if (logError) console.warn('Failed to log admin action:', logError);

      toast({
        title: "User Created",
        description: `Successfully created user ${formData.first_name} ${formData.last_name}`,
      });

      onClose();
      window.location.reload(); // Refresh to show new user
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account manually. Fill in the required information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telegram_id">Telegram ID *</Label>
              <Input
                id="telegram_id"
                type="number"
                value={formData.telegram_id}
                onChange={(e) => handleInputChange('telegram_id', e.target.value)}
                placeholder="e.g., 123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="John"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language_code">Language Code</Label>
              <Input
                id="language_code"
                value={formData.language_code}
                onChange={(e) => handleInputChange('language_code', e.target.value)}
                placeholder="en"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_plan">Subscription Plan</Label>
              <select
                id="subscription_plan"
                value={formData.subscription_plan}
                onChange={(e) => handleInputChange('subscription_plan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <select
                id="payment_status"
                value={formData.payment_status}
                onChange={(e) => handleInputChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="none">None</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">Photo URL</Label>
            <Input
              id="photo_url"
              value={formData.photo_url}
              onChange={(e) => handleInputChange('photo_url', e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_premium"
              checked={formData.is_premium}
              onCheckedChange={(checked) => handleInputChange('is_premium', checked)}
            />
            <Label htmlFor="is_premium">Premium User</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Internal notes about this user..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
