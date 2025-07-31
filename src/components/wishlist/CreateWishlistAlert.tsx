import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { X } from 'lucide-react';

interface CreateWishlistAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WishlistAlertCriteria {
  shape?: string;
  min_carat?: number;
  max_carat?: number;
  colors: string[];
  clarities: string[];
  cuts: string[];
  polish: string[];
  symmetry: string[];
  max_price_per_carat?: number;
}

export function CreateWishlistAlert({ isOpen, onClose, onSuccess }: CreateWishlistAlertProps) {
  const { user } = useTelegramAuth();
  const { impactOccurred } = useTelegramHapticFeedback();
  
  const [criteria, setCriteria] = useState<WishlistAlertCriteria>({
    colors: [],
    clarities: [],
    cuts: [],
    polish: [],
    symmetry: []
  });

  const [alertName, setAlertName] = useState('');

  const shapes = ['Round', 'Princess', 'Emerald', 'Asscher', 'Cushion', 'Marquise', 'Radiant', 'Oval', 'Pear', 'Heart'];
  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
  const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const polishOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const symmetryOptions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

  const handleArrayChange = (field: keyof Pick<WishlistAlertCriteria, 'colors' | 'clarities' | 'cuts' | 'polish' | 'symmetry'>, value: string, checked: boolean) => {
    setCriteria(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id || !alertName.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא מלא שם להתראה",
        variant: "destructive",
      });
      return;
    }

    try {
      impactOccurred('light');

      // TODO: Create wishlist_alerts table
      // const { error } = await supabase
      //   .from('wishlist_alerts')
      //   .insert({
      //     telegram_id: user.id,
      //     shape: criteria.shape,
      //     min_carat: criteria.min_carat,
      //     max_carat: criteria.max_carat,
      //     colors: criteria.colors,
      //     clarities: criteria.clarities,
      //     cuts: criteria.cuts,
      //     polish: criteria.polish,
      //     symmetry: criteria.symmetry,
      //     max_price_per_carat: criteria.max_price_per_carat,
      //     alert_name: alertName
      //   });

      // if (error) throw error;

      toast({
        title: "הצלחה!",
        description: "התראת המחיר נוצרה בהצלחה",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating wishlist alert:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה ביצירת התראה",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>צור התראת מחיר מותאמת אישית</CardTitle>
            <CardDescription>קבל הודעות כשיהלומים העונים על הקריטריונים שלך יהיו זמינים</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="alert-name">שם ההתראה</Label>
            <Input
              id="alert-name"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="למשל: יהלומים עגולים איכותיים"
            />
          </div>

          {/* Shape Selection */}
          <div>
            <Label>צורה</Label>
            <Select onValueChange={(value) => setCriteria(prev => ({ ...prev, shape: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="בחר צורה (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {shapes.map((shape) => (
                  <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Carat Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-carat">קראט מינימום</Label>
              <Input
                id="min-carat"
                type="number"
                step="0.01"
                onChange={(e) => setCriteria(prev => ({ ...prev, min_carat: parseFloat(e.target.value) || undefined }))}
                placeholder="0.5"
              />
            </div>
            <div>
              <Label htmlFor="max-carat">קראט מקסימום</Label>
              <Input
                id="max-carat"
                type="number"
                step="0.01"
                onChange={(e) => setCriteria(prev => ({ ...prev, max_carat: parseFloat(e.target.value) || undefined }))}
                placeholder="3.0"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label>צבעים</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={criteria.colors.includes(color)}
                    onCheckedChange={(checked) => handleArrayChange('colors', color, checked as boolean)}
                  />
                  <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Clarities */}
          <div>
            <Label>בהירות</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {clarities.map((clarity) => (
                <div key={clarity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`clarity-${clarity}`}
                    checked={criteria.clarities.includes(clarity)}
                    onCheckedChange={(checked) => handleArrayChange('clarities', clarity, checked as boolean)}
                  />
                  <Label htmlFor={`clarity-${clarity}`} className="text-sm">{clarity}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cuts */}
          <div>
            <Label>חיתוך</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {cuts.map((cut) => (
                <div key={cut} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cut-${cut}`}
                    checked={criteria.cuts.includes(cut)}
                    onCheckedChange={(checked) => handleArrayChange('cuts', cut, checked as boolean)}
                  />
                  <Label htmlFor={`cut-${cut}`} className="text-sm">{cut}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div>
            <Label htmlFor="max-price">מחיר מקסימום לקראט ($)</Label>
            <Input
              id="max-price"
              type="number"
              onChange={(e) => setCriteria(prev => ({ ...prev, max_price_per_carat: parseFloat(e.target.value) || undefined }))}
              placeholder="5000"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1">
              צור התראה
            </Button>
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
