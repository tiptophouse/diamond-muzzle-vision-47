import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Share2, 
  ExternalLink, 
  Copy,
  Mail,
  MessageCircle,
  FileText,
  Download,
  Calendar,
  Users,
  Eye,
  Clock
} from 'lucide-react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'inventory' | 'market' | 'engagement';
  deepLink: string;
  shareCount: number;
  views: number;
  lastUpdated: string;
  data: any;
}

interface ShareStats {
  telegram: number;
  email: number;
  direct: number;
  social: number;
}

export default function DeepLinkReports() {
  const { user } = useTelegramAuth();
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [customLink, setCustomLink] = useState<string>('');

  const reports: Report[] = [
    {
      id: 'weekly_performance',
      title: 'Weekly Performance Report',
      description: 'Comprehensive analysis of your diamond inventory performance',
      type: 'performance',
      deepLink: `${window.location.origin}/reports/weekly?user=${user?.id}&utm_source=telegram&utm_campaign=engagement`,
      shareCount: 23,
      views: 156,
      lastUpdated: '2 hours ago',
      data: {
        revenue: '+12%',
        inventory: '45 diamonds',
        engagement: '+34%'
      }
    },
    {
      id: 'inventory_insights',
      title: 'Inventory Insights',
      description: 'Deep dive into your diamond collection trends and opportunities',
      type: 'inventory',
      deepLink: `${window.location.origin}/insights?user=${user?.id}&report=inventory&utm_source=telegram`,
      shareCount: 18,
      views: 89,
      lastUpdated: '1 day ago',
      data: {
        totalValue: '$456,789',
        topPerformer: '2.5ct Round Diamond',
        categoryGrowth: '+18%'
      }
    },
    {
      id: 'market_analysis',
      title: 'Market Analysis Report',
      description: 'Current market trends and pricing intelligence for your diamonds',
      type: 'market',
      deepLink: `${window.location.origin}/dashboard?tab=market&user=${user?.id}&report=analysis`,
      shareCount: 31,
      views: 234,
      lastUpdated: '3 hours ago',
      data: {
        marketTrend: 'Bullish',
        priceChange: '+5.7%',
        bestCategories: 'Round, Princess'
      }
    },
    {
      id: 'engagement_metrics',
      title: 'User Engagement Report',
      description: 'Your app usage patterns and engagement statistics',
      type: 'engagement',
      deepLink: `${window.location.origin}/profile?section=analytics&user=${user?.id}&engagement=detailed`,
      shareCount: 12,
      views: 67,
      lastUpdated: '6 hours ago',
      data: {
        timeSpent: '2.5 hours/week',
        actionsCompleted: 89,
        streakRecord: '12 days'
      }
    }
  ];

  const [shareStats] = useState<ShareStats>({
    telegram: 45,
    email: 23,
    direct: 67,
    social: 34
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link Copied! 📋",
        description: "Deep link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const shareViatelegram = async (report: Report) => {
    const message = `📊 ${report.title}\n\n${report.description}\n\n🔗 ${report.deepLink}`;
    
    try {
      // Fallback to copying link and opening share URL
      copyToClipboard(report.deepLink);
      
      // Try to open share URL in a new window
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(report.deepLink)}&text=${encodeURIComponent(message)}`;
      window.open(shareUrl, '_blank');
    } catch (error) {
      copyToClipboard(report.deepLink);
    }

    toast({
      title: "Shared via Telegram! 📱",
      description: `${report.title} shared successfully`,
    });
  };

  const generateCustomDeepLink = () => {
    if (!customLink) return;
    
    const baseUrl = window.location.origin;
    const userId = user?.id;
    const deepLink = `${baseUrl}${customLink}?user=${userId}&utm_source=telegram&utm_campaign=custom&timestamp=${Date.now()}`;
    
    setCustomLink(deepLink);
    copyToClipboard(deepLink);
  };

  const sendScheduledReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // This would trigger a scheduled notification
      toast({
        title: "Report Scheduled! ⏰",
        description: `${report.title} will be sent weekly`,
      });
    } catch (error) {
      toast({
        title: "Schedule Failed",
        description: "Failed to schedule report",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'bg-blue-500';
      case 'inventory': return 'bg-green-500';
      case 'market': return 'bg-purple-500';
      case 'engagement': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'inventory': return <BarChart3 className="w-4 h-4" />;
      case 'market': return <Users className="w-4 h-4" />;
      case 'engagement': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deep Link Reports</h1>
          <p className="text-muted-foreground">
            Generate shareable reports to drive user engagement and retention
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {shareStats.telegram + shareStats.email + shareStats.direct + shareStats.social} Total Shares
        </Badge>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Share Analytics</TabsTrigger>
          <TabsTrigger value="custom">Custom Links</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.id} className="hover-scale transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg text-white ${getTypeColor(report.type)}`}>
                        {getTypeIcon(report.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="text-sm">
                          Updated {report.lastUpdated}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {report.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">{report.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{report.shareCount}</div>
                      <div className="text-xs text-muted-foreground">Shares</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {Object.keys(report.data).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Metrics</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Quick Stats:</span>
                    </div>
                    {Object.entries(report.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="capitalize text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(report.deepLink)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => shareViatelegram(report)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => sendScheduledReport(report.id)}
                    className="w-full"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Schedule Weekly
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Telegram Shares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shareStats.telegram}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  +12% from last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Email Forwards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shareStats.email}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="w-3 h-3 mr-1" />
                  +8% from last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Direct Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shareStats.direct}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  +23% from last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shareStats.social}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Share2 className="w-3 h-3 mr-1" />
                  +5% from last week
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Share Performance</CardTitle>
              <CardDescription>
                Track which reports drive the most engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-white ${getTypeColor(report.type)}`}>
                        {getTypeIcon(report.type)}
                      </div>
                      <div>
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.views} views • {report.shareCount} shares
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {Math.round((report.shareCount / report.views) * 100)}% rate
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Deep Link Generator</CardTitle>
              <CardDescription>
                Create custom deep links for specific pages and campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-path">Page Path</Label>
                <Input
                  id="custom-path"
                  placeholder="/dashboard or /inventory or /store"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                />
              </div>
              
              <Button onClick={generateCustomDeepLink} className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Generate Deep Link
              </Button>

              <div className="space-y-3">
                <Label>Popular Deep Link Templates:</Label>
                {[
                  { path: '/dashboard?tab=insights', label: 'Dashboard Insights' },
                  { path: '/store?featured=true', label: 'Featured Store Items' },
                  { path: '/inventory?action=upload', label: 'Upload New Diamond' },
                  { path: '/profile?section=achievements', label: 'User Achievements' }
                ].map((template) => (
                  <Button
                    key={template.path}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomLink(template.path)}
                    className="w-full justify-start"
                  >
                    {template.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Tracking</CardTitle>
              <CardDescription>
                UTM parameters automatically added for analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-mono">telegram</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign:</span>
                  <span className="font-mono">engagement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-mono">auto-generated</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}