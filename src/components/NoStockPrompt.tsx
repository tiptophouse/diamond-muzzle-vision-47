import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Upload, Zap } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface NoStockPromptProps {
  onUploadClick?: () => void;
}

export function NoStockPrompt({ onUploadClick }: NoStockPromptProps) {
  const { webApp, hapticFeedback } = useTelegramWebApp();

  const handleSFTPRequest = () => {
    hapticFeedback.impact('medium');
    
    // Send command to bot
    if (webApp) {
      webApp.sendData(JSON.stringify({ command: '/provide_sftp' }));
    }
    
    // Also send via Telegram bot direct message
    const botUsername = 'Brilliantteatbot'; // Your bot username
    const message = '/provide_sftp';
    
    // Open bot with pre-filled message
    webApp?.openTelegramLink(`https://t.me/${botUsername}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-dashed border-muted">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">אין מלאי זמין</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            כדי להתחיל להשתמש במערכת, עליך להעלות את מלאי היהלומים שלך
          </p>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handleSFTPRequest}
              className="w-full gap-2"
              size="lg"
              variant="default"
            >
              <Zap className="h-5 w-5" />
              בקש גישת SFTP
            </Button>

            {onUploadClick && (
              <Button
                onClick={onUploadClick}
                className="w-full gap-2"
                size="lg"
                variant="outline"
              >
                <Upload className="h-5 w-5" />
                העלה יהלום ידנית
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>טיפ:</strong> SFTP מאפשר סנכרון אוטומטי של כל המלאי שלך
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}