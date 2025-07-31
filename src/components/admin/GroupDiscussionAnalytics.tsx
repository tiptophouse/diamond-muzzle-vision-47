
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, MessageSquare, TrendingUp, TrendingDown, AlertCircle, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GroupMessage {
  id: string;
  group_id: string;
  sender_telegram_id?: number;
  sender_username?: string;
  message_text: string;
  message_timestamp: string;
  processed_for_insights: boolean;
}

interface AnalysisInsight {
  id: string;
  analysis_type: string;
  insights: any;
  confidence_score: number;
  created_at: string;
}

export function GroupDiscussionAnalytics() {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchDiscussionData = async () => {
    try {
      setIsLoading(true);

      // Fetch recent group messages
      const { data: messageData, error: messageError } = await supabase
        .from('group_discussions')
        .select('*')
        .order('message_timestamp', { ascending: false })
        .limit(100);

      if (messageError) throw messageError;

      // Fetch analysis insights
      const { data: insightData, error: insightError } = await supabase
        .from('discussion_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (insightError && insightError.code !== 'PGRST116') {
        throw insightError;
      }

      setMessages(messageData || []);
      setInsights(insightData || []);
    } catch (error) {
      console.error('Error fetching discussion data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת נתוני הדיונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDiscussions = async () => {
    try {
      setIsAnalyzing(true);

      const { data, error } = await supabase.functions.invoke('analyze-group-discussions', {
        body: {
          analyze_recent_messages: true,
          analysis_types: ['supply_demand', 'pain_points', 'market_trends']
        }
      });

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "ניתוח הדיונים הושלם בהצלחה",
      });

      // Refresh data to show new insights
      await fetchDiscussionData();
    } catch (error) {
      console.error('Error analyzing discussions:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בניתוח הדיונים",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchDiscussionData();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'supply_demand':
        return <TrendingUp className="w-4 h-4" />;
      case 'pain_points':
        return <AlertCircle className="w-4 h-4" />;
      case 'market_trends':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'supply_demand':
        return 'היצע וביקוש';
      case 'pain_points':
        return 'בעיות ואתגרים';
      case 'market_trends':
        return 'מגמות שוק';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">טוען נתוני דיונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ניתוח דיוני קבוצה</h2>
          <p className="text-muted-foreground">
            תובנות מתוך דיונים בקבוצות הטלגרם של יהלומנים
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchDiscussionData}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            רענן
          </Button>
          <Button
            onClick={analyzeDiscussions}
            disabled={isAnalyzing}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                מנתח...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                נתח דיונים
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הודעות בקבוצות</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              הודעות אחרונות שנאספו
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הודעות מעובדות</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {messages.filter(m => m.processed_for_insights).length}
            </div>
            <p className="text-xs text-muted-foreground">
              מתוך {messages.length} הודעות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תובנות שזוהו</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              ניתוחים אחרונים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דיוק ממוצע</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.length > 0 
                ? Math.round((insights.reduce((acc, insight) => acc + insight.confidence_score, 0) / insights.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              דיוק ממוצע של הניתוח
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">תובנות מהדיונים</TabsTrigger>
          <TabsTrigger value="messages">הודעות אחרונות</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.analysis_type)}
                        <CardTitle className="text-lg">
                          {getInsightTitle(insight.analysis_type)}
                        </CardTitle>
                      </div>
                      <Badge variant="outline">
                        {Math.round(insight.confidence_score * 100)}% דיוק
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(insight.created_at).toLocaleDateString('he-IL')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insight.insights?.summary && (
                        <div>
                          <h4 className="font-medium mb-2">סיכום:</h4>
                          <p className="text-sm text-muted-foreground">
                            {insight.insights.summary}
                          </p>
                        </div>
                      )}
                      
                      {insight.insights?.key_findings && (
                        <div>
                          <h4 className="font-medium mb-2">ממצאים עיקריים:</h4>
                          <ul className="space-y-1">
                            {insight.insights.key_findings.map((finding: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {insight.insights?.recommendations && (
                        <div>
                          <h4 className="font-medium mb-2">המלצות:</h4>
                          <ul className="space-y-1">
                            {insight.insights.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-600">→</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">אין תובנות זמינות</h3>
                <p className="text-muted-foreground mb-4">
                  לחץ על "נתח דיונים" כדי לקבל תובנות מהדיונים בקבוצות
                </p>
                <Button onClick={analyzeDiscussions} disabled={isAnalyzing}>
                  נתח דיונים עכשיו
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.slice(0, 20).map((message) => (
                <Card key={message.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {message.sender_username ? `@${message.sender_username}` : `משתמש ${message.sender_telegram_id}`}
                          </span>
                          <Badge variant={message.processed_for_insights ? "default" : "secondary"} className="text-xs">
                            {message.processed_for_insights ? "מעובד" : "ממתין"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {message.message_text}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.message_timestamp).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">אין הודעות זמינות</h3>
                <p className="text-muted-foreground">
                  הודעות מקבוצות יופיעו כאן לאחר שהבוט יתחיל לאסוף נתונים
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
