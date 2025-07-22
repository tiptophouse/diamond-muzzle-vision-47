
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Gem, Award, Target } from "lucide-react";
import { UploadAnalytics } from "@/services/uploadAnalytics";

interface UploadInsightsSummaryProps {
  analytics: UploadAnalytics;
  successCount: number;
}

export function UploadInsightsSummary({ analytics, successCount }: UploadInsightsSummaryProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gem className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatNumber(successCount)}</p>
                <p className="text-xs text-muted-foreground">Diamonds Added</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analytics.marketInsights.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(analytics.marketInsights.averagePricePerCarat)}</p>
                <p className="text-xs text-muted-foreground">Avg Price/Carat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analytics.marketInsights.premiumCount}</p>
                <p className="text-xs text-muted-foreground">Premium Stones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Most Popular Shape */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Most Popular Shape:</span>
            <Badge variant="secondary">
              {analytics.shapeDistribution[0]?.name} ({analytics.shapeDistribution[0]?.percentage}%)
            </Badge>
          </div>

          {/* Average Size */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Average Carat Weight:</span>
            <Badge variant="outline">
              {analytics.sizeDistribution.averageWeight.toFixed(2)}ct
            </Badge>
          </div>

          {/* Price Range */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price Range:</span>
            <Badge variant="outline">
              {formatCurrency(analytics.priceDistribution.min)} - {formatCurrency(analytics.priceDistribution.max)}
            </Badge>
          </div>

          {/* Top Color Grade */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Most Common Color:</span>
            <Badge variant="secondary">
              {analytics.qualityDistribution.colorGrades[0]?.grade} ({analytics.qualityDistribution.colorGrades[0]?.percentage}%)
            </Badge>
          </div>

          {/* Top Clarity Grade */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Most Common Clarity:</span>
            <Badge variant="secondary">
              {analytics.qualityDistribution.clarityGrades[0]?.grade} ({analytics.qualityDistribution.clarityGrades[0]?.percentage}%)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Market Recommendations */}
      {analytics.marketInsights.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.marketInsights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
