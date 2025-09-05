import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diamond, Smartphone, ExternalLink, RefreshCw, Zap } from 'lucide-react';

interface TelegramAccessGuideProps {
  isDevelopment?: boolean;
  onRetry?: () => void;
}

export function TelegramAccessGuide({ isDevelopment = false, onRetry }: TelegramAccessGuideProps) {
  if (isDevelopment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md mx-auto border-2 border-primary/20 bg-primary/5">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">Development Mode</Badge>
              <CardTitle className="text-2xl text-foreground">Mock Authentication Active</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              You're using development mode with mock authentication. This allows testing all features without Telegram.
            </p>
            <div className="p-4 bg-card border rounded-lg space-y-2">
              <div className="text-sm font-medium">Mock User Details:</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>ID: 999999999</div>
                <div>Name: Dev User</div>
                <div>Username: @dev_user</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              In production, this app only works inside Telegram WebApp environment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl text-foreground mb-2">Open in Telegram</CardTitle>
            <p className="text-muted-foreground">
              BrilliantBot is designed to work exclusively within the Telegram app for security and optimal performance.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium">Open Telegram App</div>
                <div className="text-sm text-muted-foreground">Launch the Telegram mobile app or desktop client</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium">Find BrilliantBot</div>
                <div className="text-sm text-muted-foreground">Search for @BrilliantBot or use the shared link</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium">Launch WebApp</div>
                <div className="text-sm text-muted-foreground">Tap "Launch WebApp" or the menu button</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onRetry} 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <a href="https://telegram.org/apps" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Telegram App
              </a>
            </Button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Diamond className="w-4 h-4" />
              <span>Secure • Fast • Telegram-Native</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}