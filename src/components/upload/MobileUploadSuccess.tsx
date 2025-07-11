import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Plus, Store, Sparkles } from "lucide-react";
import { getTelegramWebApp } from '@/utils/telegramWebApp';

interface MobileUploadSuccessProps {
  onContinue: () => void;
  onViewStore: () => void;
}

export function MobileUploadSuccess({ onContinue, onViewStore }: MobileUploadSuccessProps) {
  
  // Haptic feedback on success
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-success/20 shadow-xl">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-success/10 rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-success/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-bounce" />
            <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-secondary animate-bounce delay-200" />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Diamond Added!</h2>
            <p className="text-muted-foreground">
              Your diamond has been successfully added to your inventory and is now visible in your store.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">✨</div>
              <div className="text-xs text-muted-foreground">Ready to Share</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">✓</div>
              <div className="text-xs text-muted-foreground">Inventory Updated</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onViewStore}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              <Store className="h-5 w-5 mr-2" />
              View in Store
            </Button>

            <Button
              onClick={onContinue}
              variant="outline"
              className="w-full h-12 text-lg font-medium"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Another Diamond
            </Button>
          </div>

          {/* Encouragement */}
          <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded-lg">
            🎉 Great job! Your diamond is now part of your digital inventory.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}