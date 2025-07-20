import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Clock, Share2 } from "lucide-react";

interface GroupInsight {
  totalSharedDiamonds: number;
  mostViewedShape: string;
  mostViewedColor: string;
  avgViewTime: number;
  totalViews: number;
}

interface GroupInsightsCardProps {
  groupInsights: GroupInsight | null;
}

export function GroupInsightsCard({ groupInsights }: GroupInsightsCardProps) {
  if (!groupInsights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Group Activity Insights
          </CardTitle>
          <CardDescription>
            Analyzing group engagement patterns...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading group insights...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Group Activity Insights
        </CardTitle>
        <CardDescription>
          What's happening in the diamond community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <Share2 className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">
              {groupInsights.totalSharedDiamonds}
            </div>
            <div className="text-sm text-muted-foreground">Shared Diamonds</div>
          </div>
          
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <Eye className="h-6 w-6 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary">
              {groupInsights.totalViews}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Most Viewed Shape</span>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {groupInsights.mostViewedShape}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Avg. View Time</span>
            </div>
            <Badge variant="outline">
              {Math.round(groupInsights.avgViewTime)}s
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}