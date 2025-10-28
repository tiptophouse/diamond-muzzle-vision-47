import { Brain, TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useAILearning } from '@/hooks/useAILearning';
import { logger } from '@/utils/logger';

export function AILearningIndicator() {
  const { recommendations, getRecommendations, isLearning } = useAILearning();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        await getRecommendations();
      } catch (error) {
        logger.error('Failed to load AI recommendations:', error);
      }
    };
    
    loadRecommendations();
  }, [getRecommendations]);

  useEffect(() => {
    if (recommendations.length > 0) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [recommendations]);

  if (!showIndicator && recommendations.length === 0) return null;

  const avgConfidence = recommendations.length > 0
    ? (recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length * 100)
    : 0;

  return (
    <Card className="border-primary/20 bg-primary/5 animate-fade-in">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className={`w-5 h-5 text-primary ${isLearning ? 'animate-pulse' : ''}`} />
            {isLearning && (
              <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-ping" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">AI Learning Active</span>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {recommendations.length} patterns
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Your AI is {avgConfidence.toFixed(0)}% confident based on {recommendations.length} learned interactions
            </p>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              🎯 Most successful pattern: <span className="font-medium text-foreground">
                {recommendations[0].pattern_type.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
