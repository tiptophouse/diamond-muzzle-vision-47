import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Target, DollarSign, RefreshCw } from 'lucide-react';
import { useProfitOptimizer } from '@/hooks/useProfitOptimizer';
import { useInventoryData } from '@/hooks/useInventoryData';
import { formatCurrency } from '@/utils/diamondUtils';

export function ProfitOptimizerDashboard() {
  const { allDiamonds } = useInventoryData();
  const {
    marginAlerts,
    matchingOpportunities,
    arbitrageOpportunities,
    isAnalyzing,
    runProfitAnalysis
  } = useProfitOptimizer();

  // Auto-run analysis when inventory loads
  useEffect(() => {
    if (allDiamonds.length > 0) {
      runProfitAnalysis(allDiamonds);
    }
  }, [allDiamonds]);

  const totalPotentialProfit = [
    ...marginAlerts.map(m => m.marginOpportunity),
    ...matchingOpportunities.map(m => m.potentialProfit),
    ...arbitrageOpportunities.map(a => a.profitPotential)
  ].reduce((sum, profit) => sum + profit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Profit Optimizer</h2>
          <p className="text-muted-foreground">One good lead pays for months</p>
        </div>
        <Button 
          onClick={() => runProfitAnalysis(allDiamonds)}
          disabled={isAnalyzing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marginAlerts.length + matchingOpportunities.length + arbitrageOpportunities.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{marginAlerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyer Matches</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{matchingOpportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalPotentialProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Margin Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Margin Opportunities
          </CardTitle>
          <CardDescription>
            Alert when someone's asking price is significantly below market
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marginAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No margin opportunities found. Your pricing is competitive!
            </p>
          ) : (
            <div className="space-y-3">
              {marginAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{alert.diamond.stockNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {alert.diamond.carat}ct {alert.diamond.shape} {alert.diamond.color} {alert.diamond.clarity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">
                      {alert.percentageBelow.toFixed(1)}% below market
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Opportunity: {formatCurrency(alert.marginOpportunity)}
                    </div>
                  </div>
                  <Badge variant="destructive" className="ml-3">
                    {formatCurrency(alert.currentPrice)} → {formatCurrency(alert.marketPrice)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matching Engine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Buyer Matching Engine
          </CardTitle>
          <CardDescription>
            Instant notification when your inventory matches buyer requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchingOpportunities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No buyer matches found. Keep your inventory fresh!
            </p>
          ) : (
            <div className="space-y-3">
              {matchingOpportunities.slice(0, 5).map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{match.diamond.stockNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      Buyer: {match.buyerRequest.buyerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      Profit: {formatCurrency(match.potentialProfit)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Requested: {formatCurrency(match.buyerRequest.requestedPrice)}
                    </div>
                  </div>
                  <Badge variant="default" className="ml-3 bg-green-100 text-green-800">
                    Match Found
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Arbitrage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Price Arbitrage Opportunities
          </CardTitle>
          <CardDescription>
            Cross-reference your costs with market demand to spot 20%+ profit opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {arbitrageOpportunities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No high-profit arbitrage opportunities found.
            </p>
          ) : (
            <div className="space-y-3">
              {arbitrageOpportunities.slice(0, 5).map((opportunity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{opportunity.diamond.stockNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {opportunity.diamond.carat}ct {opportunity.diamond.shape}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">
                      {opportunity.profitPercentage.toFixed(1)}% profit
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Potential: {formatCurrency(opportunity.profitPotential)}
                    </div>
                  </div>
                  <Badge variant="default" className="ml-3 bg-emerald-100 text-emerald-800">
                    {opportunity.profitPercentage >= 30 ? 'High Profit' : 'Good Profit'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}