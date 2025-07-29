
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, TrendingUp, AlertTriangle, Users, Eye } from 'lucide-react';

interface GroupMessage {
  id: string;
  group_id: number;
  telegram_id: number;
  message_text: string;
  message_timestamp: string;
  processed_for_insights: boolean;
  created_at: string;
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeGroups: 0,
    supplyMentions: 0,
    demandMentions: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // For now, using mock data until tables are created
      const mockMessages: GroupMessage[] = [
        {
          id: '1',
          group_id: 123456789,
          telegram_id: 987654321,
          message_text: 'מחפש יהלום עגול 1 קראט צבע D',
          message_timestamp: new Date().toISOString(),
          processed_for_insights: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          group_id: 123456789,
          telegram_id: 555666777,
          message_text: 'יש לי יהלומי פנסי באיכות גבוהה למכירה',
          message_timestamp: new Date().toISOString(),
          processed_for_insights: true,
          created_at: new Date().toISOString()
        }
      ];

      const mockInsights: AnalysisInsight[] = [
        {
          id: '1',
          analysis_type: 'supply_demand',
          insights: {
            trend: 'high_demand_round_diamonds',
            details: 'ביקוש גבוה ליהלומים עגולים 1-2 קראט'
          },
          confidence_score: 0.85,
          created_at: new Date().toISOString()
        }
      ];

      setMessages(mockMessages);
      setInsights(mockInsights);
      
      setStats({
        totalMessages: mockMessages.length,
        activeGroups: 3,
        supplyMentions: 12,
        demandMentions: 18
      });

    } catch (error) {
      console.error('Error fetching group discussion data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">הודעות כוללות</p>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
            </div>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">קבוצות פעילות</p>
              <div className="text-2xl font-bold">{stats.activeGroups}</div>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">אזכורי היצע</p>
              <div className="text-2xl font-bold text-green-600">{stats.supplyMentions}</div>
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">אזכורי ביקוש</p>
              <div className="text-2xl font-bold text-blue-600">{stats.demandMentions}</div>
            </div>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">תובנות AI</TabsTrigger>
          <TabsTrigger value="messages">הודעות אחרונות</TabsTrigger>
          <TabsTrigger value="trends">מגמות שוק</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>תובנות מבוססות AI</CardTitle>
              <CardDescription>
                ניתוח אוטומטי של דיונים בקבוצות למציאת הזדמנויות עסקיות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">
                        {insight.analysis_type === 'supply_demand' ? 'היצע וביקוש' : insight.analysis_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ביטחון: {Math.round(insight.confidence_score * 100)}%
                      </span>
                    </div>
                    <p className="text-sm">{insight.insights.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>הודעות שנתפסו מהקבוצות</CardTitle>
              <CardDescription>
                הודעות אחרונות מקבוצות המסחר שנותחו על ידי המערכת
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">קבוצה {message.group_id}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.message_timestamp).toLocaleTimeString('he-IL')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{message.message_text}</p>
                    <div className="mt-2">
                      <Badge variant={message.processed_for_insights ? "default" : "outline"} className="text-xs">
                        {message.processed_for_insights ? "עובד" : "ממתין לעיבוד"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>מגמות שוק בזמן אמת</CardTitle>
              <CardDescription>
                ניתוח מגמות מבוסס על פעילות בקבוצות
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">📈 מגמה חמה</h4>
                  <p className="text-sm text-green-700">יהלומים עגולים 1-2 קראט בביקוש גבוה השבוע</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💎 הזדמנות השקעה</h4>
                  <p className="text-sm text-blue-700">יהלומי פנסי באיכות VS+ מוצעים במחירים אטרקטיביים</p>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">⚠️ מחסור היצע</h4>
                  <p className="text-sm text-orange-700">מחסור ביהלומים צבע D-F, בהירות FL-VS1 במשקלים 0.5-1 קראט</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
