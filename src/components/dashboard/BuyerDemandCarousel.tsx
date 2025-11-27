import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Search, ArrowRight, Sparkles, Clock } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

interface BuyerDemandCarouselProps {
  searchResults: any[];
}

export function BuyerDemandCarousel({ searchResults }: BuyerDemandCarouselProps) {
  const navigate = useNavigate();
  const { impactOccurred } = useTelegramHapticFeedback();

  const categorizedSearches = {
    large: searchResults.filter(s => {
      const caratMatch = s.search_query?.match(/(\d+\.?\d*)\s*ct/i);
      return caratMatch && parseFloat(caratMatch[1]) >= 1;
    }),
    fancy: searchResults.filter(s => 
      /emerald|radiant|princess|cushion|pear|marquise|oval|heart/i.test(s.search_query)
    ),
    premium: searchResults.filter(s => 
      /\bD\b|\bE\b|\bF\b|VVS|IF|Flawless/i.test(s.search_query)
    ),
    budget: searchResults.filter(s => 
      /budget|under|cheap|\$\d+k|affordable/i.test(s.search_query)
    ),
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleSendMatch = (buyerId: number) => {
    impactOccurred('medium');
    navigate(`/notifications?buyerId=${buyerId}`);
  };

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <span className="text-foreground">🔥 Buyers Looking NOW</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/notifications')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {searchResults.slice(0, 10).map((result, index) => {
              const category = 
                categorizedSearches.large.includes(result) ? 'Large Stones (1ct+)' :
                categorizedSearches.fancy.includes(result) ? 'Fancy Shapes' :
                categorizedSearches.premium.includes(result) ? 'Premium (D-F, VVS+)' :
                categorizedSearches.budget.includes(result) ? 'Budget Buyers' :
                'General Search';

              return (
                <CarouselItem key={result.id} className="pl-2 basis-[85%] md:basis-1/2 lg:basis-1/3">
                  <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(result.created_at)}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                      "{result.search_query}"
                    </p>

                    {result.result_type === 'match' && (
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">
                          {result.matches_count || 1} match{(result.matches_count || 1) > 1 ? 'es' : ''} found
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={() => handleSendMatch(result.buyer_id)}
                      size="sm"
                      className="w-full"
                      variant={result.result_type === 'match' ? 'default' : 'outline'}
                    >
                      {result.result_type === 'match' ? '💎 Send Match' : '🔍 View Details'}
                    </Button>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  );
}
