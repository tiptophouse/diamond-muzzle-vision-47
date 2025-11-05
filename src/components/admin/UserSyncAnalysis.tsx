import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Download, AlertTriangle, CheckCircle, Users, Database } from 'lucide-react';
import { analyzeSyncStatus, downloadAnalysisReport, type SyncAnalysisResult } from '@/utils/userSyncAnalysis';

export function UserSyncAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SyncAnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // Read CSV file
      const csvContent = await file.text();
      
      // Fetch all users from frontend database
      const { data: frontendUsers, error } = await supabase
        .from('user_profiles')
        .select('telegram_id');
      
      if (error) throw error;
      
      // Analyze sync status
      const result = analyzeSyncStatus(csvContent, frontendUsers || []);
      setAnalysisResult(result);
      
      toast({
        title: 'Analysis Complete',
        description: `Found ${result.missingCount} users in backend that are missing from frontend database`,
      });
    } catch (error: any) {
      console.error('Error analyzing sync:', error);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze user sync',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    downloadAnalysisReport(analysisResult);
    toast({
      title: 'Report Downloaded',
      description: 'Missing users report has been downloaded',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backend to Frontend User Sync Analysis
          </CardTitle>
          <CardDescription>
            Upload your backend CSV export to compare with frontend database and identify missing users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isAnalyzing}
              />
            </div>
            <Button disabled={isAnalyzing}>
              <Upload className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Upload CSV'}
            </Button>
          </div>

          {analysisResult && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Backend Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{analysisResult.backendTotal}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Frontend Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{analysisResult.frontendTotal}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Missing Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="text-2xl font-bold text-destructive">
                        {analysisResult.missingCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sync Status:</strong> {analysisResult.syncPercentage.toFixed(1)}% of backend users exist in frontend
                  ({analysisResult.matchingCount} matched, {analysisResult.missingCount} missing)
                </AlertDescription>
              </Alert>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Missing Users ({analysisResult.missingCount})</h3>
                <Button onClick={handleDownloadReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-md">
                <div className="p-4">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background border-b">
                      <tr>
                        <th className="text-left p-2 font-medium">Telegram ID</th>
                        <th className="text-left p-2 font-medium">Name</th>
                        <th className="text-left p-2 font-medium">Phone</th>
                        <th className="text-left p-2 font-medium">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.missingInFrontend.map((user, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{user.telegram_id}</td>
                          <td className="p-2">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : <span className="text-muted-foreground italic">No name</span>
                            }
                          </td>
                          <td className="p-2 font-mono text-sm">
                            {user.phone_number || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="p-2 text-sm">
                            {user.last_activity_at 
                              ? new Date(user.last_activity_at).toLocaleDateString()
                              : <span className="text-muted-foreground">Never</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
