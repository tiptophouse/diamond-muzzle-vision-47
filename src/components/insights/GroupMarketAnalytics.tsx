
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGroupAnalytics } from '@/hooks/useGroupAnalytics';
import { RefreshCw, TrendingUp, Target, Users, DollarSign } from 'lucide-react';

export function GroupMarketAnalytics() {
  const { analyzeGroupActivity, getStoredAnalytics, isLoading, data } = useGroupAnalytics();
  const [storedAnalytics, setStoredAnalytics] = useState<any[]>([]);

  useEffect(() => {
    loadStoredAnalytics();
  }, []);

  const loadStoredAnalytics = async () => {
    const analytics = await getStoredAnalytics();
    setStoredAnalytics(analytics);
  };

  const handleAnalyze = async () => {
    await analyzeGroupActivity();
    await loadStoredAnalytics();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Telegram Group Market Analysis
              </CardTitle>
              <CardDescription>
                AI-powered insights from diamond group discussions
              </CardDescription>
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Analyzing...' : 'Analyze Now'}
            </Button>
          </div>
        </CardHeader>
        
        {data && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.total_requests}</div>
                <div className="text-sm text-blue-600">Diamond Requests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.matching_opportunities.length}</div>
                <div className="text-sm text-green-600">Matching Opportunities</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{data.market_insights.length}</div>
                <div className="text-sm text-purple-600">AI Insights</div>
              </div>
            </div>

            {data.market_insights.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Market Insights
                </h3>
                
                {data.market_insights.map((insight: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-blue-900">Market Demand</h4>
                        <p className="text-sm text-gray-700">{insight.market_demand}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-green-900">Price Trends</h4>
                        <p className="text-sm text-gray-700">{insight.price_trends}</p>
                      </div>
                      
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium text-purple-900">Recommendations</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {insight.recommendations.map((rec: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-sm font-medium">Opportunity Score: </span>
                          <Badge 
                            variant={insight.opportunity_score > 7 ? "default" : insight.opportunity_score > 4 ? "secondary" : "outline"}
                            className="ml-1"
                          >
                            {insight.opportunity_score}/10
                          </Badge>
                        </div>
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {data.matching_opportunities.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Your Matching Opportunities
                </h3>
                
                {data.matching_opportunities.map((opp: any, index: number) => (
                  <Card key={index} className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">
                            {opp.request.shape || 'Any'} Diamond Request
                          </h4>
                          <p className="text-sm text-gray-600">
                            {opp.request.carat_min && `${opp.request.carat_min}-${opp.request.carat_max || opp.request.carat_min}ct`}
                            {opp.request.color && ` • ${opp.request.color.toUpperCase()}`}
                            {opp.request.clarity && ` • ${opp.request.clarity.toUpperCase()}`}
                            {opp.request.price_max && ` • Max $${opp.request.price_max.toLocaleString()}`}
                          </p>
                        </div>
                        <Badge variant="default">
                          {opp.matching_diamonds.length} Matches
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Your Matching Inventory:</h5>
                        {opp.matching_diamonds.slice(0, 3).map((diamond: any, i: number) => (
                          <div key={i} className="text-xs bg-white p-2 rounded border">
                            {diamond.stock_number} • {diamond.shape} {diamond.weight}ct • 
                            {diamond.color} {diamond.clarity} • ${(diamond.price_per_carat * diamond.weight).toLocaleString()}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {storedAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Analysis History</CardTitle>
            <CardDescription>Your past group analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {storedAnalytics.slice(0, 5).map((analytics: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(analytics.analysis_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {analytics.total_requests} requests • {analytics.matching_opportunities} opportunities
                    </div>
                  </div>
                  <Badge variant="outline">
                    {analytics.matching_opportunities > 0 ? 'Opportunities Found' : 'No Matches'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
