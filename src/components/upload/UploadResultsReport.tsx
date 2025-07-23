
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, Download, RotateCcw, BarChart3, TrendingUp, LayoutDashboard, 
         Diamond, DollarSign, Gem, Palette, Sparkles, Star, Shield, Clock, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UploadResultsReportProps {
  results: {
    successCount: number;
    failureCount: number;
    totalAttempted: number;
    errors: Array<{ row: number; error: string; data: any }>;
    uploadedDiamonds?: any[];
  };
  onReset: () => void;
}

export function UploadResultsReport({ results, onReset }: UploadResultsReportProps) {
  const navigate = useNavigate();
  const successRate = ((results.successCount / results.totalAttempted) * 100).toFixed(1);
  
  // Calculate comprehensive analytics from uploaded diamonds
  const calculateAnalytics = (diamonds: any[]) => {
    if (!diamonds || diamonds.length === 0) return null;

    // Color distribution
    const colorCounts = diamonds.reduce((acc, diamond) => {
      const color = diamond.color || 'Unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    // Shape distribution  
    const shapeCounts = diamonds.reduce((acc, diamond) => {
      const shape = diamond.shape || 'Unknown';
      acc[shape] = (acc[shape] || 0) + 1;
      return acc;
    }, {});

    // Size distribution
    const sizes = diamonds.map(d => parseFloat(d.weight) || 0).filter(w => w > 0);
    const sizeRanges = {
      'Under 0.5ct': sizes.filter(s => s < 0.5).length,
      '0.5 - 1ct': sizes.filter(s => s >= 0.5 && s < 1).length,
      '1 - 2ct': sizes.filter(s => s >= 1 && s < 2).length,
      '2ct+': sizes.filter(s => s >= 2).length
    };

    // Quality distribution
    const clarityCounts = diamonds.reduce((acc, diamond) => {
      const clarity = diamond.clarity || 'Unknown';
      acc[clarity] = (acc[clarity] || 0) + 1;
      return acc;
    }, {});

    // Value calculations
    const totalValue = diamonds.reduce((sum, diamond) => {
      const price = parseFloat(diamond.price_per_carat) || 0;
      const weight = parseFloat(diamond.weight) || 0;
      return sum + (price * weight);
    }, 0);

    const avgPricePerCarat = diamonds.length > 0 ? 
      diamonds.reduce((sum, d) => sum + (parseFloat(d.price_per_carat) || 0), 0) / diamonds.length : 0;

    const avgWeight = sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;

    return {
      colorDistribution: colorCounts,
      shapeDistribution: shapeCounts,
      sizeDistribution: sizeRanges,
      qualityDistribution: clarityCounts,
      totalValue,
      avgPricePerCarat,
      avgWeight,
      premiumCount: diamonds.filter(d => (parseFloat(d.price_per_carat) || 0) > 8000).length,
      largeStones: sizes.filter(s => s >= 1).length
    };
  };

  const analytics = results.uploadedDiamonds ? calculateAnalytics(results.uploadedDiamonds) : null;

  const handleViewDashboard = () => {
    navigate(`/?upload_success=${results.successCount}&from=bulk_upload`);
  };
  
  const downloadFailedData = () => {
    if (results.errors.length === 0) return;
    
    const csvContent = [
      ['Row', 'Error', 'Stock', 'Reason'],
      ...results.errors.map(error => [
        error.row.toString(),
        error.error,
        error.data?.stock || 'N/A',
        error.error.includes('Failed to fetch') ? 'Network connectivity issue' : 'Validation error'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed_diamonds_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getColorFromIndex = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 
      'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <Card className={`border-l-4 ${results.successCount > 0 ? 'border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent' : 'border-l-red-500 bg-gradient-to-r from-red-50 to-transparent'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Diamond className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upload Complete</h2>
                <p className="text-sm text-muted-foreground">Diamond inventory processing finished</p>
              </div>
            </CardTitle>
            <div className="text-right">
              <Badge variant="secondary" className={`text-lg px-3 py-1 ${results.successCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {successRate}% Success
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-1" />
                  <span className="text-2xl font-bold text-emerald-700">{results.successCount}</span>
                </div>
                <p className="text-sm text-emerald-600 font-medium">Successfully Added</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="h-5 w-5 text-red-600 mr-1" />
                  <span className="text-2xl font-bold text-red-700">{results.failureCount}</span>
                </div>
                <p className="text-sm text-red-600 font-medium">Failed</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-blue-600 mr-1" />
                  <span className="text-2xl font-bold text-blue-700">{successRate}%</span>
                </div>
                <p className="text-sm text-blue-600 font-medium">Success Rate</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-600 mr-1" />
                  <span className="text-2xl font-bold text-purple-700">{results.totalAttempted}</span>
                </div>
                <p className="text-sm text-purple-600 font-medium">Total Processed</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Upload Progress</span>
              <span>{results.successCount}/{results.totalAttempted} diamonds</span>
            </div>
            <Progress 
              value={parseFloat(successRate)} 
              className="h-3"
            />
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Distribution
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="errors" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Issues
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {analytics && (
                <>
                  {/* Value Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-8 w-8 text-amber-600" />
                          <div>
                            <p className="text-sm text-amber-600 font-medium">Total Portfolio Value</p>
                            <p className="text-2xl font-bold text-amber-700">{formatCurrency(analytics.totalValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Gem className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Avg Price/Carat</p>
                            <p className="text-2xl font-bold text-blue-700">{formatCurrency(analytics.avgPricePerCarat)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Star className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Avg Carat Weight</p>
                            <p className="text-2xl font-bold text-purple-700">{analytics.avgWeight.toFixed(2)}ct</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium">Premium Stones</span>
                          </div>
                          <Badge variant="outline">{analytics.premiumCount} stones</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Over $8,000/carat</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium">Large Stones</span>
                          </div>
                          <Badge variant="outline">{analytics.largeStones} stones</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">1 carat and above</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution" className="space-y-6 mt-6">
              {analytics ? (
                <>
                  {/* Color Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Color Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.colorDistribution).map(([color, count], index) => (
                          <div key={color} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${getColorFromIndex(index)}`} />
                              <span className="font-medium">{color}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{count as number} stones</Badge>
                              <span className="text-sm text-muted-foreground">
                                {((count as number / results.successCount) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shape & Size Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Diamond className="h-5 w-5" />
                          Shape Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(analytics.shapeDistribution).map(([shape, count]) => (
                            <div key={shape} className="flex items-center justify-between">
                              <span className="text-sm">{shape}</span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Size Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(analytics.sizeDistribution).map(([range, count]) => (
                            <div key={range} className="flex items-center justify-between">
                              <span className="text-sm">{range}</span>
                              <Badge variant="outline">{count as number}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Distribution Data</h3>
                  <p className="text-muted-foreground">Analytics are only available for successful uploads</p>
                </div>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6 mt-6">
              {analytics ? (
                <div className="space-y-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-800">Market Position</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Your average price per carat of {formatCurrency(analytics.avgPricePerCarat)} indicates a 
                            {analytics.avgPricePerCarat > 6000 ? ' premium ' : analytics.avgPricePerCarat > 3000 ? ' mid-range ' : ' entry-level '}
                            market positioning.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800">Portfolio Quality</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            {analytics.premiumCount > 0 
                              ? `${analytics.premiumCount} premium stones represent strong investment potential.`
                              : 'Consider adding higher-grade stones to enhance portfolio value.'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-purple-800">Size Analysis</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Average stone size of {analytics.avgWeight.toFixed(2)} carats is 
                            {analytics.avgWeight > 1 ? ' above market average - excellent for investment.' : ' typical for commercial diamonds.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Insights Available</h3>
                  <p className="text-muted-foreground">Insights are generated from successful uploads</p>
                </div>
              )}
            </TabsContent>

            {/* Errors Tab */}
            <TabsContent value="errors" className="space-y-6 mt-6">
              {results.errors.length > 0 ? (
                <div className="space-y-4">
                  {/* Error Summary */}
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-semibold text-red-800">Upload Issues Detected</h4>
                          <p className="text-sm text-red-700 mt-1">
                            {results.errors.length} diamonds failed to upload. Most common issue: 
                            {results.errors.filter(e => e.error.includes('Failed to fetch')).length > results.errors.length / 2 
                              ? ' Network connectivity problems'
                              : ' Data validation errors'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Error Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Failed Uploads Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64 w-full border rounded-md p-3">
                        <div className="space-y-3">
                          {results.errors.map((error, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Row {error.row}</Badge>
                                <Badge variant="destructive" className="text-xs">
                                  {error.error.includes('Failed to fetch') ? 'Network' : 'Validation'}
                                </Badge>
                              </div>
                              <p className="text-sm text-red-600 font-medium mb-1">{error.error}</p>
                              {error.data?.stock && (
                                <p className="text-xs text-muted-foreground">Stock: {error.data.stock}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700">Perfect Upload!</h3>
                  <p className="text-green-600">All diamonds were processed without any issues.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t mt-6">
            {results.successCount > 0 && (
              <Button 
                onClick={handleViewDashboard}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <LayoutDashboard className="h-4 w-4" />
                View {results.successCount} New Diamonds in Dashboard
              </Button>
            )}

            {results.errors.length > 0 && (
              <Button 
                variant="outline" 
                onClick={downloadFailedData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Failed Data ({results.errors.length})
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Upload More Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
