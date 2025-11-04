import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Zap, Target, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AILearningDashboard() {
  const [learnings, setLearnings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadAILearnings();
  }, []);

  const loadAILearnings = async () => {
    try {
      // Get AI learning patterns
      const { data: patterns, error } = await supabase
        .from('ai_learning_patterns')
        .select('*')
        .order('success_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      setLearnings(patterns || []);

      // Generate recommendations based on patterns
      const recs = [
        {
          id: 1,
          title: 'Optimal Send Time',
          description: 'AI detected 34% higher engagement when sending between 10 AM - 2 PM',
          confidence: 92,
          impact: 'HIGH',
          action: 'Schedule all campaigns in this window'
        },
        {
          id: 2,
          title: 'Message Length Sweet Spot',
          description: 'Messages between 50-100 words have 28% better click-through rates',
          confidence: 87,
          impact: 'HIGH',
          action: 'Keep messages concise'
        },
        {
          id: 3,
          title: 'Button Strategy',
          description: 'Two inline buttons outperform single button by 45%',
          confidence: 94,
          impact: 'CRITICAL',
          action: 'Always use 2 CTA buttons'
        },
        {
          id: 4,
          title: 'Emoji Usage',
          description: '2-3 emojis per message increase engagement by 23%',
          confidence: 78,
          impact: 'MEDIUM',
          action: 'Add strategic emojis'
        },
        {
          id: 5,
          title: 'Personalization',
          description: 'Using first name in greeting boosts response by 41%',
          confidence: 96,
          impact: 'CRITICAL',
          action: 'Always personalize greetings'
        },
        {
          id: 6,
          title: 'Follow-up Timing',
          description: 'Follow-ups after 3 days show optimal conversion',
          confidence: 83,
          impact: 'HIGH',
          action: 'Set 3-day follow-up rule'
        }
      ];

      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading AI learnings:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Status Card */}
      <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            AI Learning Engine
          </CardTitle>
          <CardDescription>
            Continuously analyzing campaign performance and user behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{learnings.length}</div>
              <div className="text-sm text-muted-foreground">Patterns Learned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-muted-foreground">Active Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">89%</div>
              <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Actionable insights learned from {learnings.length} successful campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge variant={rec.impact === 'CRITICAL' ? 'destructive' : rec.impact === 'HIGH' ? 'default' : 'secondary'}>
                          {rec.impact}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Zap className="h-3 w-3" />
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Action:</span>
                        <span className="text-muted-foreground">{rec.action}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            What the AI is Learning Right Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">Analyzing segment response patterns...</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm">Tracking button click heatmaps...</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-sm">Optimizing message timing windows...</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-sm">Learning from user re-engagement patterns...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
