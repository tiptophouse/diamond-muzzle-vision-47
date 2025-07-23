
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, Download, RotateCcw, BarChart3, TrendingUp, LayoutDashboard } from "lucide-react";
import { UploadAnalyticsCharts } from "./UploadAnalyticsCharts";
import { UploadInsightsSummary } from "./UploadInsightsSummary";
import { calculateUploadAnalytics } from "@/services/uploadAnalytics";
import { useNavigate } from "react-router-dom";

interface UploadResultsReportProps {
  results: {
    successCount: number;
    failureCount: number;
    totalAttempted: number;
    errors: Array<{ row: number; error: string; data: any }>;
    uploadedDiamonds?: any[]; // Add uploaded diamonds data for analytics
  };
  onReset: () => void;
}

export function UploadResultsReport({ results, onReset }: UploadResultsReportProps) {
  const navigate = useNavigate();
  const successRate = ((results.successCount / results.totalAttempted) * 100).toFixed(1);
  
  // Calculate analytics if we have uploaded diamonds data
  const analytics = results.uploadedDiamonds ? calculateUploadAnalytics(results.uploadedDiamonds) : null;

  const handleViewDashboard = () => {
    // Navigate to dashboard with query parameters to indicate recent upload
    navigate(`/?upload_success=${results.successCount}&from=bulk_upload`);
  };
  
  const downloadFailedData = () => {
    if (results.errors.length === 0) return;
    
    const csvContent = [
      ['Row', 'Error', 'Data'],
      ...results.errors.map(error => [
        error.row.toString(),
        error.error,
        JSON.stringify(error.data)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed_diamonds.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAnalyticsReport = () => {
    if (!analytics) return;
    
    const reportData = {
      uploadSummary: {
        totalDiamonds: results.successCount,
        totalValue: analytics.marketInsights.totalValue,
        averagePricePerCarat: analytics.marketInsights.averagePricePerCarat,
        successRate: successRate
      },
      shapeDistribution: analytics.shapeDistribution,
      priceAnalysis: analytics.priceDistribution,
      qualityBreakdown: analytics.qualityDistribution,
      sizeAnalysis: analytics.sizeDistribution,
      recommendations: analytics.marketInsights.recommendations
    };
    
    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Upload Complete - {results.successCount} Diamonds Added
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {successRate}% Success Rate
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.successCount}</div>
                <p className="text-sm text-muted-foreground">Successfully Uploaded</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{results.failureCount}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{successRate}%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{results.totalAttempted}</div>
                <p className="text-sm text-muted-foreground">Total Attempted</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {results.successCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3" />
                  {results.successCount} Uploaded
                </Badge>
              )}
              {results.failureCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {results.failureCount} Failed
                </Badge>
              )}
            </div>

            {/* Success Message */}
            {results.failureCount === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Perfect Upload!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  All {results.successCount} diamonds were successfully uploaded to your inventory.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <UploadAnalyticsCharts analytics={analytics} />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Analytics data not available</p>
              </div>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {analytics ? (
              <UploadInsightsSummary analytics={analytics} successCount={results.successCount} />
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Insights data not available</p>
              </div>
            )}
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-6">
            {results.errors.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Failed Uploads Details ({results.errors.length})</h4>
                </div>
                
                <ScrollArea className="h-64 w-full border rounded-md p-3">
                  <div className="space-y-2">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Row {error.row}</Badge>
                          <span className="text-red-600 font-medium">{error.error}</span>
                        </div>
                        {error.data && Object.keys(error.data).length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 ml-2">
                            Data: {JSON.stringify(error.data, null, 2).slice(0, 100)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-green-700 font-medium">No errors to report!</p>
                <p className="text-green-600 text-sm">All diamonds were processed successfully.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-6 border-t mt-6">
          {/* Primary action - View Dashboard */}
          {results.successCount > 0 && (
            <Button 
              onClick={handleViewDashboard}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <LayoutDashboard className="h-4 w-4" />
              View Your {results.successCount} New Diamonds in Dashboard
            </Button>
          )}

          {results.errors.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadFailedData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Failed Data
            </Button>
          )}
          
          {analytics && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadAnalyticsReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Analytics Report
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Upload More Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
