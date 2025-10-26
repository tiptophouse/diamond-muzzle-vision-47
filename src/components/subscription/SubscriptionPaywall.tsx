import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, Zap } from "lucide-react";

interface SubscriptionPaywallProps {
  onStartPayment?: () => void;
}

export function SubscriptionPaywall({ onStartPayment }: SubscriptionPaywallProps) {
  const handleStartPayment = () => {
    // Open Telegram bot with /start command
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot';
    const telegramUrl = `https://t.me/${botUsername}?start=subscribe`;
    
    // Use window.open for better compatibility
    window.open(telegramUrl, '_blank');
    
    onStartPayment?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="max-w-lg w-full shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Subscription Required</CardTitle>
          <CardDescription className="text-base">
            To access BrilliantBot's features, you need an active subscription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Full Inventory Access</p>
                <p className="text-sm text-muted-foreground">Manage unlimited diamonds in your portfolio</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Advanced Features</p>
                <p className="text-sm text-muted-foreground">Analytics, reports, and sharing capabilities</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Priority Support</p>
                <p className="text-sm text-muted-foreground">Get help whenever you need it</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleStartPayment}
            className="w-full"
            size="lg"
          >
            Start Subscription in Telegram
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to our Telegram bot to complete the payment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
