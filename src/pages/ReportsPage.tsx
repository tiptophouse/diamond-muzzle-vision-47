
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Search, ArrowLeft } from "lucide-react";
import { api, apiEndpoints } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { processDiamondDataForDashboard } from "@/services/diamondAnalytics";

interface DiamondReport {
  total: number;
  unique_color: number;
  total_price: number;
  colors: string[];
}

export default function ReportsPage() {
  const { reportId } = useParams();
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [foundReport, setFoundReport] = useState<DiamondReport | null>(null);
  const [reportUrl, setReportUrl] = useState<string>("");

  // Auto-load report if reportId is provided in URL
  useEffect(() => {
    if (reportId) {
      setSearchId(reportId);
      handleSearchReport(reportId);
    }
  }, [reportId]);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Fetch current diamond data
      const diamondsResponse = await api.get<any[]>(
        apiEndpoints.getAllStones()
      );

      if (diamondsResponse.data) {
        const { stats } = processDiamondDataForDashboard(diamondsResponse.data);
        
        // Get unique colors from the data
        const colors = [...new Set(
          diamondsResponse.data
            .map(d => d.color)
            .filter(Boolean)
        )] as string[];

        const reportData = {
          total: stats.totalDiamonds,
          unique_color: colors.length,
          total_price: diamondsResponse.data.reduce((sum, d) => sum + (d.price || 0), 0),
          colors: colors
        };

        const response = await api.post<string>(
          apiEndpoints.createReport(),
          reportData
        );

        if (response.data) {
          setReportUrl(response.data);
          toast({
            title: "Report Generated",
            description: "Your diamond report has been created successfully!",
          });
        }
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchReport = async (id?: string) => {
    const searchReportId = id || searchId;
    
    if (!searchReportId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report ID to search.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<DiamondReport>(
        apiEndpoints.getReport(searchReportId)
      );

      if (response.data) {
        setFoundReport(response.data);
        toast({
          title: "Report Found",
          description: "Report retrieved successfully!",
        });
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      setFoundReport(null);
      toast({
        title: "Error",
        description: "Report not found. Please check the ID and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goBackToReports = () => {
    window.history.pushState({}, '', '/reports');
    setFoundReport(null);
    setSearchId("");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          {reportId && (
            <Button variant="outline" size="sm" onClick={goBackToReports}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {reportId ? `Report #${reportId}` : 'Diamond Reports'}
            </h1>
            <p className="text-muted-foreground">
              {reportId 
                ? 'Viewing individual diamond report details'
                : 'Generate comprehensive reports on your diamond inventory and retrieve existing reports.'
              }
            </p>
          </div>
        </div>

        {!reportId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generate New Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Generate New Report
                </CardTitle>
                <CardDescription>
                  Create a comprehensive report based on your current diamond inventory.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
                
                {reportUrl && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Report URL:</Label>
                    <div className="mt-2 p-2 bg-background rounded border text-sm break-all">
                      {reportUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(reportUrl);
                        toast({
                          title: "Copied!",
                          description: "Report URL copied to clipboard.",
                        });
                      }}
                    >
                      Copy URL
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Existing Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Existing Report
                </CardTitle>
                <CardDescription>
                  Retrieve a previously generated report using its ID.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportId">Report ID</Label>
                  <Input
                    id="reportId"
                    type="text"
                    placeholder="Enter report ID..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={() => handleSearchReport()} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? "Searching..." : "Search Report"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Display Found Report */}
        {foundReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Details {reportId && `- #${reportId}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Total Diamonds
                  </Label>
                  <div className="text-2xl font-bold">{foundReport.total}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Unique Colors
                  </Label>
                  <div className="text-2xl font-bold">{foundReport.unique_color}</div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </Label>
                  <div className="text-2xl font-bold">
                    ${foundReport.total_price.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Available Colors
                </Label>
                <div className="flex flex-wrap gap-2">
                  {foundReport.colors.map((color, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
