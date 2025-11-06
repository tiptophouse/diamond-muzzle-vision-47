import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface CampaignCardProps {
  title: {
    he: string;
    en: string;
  };
  description: {
    he: string;
    en: string;
  };
  buttons: Array<{
    label: {
      he: string;
      en: string;
    };
    action: string; // e.g., "upload", "tutorial", "matches"
    variant?: 'default' | 'outline' | 'secondary';
  }>;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  language?: 'he' | 'en';
}

export const CampaignCard = memo(function CampaignCard({
  title,
  description,
  buttons,
  icon,
  onDismiss,
  language = 'he'
}: CampaignCardProps) {
  const handleButtonClick = (action: string) => {
    // CRITICAL: Use Telegram deep-link routing, NOT internal routing
    const deepLink = `https://t.me/diamondmazalbot/?startapp=${action}`;
    
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp as any;
      if (webApp.openTelegramLink) {
        webApp.openTelegramLink(deepLink);
      } else if (webApp.openLink) {
        webApp.openLink(deepLink);
      } else {
        window.open(deepLink, '_blank');
      }
    } else {
      // Fallback for non-Telegram environments
      console.warn('Telegram WebApp not available, opening in new tab');
      window.open(deepLink, '_blank');
    }
  };

  return (
    <Card className="relative border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 z-10 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {title[language]}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {description[language]}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => handleButtonClick(button.action)}
              variant={button.variant || 'default'}
              className="w-full"
              size="sm"
            >
              {button.label[language]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
