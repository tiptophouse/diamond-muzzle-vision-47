import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, TrendingUp, Database, Sparkles, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UploadAnalytics {
  totalRows: number;
  successfulUploads: number;
  failedUploads: number;
  fieldMappings: number;
  unmappedFields: string[];
  errors?: string[];
  processingTime?: number;
}

interface AIUploadSummaryProps {
  analytics: UploadAnalytics;
  fileName: string;
}

export function AIUploadSummary({ analytics, fileName }: AIUploadSummaryProps) {
  const successRate = Math.round((analytics.successfulUploads / analytics.totalRows) * 100);
  const mappingEfficiency = Math.round((analytics.fieldMappings / (analytics.fieldMappings + analytics.unmappedFields.length)) * 100);

  // AI-powered insights based on upload results
  const generateInsights = () => {
    const insights = [];
    
    if (successRate === 100) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        title: "Perfect Upload! 🎉",
        description: "All diamonds were successfully processed and added to your inventory."
      });
    } else if (successRate >= 80) {
      insights.push({
        type: "warning",
        icon: TrendingUp,
        title: "Excellent Upload Rate",
        description: `${successRate}% success rate - Most diamonds were processed successfully.`
      });
    } else {
      insights.push({
        type: "error",
        icon: AlertTriangle,
        title: "Upload Issues Detected",
        description: `${analytics.failedUploads} diamonds failed to upload. Check data quality.`
      });
    }

    if (analytics.unmappedFields.length > 0) {
      insights.push({
        type: "info",
        icon: Database,
        title: "Field Mapping Optimization",
        description: `${analytics.unmappedFields.length} fields couldn't be automatically mapped. Consider standardizing column names.`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  // Analyze common failure patterns
  const analyzeFailures = () => {
    if (!analytics.errors || analytics.errors.length === 0) return null;

    const errorPatterns = analytics.errors.reduce((acc, error) => {
      if (error.includes('shape')) acc.shape = (acc.shape || 0) + 1;
      if (error.includes('color')) acc.color = (acc.color || 0) + 1;
      if (error.includes('clarity')) acc.clarity = (acc.clarity || 0) + 1;
      if (error.includes('certificate')) acc.certificate = (acc.certificate || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const failurePatterns = analyzeFailures();

  return (
    <div className="space-y-6 mt-6">
      {/* Header with sparkles effect */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-diamond-500 animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-diamond-600 to-primary bg-clip-text text-transparent">
            AI Upload Analysis
          </h2>
          <Sparkles className="h-6 w-6 text-diamond-500 animate-pulse" />
        </div>
        <p className="text-muted-foreground">
          Intelligent analysis of your <span className="font-semibold text-diamond-600">{fileName}</span> upload
        </p>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Processed */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Diamonds
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-600">{analytics.totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Records processed</p>
          </CardContent>
        </Card>

        {/* Successful Uploads */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Successfully Added
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600">{analytics.successfulUploads.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                {successRate}% Success Rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Failed Uploads */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20" />
          <CardHeader className="pb-2 relative">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Upload Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-600">{analytics.failedUploads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.failedUploads === 0 ? 'Perfect upload!' : 'Diamonds with errors'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Rate Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-diamond-600" />
            Upload Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Success Rate</span>
              <span className="font-semibold">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{analytics.successfulUploads} successful</span>
              <span>{analytics.failedUploads} failed</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Field Mapping Efficiency</span>
              <span className="font-semibold">{mappingEfficiency}%</span>
            </div>
            <Progress value={mappingEfficiency} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{analytics.fieldMappings} fields mapped</span>
              <span>{analytics.unmappedFields.length} unmapped</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-diamond-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <insight.icon className={`h-5 w-5 mt-0.5 ${
                insight.type === 'success' ? 'text-green-600' :
                insight.type === 'warning' ? 'text-yellow-600' :
                insight.type === 'error' ? 'text-red-600' : 'text-blue-600'
              }`} />
              <div>
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Failure Analysis (if there are failures) */}
      {failurePatterns && failurePatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Upload Issues Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Most common issues preventing upload:
              </p>
              {failurePatterns.map(([type, count], index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-950/20">
                  <span className="text-sm font-medium capitalize">{type} validation errors</span>
                  <Badge variant="destructive" className="text-xs">
                    {count} diamonds affected
                  </Badge>
                </div>
              ))}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Review your CSV data format. Common issues include invalid shape names (use "round brilliant" instead of "round"), 
                  color grades outside D-N range, or non-standard clarity grades.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unmapped Fields (if any) */}
      {analytics.unmappedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-600" />
              Unmapped Fields Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              These fields couldn't be automatically mapped to our diamond schema:
            </p>
            <div className="flex flex-wrap gap-2">
              {analytics.unmappedFields.map((field, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                💡 <strong>Optimization Tip:</strong> Use standard column names like "shape", "weight", "color", "clarity" 
                for better automatic mapping in future uploads.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}