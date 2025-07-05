
import { Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTokenSystem } from "@/hooks/useTokenSystem";

interface TokenDisplayProps {
  showPurchaseButton?: boolean;
  onPurchaseClick?: () => void;
}

export function TokenDisplay({ showPurchaseButton = true, onPurchaseClick }: TokenDisplayProps) {
  const { tokens, canGenerate, tokensPerGeneration } = useTokenSystem();

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={canGenerate ? "default" : "destructive"} 
        className="flex items-center gap-1"
      >
        <Coins className="h-3 w-3" />
        {tokens} tokens
      </Badge>
      
      <span className="text-xs text-muted-foreground">
        ({tokensPerGeneration} per generation)
      </span>
      
      {showPurchaseButton && !canGenerate && (
        <Button
          variant="outline"
          size="sm"
          onClick={onPurchaseClick}
          className="text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Buy Tokens
        </Button>
      )}
    </div>
  );
}
