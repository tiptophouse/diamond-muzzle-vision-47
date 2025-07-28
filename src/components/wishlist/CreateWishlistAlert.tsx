
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Bell } from 'lucide-react';

interface CreateWishlistAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const shapes = ['Round', 'Princess', 'Emerald', 'Asscher', 'Oval', 'Radiant', 'Pear', 'Heart', 'Marquise', 'Cushion'];
const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2'];
const cuts = ['Excellent', 'Very Good', 'Good', 'Poor'];
const polishGrades = ['Excellent', 'Very Good', 'Good', 'Poor'];
const symmetryGrades = ['Excellent', 'Very Good', 'Good', 'Poor'];

export function CreateWishlistAlert({ isOpen, onClose, onSuccess }: CreateWishlistAlertProps) {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shape: '',
    minCarat: '',
    maxCarat: '',
    colors: [] as string[],
    clarities: [] as string[],
    cuts: [] as string[],
    polish: [] as string[],
    symmetry: [] as string[],
    maxPricePerCarat: '',
    alertName: ''
  });

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    
    try {
      const alertData = {
        visitor_telegram_id: user.id,
        alert_name: formData.alertName || `התראה מותאמת - ${new Date().toLocaleDateString('he-IL')}`,
        criteria: {
          shape: formData.shape,
          minCarat: formData.minCarat ? parseFloat(formData.minCarat) : null,
          maxCarat: formData.maxCarat ? parseFloat(formData.maxCarat) : null,
          colors: formData.colors,
          clarities: formData.clarities,
          cuts: formData.cuts,
          polish: formData.polish,
          symmetry: formData.symmetry,
          maxPricePerCarat: formData.maxPricePerCarat ? parseFloat(formData.maxPricePerCarat) : null
        },
        is_active: true
      };

      const { error } = await supabase
        .from('wishlist_alerts')
        .insert(alertData);

      if (error) throw error;

      toast({
        title: "✅ התראה נוצרה בהצלחה!",
        description: "תקבל הודעה ב-Telegram כאשר יהלום עונה על הקריטריונים שלך",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "❌ שגיאה ביצירת התראה",
        description: "לא ניתן ליצור את ההתראה כרגע. נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-blue-600" />
            צור התראת מחיר מותאמת אישית
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            הגדר קריטריונים והתראות יישלחו לך ב-Telegram כאשר יהלומים עונים על הדרישות שלך
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert Name */}
          <div>
            <Label htmlFor="alertName">שם ההתראה (אופציונלי)</Label>
            <Input
              id="alertName"
              value={formData.alertName}
              onChange={(e) => setFormData(prev => ({ ...prev, alertName: e.target.value }))}
              placeholder="למשל: יהלומים קטנים לטבעת"
            />
          </div>

          {/* Shape */}
          <div>
            <Label>צורת יהלום</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="בחר צורה (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {shapes.map(shape => (
                  <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Carat Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minCarat">מינימום קרט</Label>
              <Input
                id="minCarat"
                type="number"
                step="0.01"
                value={formData.minCarat}
                onChange={(e) => setFormData(prev => ({ ...prev, minCarat: e.target.value }))}
                placeholder="0.50"
              />
            </div>
            <div>
              <Label htmlFor="maxCarat">מקסימום קרט</Label>
              <Input
                id="maxCarat"
                type="number"
                step="0.01"
                value={formData.maxCarat}
                onChange={(e) => setFormData(prev => ({ ...prev, maxCarat: e.target.value }))}
                placeholder="2.00"
              />
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label className="text-sm font-medium">צבעים מועדפים</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colors.map(color => (
                <Button
                  key={color}
                  type="button"
                  variant={formData.colors.includes(color) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMultiSelect('colors', color)}
                  className="h-8"
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          {/* Clarities */}
          <div>
            <Label className="text-sm font-medium">רמות בהירות מועדפות</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {clarities.map(clarity => (
                <Button
                  key={clarity}
                  type="button"
                  variant={formData.clarities.includes(clarity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMultiSelect('clarities', clarity)}
                  className="h-8"
                >
                  {clarity}
                </Button>
              ))}
            </div>
          </div>

          {/* Cuts */}
          <div>
            <Label className="text-sm font-medium">איכות חיתוך</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {cuts.map(cut => (
                <Button
                  key={cut}
                  type="button"
                  variant={formData.cuts.includes(cut) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMultiSelect('cuts', cut)}
                  className="h-8"
                >
                  {cut}
                </Button>
              ))}
            </div>
          </div>

          {/* Polish */}
          <div>
            <Label className="text-sm font-medium">איכות ליטוש</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {polishGrades.map(polish => (
                <Button
                  key={polish}
                  type="button"
                  variant={formData.polish.includes(polish) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMultiSelect('polish', polish)}
                  className="h-8"
                >
                  {polish}
                </Button>
              ))}
            </div>
          </div>

          {/* Symmetry */}
          <div>
            <Label className="text-sm font-medium">סימטריה</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {symmetryGrades.map(symmetry => (
                <Button
                  key={symmetry}
                  type="button"
                  variant={formData.symmetry.includes(symmetry) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMultiSelect('symmetry', symmetry)}
                  className="h-8"
                >
                  {symmetry}
                </Button>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div>
            <Label htmlFor="maxPricePerCarat">מחיר מקסימלי לקרט ($)</Label>
            <Input
              id="maxPricePerCarat"
              type="number"
              value={formData.maxPricePerCarat}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPricePerCarat: e.target.value }))}
              placeholder="5000"
            />
            <p className="text-xs text-muted-foreground mt-1">
              תקבל התראה רק אם המחיר לקרט נמוך מהסכום הזה
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'יוצר התראה...' : 'צור התראה'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
