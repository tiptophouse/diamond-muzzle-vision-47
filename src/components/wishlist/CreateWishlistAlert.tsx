
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Bell, Diamond } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface WishlistAlertCriteria {
  shape: string;
  minCarat: number;
  maxCarat: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  maxPricePerCarat: number;
}

export function CreateWishlistAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const { triggerHaptic } = useTelegramHapticFeedback();
  
  const [criteria, setCriteria] = useState<WishlistAlertCriteria>({
    shape: '',
    minCarat: 0,
    maxCarat: 10,
    color: '',
    clarity: '',
    cut: '',
    polish: '',
    symmetry: '',
    maxPricePerCarat: 0
  });

  const shapes = ['Round', 'Princess', 'Emerald', 'Asscher', 'Oval', 'Radiant', 'Cushion', 'Marquise', 'Heart', 'Pear'];
  const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2'];
  const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const polish = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
  const symmetry = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

  const handleCreateAlert = async () => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר כדי ליצור התראה",
        variant: "destructive"
      });
      return;
    }

    if (!criteria.shape || !criteria.maxPricePerCarat) {
      toast({
        title: "שגיאה",
        description: "יש למלא לפחות צורה ומחיר מקסימלי",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    triggerHaptic('light');

    try {
      // Store the alert criteria in the wishlist table as a special entry
      const { error } = await supabase
        .from('wishlist')
        .insert({
          visitor_telegram_id: user.id,
          diamond_owner_telegram_id: user.id, // Self-reference for alerts
          diamond_stock_number: `ALERT_${Date.now()}`, // Unique identifier for alerts
          diamond_data: {
            type: 'price_alert',
            criteria: criteria,
            created_at: new Date().toISOString(),
            alert_name: `התראת מחיר - ${criteria.shape} עד $${criteria.maxPricePerCarat}`
          }
        });

      if (error) throw error;

      toast({
        title: "✅ התראה נוצרה בהצלחה!",
        description: `תקבל הודעה בטלגרם כשיימצא יהלום ${criteria.shape} במחיר עד $${criteria.maxPricePerCarat} לקרט`,
        duration: 5000
      });

      // Reset form
      setCriteria({
        shape: '',
        minCarat: 0,
        maxCarat: 10,
        color: '',
        clarity: '',
        cut: '',
        polish: '',
        symmetry: '',
        maxPricePerCarat: 0
      });
      
      setIsOpen(false);
      triggerHaptic('success');

    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את ההתראה",
        variant: "destructive"
      });
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        size="lg"
      >
        <Bell className="mr-2 h-5 w-5" />
        צור התראת מחיר מותאמת אישית
      </Button>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Diamond className="h-6 w-6" />
          יצירת התראת מחיר מותאמת אישית
        </CardTitle>
        <CardDescription>
          הגדר קריטריונים ליהלומים שאתה מחפש - תקבל הודעה בטלגרם כשיימצא יהלום המתאים
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shape */}
          <div>
            <Label htmlFor="shape">צורה *</Label>
            <Select value={criteria.shape} onValueChange={(value) => setCriteria({...criteria, shape: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר צורה" />
              </SelectTrigger>
              <SelectContent>
                {shapes.map(shape => (
                  <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Price Per Carat */}
          <div>
            <Label htmlFor="maxPrice">מחיר מקסימלי לקרט ($) *</Label>
            <Input
              id="maxPrice"
              type="number"
              value={criteria.maxPricePerCarat || ''}
              onChange={(e) => setCriteria({...criteria, maxPricePerCarat: parseInt(e.target.value) || 0})}
              placeholder="לדוגמה: 5000"
            />
          </div>

          {/* Carat Range */}
          <div>
            <Label htmlFor="minCarat">קרט מינימלי</Label>
            <Input
              id="minCarat"
              type="number"
              step="0.01"
              value={criteria.minCarat || ''}
              onChange={(e) => setCriteria({...criteria, minCarat: parseFloat(e.target.value) || 0})}
              placeholder="0.50"
            />
          </div>

          <div>
            <Label htmlFor="maxCarat">קרט מקסימלי</Label>
            <Input
              id="maxCarat"
              type="number"
              step="0.01"
              value={criteria.maxCarat || ''}
              onChange={(e) => setCriteria({...criteria, maxCarat: parseFloat(e.target.value) || 10})}
              placeholder="2.00"
            />
          </div>

          {/* Color */}
          <div>
            <Label htmlFor="color">צבע</Label>
            <Select value={criteria.color} onValueChange={(value) => setCriteria({...criteria, color: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר צבע (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {colors.map(color => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clarity */}
          <div>
            <Label htmlFor="clarity">בהירות</Label>
            <Select value={criteria.clarity} onValueChange={(value) => setCriteria({...criteria, clarity: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר בהירות (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {clarities.map(clarity => (
                  <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cut */}
          <div>
            <Label htmlFor="cut">חיתוך</Label>
            <Select value={criteria.cut} onValueChange={(value) => setCriteria({...criteria, cut: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר חיתוך (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {cuts.map(cut => (
                  <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Polish */}
          <div>
            <Label htmlFor="polish">ליטוש</Label>
            <Select value={criteria.polish} onValueChange={(value) => setCriteria({...criteria, polish: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר ליטוש (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {polish.map(pol => (
                  <SelectItem key={pol} value={pol}>{pol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Symmetry */}
          <div>
            <Label htmlFor="symmetry">סימטריה</Label>
            <Select value={criteria.symmetry} onValueChange={(value) => setCriteria({...criteria, symmetry: value})}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סימטריה (אופציונלי)" />
              </SelectTrigger>
              <SelectContent>
                {symmetry.map(sym => (
                  <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCreateAlert} disabled={isLoading} className="flex-1">
            {isLoading ? 'יוצר התראה...' : 'צור התראה'}
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            בטל
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
