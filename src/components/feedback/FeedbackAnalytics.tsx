
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FeedbackItem {
  id: string;
  rating: number | null;
  message: string | null;
  category: string;
  created_at: string;
  telegram_id: number;
}

interface FeedbackSummary {
  totalFeedback: number;
  averageRating: number;
  categoryBreakdown: Record<string, number>;
  recentFeedback: Array<{
    id: string;
    rating: number | null;
    message: string | null;
    category: string;
    created_at: string;
    user_name: string;
  }>;
}

export function FeedbackAnalytics() {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbackSummary();
  }, []);

  const fetchFeedbackSummary = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback data from user_feedback table
      const { data: feedbackData, error } = await supabase
        .from('user_feedback')
        .select(`
          id,
          rating,
          message,
          category,
          created_at,
          telegram_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const feedbackItems = feedbackData as FeedbackItem[];
      const totalFeedback = feedbackItems.length;
      const ratingsOnly = feedbackItems.filter(f => f.rating !== null).map(f => f.rating as number);
      const averageRating = ratingsOnly.length > 0 
        ? ratingsOnly.reduce((sum, rating) => sum + rating, 0) / ratingsOnly.length 
        : 0;

      // Category breakdown
      const categoryBreakdown = feedbackItems.reduce((acc, feedback) => {
        acc[feedback.category] = (acc[feedback.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Recent feedback (last 10)
      const recentFeedback = feedbackItems
        .slice(0, 10)
        .map(feedback => ({
          ...feedback,
          user_name: `User ${feedback.telegram_id.toString().slice(-4)}`,
        }));

      setSummary({
        totalFeedback,
        averageRating,
        categoryBreakdown,
        recentFeedback,
      });

    } catch (error) {
      console.error('Failed to fetch feedback summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading feedback analytics...</div>;
  }

  if (!summary) {
    return <div className="text-center py-8">No feedback data available</div>;
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalFeedback}</div>
            <p className="text-xs text-muted-foreground">Feedback submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getRatingColor(summary.averageRating))}>
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={cn(
                    "h-3 w-3",
                    star <= summary.averageRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Object.entries(summary.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(summary.categoryBreakdown)
                .sort(([,a], [,b]) => b - a)[0]?.[1] || 0} submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <span className="bg-primary/20 text-primary px-1 rounded text-xs">
                    {count}
                  </span>
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.recentFeedback.map((feedback) => (
              <div key={feedback.id} className="border-l-2 border-muted pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{feedback.category}</Badge>
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{feedback.rating}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(feedback.created_at).toLocaleDateString('he-IL')}
                  </span>
                </div>
                {feedback.message && (
                  <p className="text-sm text-muted-foreground">{feedback.message}</p>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  by {feedback.user_name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
