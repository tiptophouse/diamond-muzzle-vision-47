import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { useState } from "react";

interface TrialBannerProps {
  daysRemaining: number;
  onSubscribe?: () => void;
}

export function TrialBanner({ daysRemaining, onSubscribe }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleSubscribe = () => {
    // Open Telegram bot with /start command
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot';
    const telegramUrl = `https://t.me/${botUsername}?start=subscribe`;
    
    window.open(telegramUrl, '_blank');
    onSubscribe?.();
  };

  return (
    <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
        <div className="flex-1">
          <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
            <span className="font-semibold">Trial expires in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}!</span>
            {' '}Subscribe now to continue using all features.
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button 
              onClick={handleSubscribe}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Subscribe Now
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
              Remind me later
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}
