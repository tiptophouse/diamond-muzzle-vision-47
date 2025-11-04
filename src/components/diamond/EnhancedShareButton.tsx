import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Share2, Send, Users, TestTube, Image, MessageSquare } from 'lucide-react';
import { useEnhancedDiamondSharing, DiamondShareData } from '@/hooks/useEnhancedDiamondSharing';
import { formatPrice } from '@/utils/numberUtils';

interface EnhancedShareButtonProps {
  diamond: DiamondShareData;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function EnhancedShareButton({ diamond, className, variant = 'default' }: EnhancedShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [includeImage, setIncludeImage] = useState(true);
  const [testMode, setTestMode] = useState(false);
  
  const { shareMessage, quickShareToGroup, isSharing } = useEnhancedDiamondSharing();

  const handleShare = async (type: 'individual' | 'group') => {
    if (type === 'individual' && !targetId.trim()) return;
    
    const options = {
      diamond,
      targetId: type === 'individual' ? parseInt(targetId) : undefined,
      message: customMessage.trim() || undefined,
      includeImage,
      testMode: type === 'group' ? testMode : false
    };

    const result = await shareMessage(options);
    if (result.success) {
      setIsOpen(false);
      setTargetId('');
      setCustomMessage('');
    }
  };

  const handleQuickGroupShare = async () => {
    await quickShareToGroup(diamond, false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} className={className} disabled={isSharing}>
            <Share2 className="h-4 w-4 mr-2" />
            שתף יהלום
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>שתף יהלום עם מטא-דאטה מלא</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Diamond Preview */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{diamond.stockNumber}</Badge>
                {diamond.imageUrl && includeImage && (
                  <Badge variant="secondary">
                    <Image className="h-3 w-3 mr-1" />
                    תמונה
                  </Badge>
                )}
              </div>
              <p className="text-sm">
                {diamond.carat}ct {diamond.shape} {diamond.color}/{diamond.clarity}
              </p>
              <p className="text-xs text-muted-foreground">
                {diamond.price ? formatPrice(diamond.price) : 'צור קשר למחיר'}
              </p>
            </div>

            {/* Share Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-image"
                  checked={includeImage}
                  onCheckedChange={setIncludeImage}
                />
                <Label htmlFor="include-image" className="text-sm">
                  כלול תמונה (אם זמינה)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-message">הודעה מותאמת (אופציונלי)</Label>
                <Textarea
                  id="custom-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="הוסף הודעה אישית..."
                  rows={3}
                />
              </div>
            </div>

            {/* Individual Share */}
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Label className="text-sm font-medium">שלח ללקוח ספציפי</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-id">Telegram ID של הלקוח</Label>
                <Input
                  id="target-id"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="לדוגמה: 123456789"
                  type="number"
                />
              </div>
              <Button 
                onClick={() => handleShare('individual')}
                disabled={!targetId.trim() || isSharing}
                className="w-full"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                שלח ללקוח
              </Button>
            </div>

            {/* Group Share */}
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label className="text-sm font-medium">שתף לקבוצה</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="test-mode"
                    checked={testMode}
                    onCheckedChange={setTestMode}
                  />
                  <Label htmlFor="test-mode" className="text-xs">
                    מצב בדיקה
                  </Label>
                  {testMode && <TestTube className="h-3 w-3 text-orange-500" />}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {testMode ? 'יישלח אליך בפרטי לבדיקה' : 'יישלח לקבוצת ה-B2B'}
              </p>
              
              <Button 
                onClick={() => handleShare('group')}
                disabled={isSharing}
                className="w-full"
                size="sm"
                variant="secondary"
              >
                <Users className="h-4 w-4 mr-2" />
                שתף לקבוצה
              </Button>
            </div>

            {/* Quick Share */}
            <div className="pt-3 border-t">
              <Button 
                onClick={handleQuickGroupShare}
                disabled={isSharing}
                className="w-full"
                size="sm"
                variant="outline"
              >
                <Share2 className="h-4 w-4 mr-2" />
                שיתוף מהיר לקבוצה
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}