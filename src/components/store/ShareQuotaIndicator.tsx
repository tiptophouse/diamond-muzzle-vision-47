import { Users, Sparkles, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useShareQuota } from "@/hooks/useShareQuota";
import { Button } from "@/components/ui/button";

export function ShareQuotaIndicator() {
  const { quotaData, loading } = useShareQuota();

  if (loading || !quotaData) {
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="w-20 h-3 bg-purple-200 rounded animate-pulse mb-1" />
              <div className="w-16 h-2 bg-purple-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIndicatorColor = () => {
    if (quotaData.sharesRemaining <= 0) return "text-red-600";
    if (quotaData.sharesRemaining <= 2) return "text-amber-600";
    return "text-purple-600";
  };

  const getIcon = () => {
    if (quotaData.sharesRemaining <= 0) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (quotaData.sharesRemaining <= 2) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <Sparkles className="h-5 w-5 text-purple-500" />;
  };

  const getBadgeVariant = () => {
    if (quotaData.sharesRemaining <= 0) return "destructive";
    if (quotaData.sharesRemaining <= 2) return "outline";
    return "secondary";
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getIndicatorColor()}`}>
                  Group Shares
                </span>
                <Badge variant={getBadgeVariant()} className="text-xs">
                  {quotaData.sharesRemaining} left
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Premium sharing to Telegram groups
              </p>
            </div>
          </div>
          
          {quotaData.sharesRemaining > 0 && (
            <Users className="h-4 w-4 text-purple-400" />
          )}
        </div>

        {quotaData.sharesRemaining <= 2 && quotaData.sharesRemaining > 0 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Running low! Contact admin to increase quota.
          </div>
        )}

        {quotaData.sharesRemaining <= 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            No shares remaining. Contact admin to get more.
          </div>
        )}
      </CardContent>
    </Card>
  );
}