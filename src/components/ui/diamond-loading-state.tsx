import { Gem } from "lucide-react";
import { Card, CardContent } from "./card";

interface DiamondLoadingStateProps {
  message?: string;
}

export function DiamondLoadingState({ message = "Loading diamond details..." }: DiamondLoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border border-border bg-card">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <Gem className="h-6 w-6 text-primary absolute top-3 left-1/2 transform -translate-x-1/2" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="flex justify-center space-x-1">
              <div className="h-2 w-2 bg-primary/30 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}