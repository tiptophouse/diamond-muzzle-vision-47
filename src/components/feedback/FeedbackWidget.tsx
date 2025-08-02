
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarIcon, Heart, ThumbsUp, MessageSquare, X } from 'lucide-react';
import { useFeedbackCollection } from '@/hooks/useFeedbackCollection';
import { cn } from '@/lib/utils';

interface FeedbackWidgetProps {
  category: string;
  title?: string;
  onClose?: () => void;
  compact?: boolean;
}

export function FeedbackWidget({ 
  category, 
  title = "איך החוויה?",
  onClose,
  compact = false 
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);
  const { submitFeedback, isSubmitting } = useFeedbackCollection();

  const quickFeedbackOptions = [
    { icon: Heart, label: "מעולה!", rating: 5, color: "text-red-500" },
    { icon: ThumbsUp, label: "טוב", rating: 4, color: "text-green-500" },
    { icon: MessageSquare, label: "יש לי הצעה", rating: 3, color: "text-blue-500" },
  ];

  const handleQuickFeedback = async (option: typeof quickFeedbackOptions[0]) => {
    await submitFeedback({
      type: 'user_satisfaction',
      category,
      rating: option.rating,
      message: option.label,
    });
    onClose?.();
  };

  const handleDetailedFeedback = async () => {
    if (rating === 0) return;
    
    await submitFeedback({
      type: 'user_satisfaction',
      category,
      rating,
      message,
    });
    onClose?.();
  };

  if (compact && !showDetailed) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">{title}</h3>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 justify-center">
            {quickFeedbackOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFeedback(option)}
                disabled={isSubmitting}
                className="flex-1 h-auto py-3 flex flex-col gap-1 hover:scale-105 transition-transform"
              >
                <option.icon className={cn("h-4 w-4", option.color)} />
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailed(true)}
            className="w-full mt-2 text-xs text-muted-foreground"
          >
            משוב מפורט
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">דרג את החוויה שלך</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                onClick={() => setRating(star)}
                className="h-8 w-8 p-0 hover:scale-110 transition-transform"
              >
                <StarIcon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )} 
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        {rating > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {rating <= 2 ? "מה יכולנו לעשות טוב יותר?" : "יש לך הצעות נוספות?"}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="המשוב שלך חשוב לנו..."
              className="min-h-[60px] resize-none"
            />
          </div>
        )}

        {/* Submit Button */}
        {rating > 0 && (
          <Button
            onClick={handleDetailedFeedback}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isSubmitting ? "שולח..." : "שלח משוב"}
          </Button>
        )}

        {/* Back to Simple */}
        {showDetailed && compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailed(false)}
            className="w-full text-xs text-muted-foreground"
          >
            חזור למשוב מהיר
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
