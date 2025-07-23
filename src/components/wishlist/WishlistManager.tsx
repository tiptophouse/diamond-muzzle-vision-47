import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWishlist, WishlistCriteria } from '@/hooks/useWishlist';
import { Heart, Plus, Trash2, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shapes, colors, clarities, cuts } from '@/components/inventory/form/diamondFormConstants';

export const WishlistManager: React.FC = () => {
  const { wishlistItems, isLoading, addToWishlist, removeFromWishlist } = useWishlist();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<WishlistCriteria>({});
  const [wishTitle, setWishTitle] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await addToWishlist(formData, wishTitle || undefined);
    if (success) {
      setShowAddForm(false);
      setFormData({});
      setWishTitle('');
    }
  };

  const formatCriteria = (data: any) => {
    const criteria = [];
    if (data.shape) criteria.push(`צורה: ${data.shape}`);
    if (data.color) criteria.push(`צבע: ${data.color}`);
    if (data.clarity) criteria.push(`ניקיון: ${data.clarity}`);
    if (data.weight_min || data.weight_max) {
      criteria.push(`משקל: ${data.weight_min || '0'}-${data.weight_max || '∞'} קראט`);
    }
    if (data.price_min || data.price_max) {
      criteria.push(`מחיר: $${data.price_min || '0'}-${data.price_max || '∞'}`);
    }
    if (data.cut) criteria.push(`חיתוך: ${data.cut}`);
    
    return criteria.length > 0 ? criteria.join(' • ') : 'כל הקריטריונים';
  };

  const openChatWithOwner = (ownerTelegramId: number) => {
    // Navigate to chat page with the owner
    navigate(`/chat?contact=${ownerTelegramId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">טוען רשימת משאלות...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">רשימת המשאלות שלי</h2>
        </div>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              הוסף משאלה
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>הוסף משאלה חדשה</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">כותרת המשאלה (אופציונלי)</Label>
                <Input
                  id="title"
                  value={wishTitle}
                  onChange={(e) => setWishTitle(e.target.value)}
                  placeholder="למשל: יהלום לטבעת אירוסין"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>צורה</Label>
                  <Select
                    value={formData.shape || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="כל הצורות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל הצורות</SelectItem>
                      {shapes.map(shape => (
                        <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>צבע</Label>
                  <Select
                    value={formData.color || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="כל הצבעים" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל הצבעים</SelectItem>
                      {colors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>ניקיון</Label>
                  <Select
                    value={formData.clarity || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clarity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="כל רמות הניקיון" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל רמות הניקיון</SelectItem>
                      {clarities.map(clarity => (
                        <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>חיתוך</Label>
                  <Select
                    value={formData.cut || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cut: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="כל סוגי החיתוך" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">כל סוגי החיתוך</SelectItem>
                      {cuts.map(cut => (
                        <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>משקל מינימלי (קראט)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.weight_min || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_min: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>משקל מקסימלי (קראט)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.weight_max || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_max: parseFloat(e.target.value) || undefined }))}
                    placeholder="10.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>מחיר מינימלי ($)</Label>
                  <Input
                    type="number"
                    value={formData.price_min || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_min: parseInt(e.target.value) || undefined }))}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label>מחיר מקסימלי ($)</Label>
                  <Input
                    type="number"
                    value={formData.price_max || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_max: parseInt(e.target.value) || undefined }))}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  ביטול
                </Button>
                <Button type="submit">
                  הוסף משאלה
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין עדיין משאלות</h3>
            <p className="text-muted-foreground mb-4">
              הוסף משאלות לקבלת התראות כשיהלומים מתאימים זמינים במערכת
            </p>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus size={16} />
              הוסף משאלה ראשונה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold">
                        {item.diamond_stock_number.startsWith('wish_') ? 
                          'משאלה כללית' : 
                          item.diamond_stock_number
                        }
                      </h3>
                      {item.diamond_owner_telegram_id > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <MessageCircle size={12} />
                          יש התאמה!
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatCriteria(item.diamond_data)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        נוצר: {new Date(item.created_at).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.diamond_owner_telegram_id > 0 && (
                      <Button
                        size="sm"
                        onClick={() => openChatWithOwner(item.diamond_owner_telegram_id)}
                        className="gap-1"
                      >
                        <MessageCircle size={14} />
                        פתח צ'אט
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};