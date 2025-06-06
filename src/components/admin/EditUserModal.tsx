
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit } from 'lucide-react';

interface EditUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone_number: '',
    language_code: '',
    is_premium: false,
    photo_url: '',
    status: 'active',
    subscription_plan: 'free',
    payment_status: 'none',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        phone_number: user.phone_number || '',
        language_code: user.language_code || '',
        is_premium: user.is_premium || false,
        photo_url: user.photo_url || '',
        status: user.status || 'active',
        subscription_plan: user.subscription_plan || 'free',
        payment_status: user.payment_status || 'none',
        notes: user.notes || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
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
          notes: formData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', user.telegram_id);

      if (profileError) throw profileError;

      // Update user analytics subscription status
      const { error: analyticsError } = await supabase
        .from('user_analytics')
        .update({
          subscription_status: formData.subscription_plan
        })
        .eq('telegram_id', user.telegram_id);

      if (analyticsError) console.warn('Failed to update analytics:', analyticsError);

      // Log admin action
      const { error: logError } = await supabase
        .from('user_management_log')
        .insert({
          admin_telegram_id: 2138564172,
          action_type: 'updated',
          target_user_id: user.id,
          target_telegram_id: user.telegram_id,
          changes: formData,
          reason: 'User updated via admin panel'
        });

      if (logError) console.warn('Failed to log admin action:', logError);

      toast({
        title: "User Updated",
        description: `Successfully updated ${formData.first_name} ${formData.last_name}`,
      });

      onClose();
      window.location.reload(); // Refresh to show updated user
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
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
            <Edit className="h-5 w-5" />
            Edit User: {user?.first_name} {user?.last_name}
          </DialogTitle>
          <DialogDescription>
            Update user information and settings. Changes will be logged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language_code">Language Code</Label>
              <Input
                id="language_code"
                value={formData.language_code}
                onChange={(e) => handleInputChange('language_code', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
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

          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-sm text-gray-600">
              <strong>Telegram ID:</strong> {user?.telegram_id} (Cannot be changed)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
