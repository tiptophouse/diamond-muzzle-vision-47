import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useROICalculator } from '@/hooks/useROICalculator';
import { DollarSign, TrendingUp, Calendar, AlertTriangle, Target, Zap } from 'lucide-react';

interface ROIDashboardProps {
  diamonds: Diamond[];
}

export function ROIDashboard({ diamonds }: ROIDashboardProps) {
  const roiMetrics = useROICalculator(diamonds);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600';
    if (riskScore < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore < 30) return 'Low Risk';
    if (riskScore < 60) return 'Medium Risk';
    return 'High Risk';
  };

  if (diamonds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No ROI Data Available</h3>
          <p className="text-muted-foreground text-center">
            Add diamonds to your inventory to see detailed ROI analysis and projections.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(roiMetrics.totalInvestment)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Annual Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(roiMetrics.projectedRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {roiMetrics.profitMargin}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual ROI</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {roiMetrics.yearlyROI.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly: {roiMetrics.monthlyROI.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break-Even</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {roiMetrics.breakEvenTime.toFixed(1)}mo
            </div>
            <p className="text-xs text-muted-foreground">
              Time to recover investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Risk Assessment</CardTitle>
          <CardDescription>Analysis of investment risk and portfolio diversification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`h-6 w-6 ${getRiskColor(roiMetrics.riskScore)}`} />
                <div>
                  <p className="font-medium">Risk Level</p>
                  <p className="text-sm text-muted-foreground">
                    Based on diversification and concentration
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${getRiskColor(roiMetrics.riskScore)} bg-opacity-10`}>
                  {getRiskLevel(roiMetrics.riskScore)}
                </Badge>
                <div className="mt-2 w-32">
                  <Progress value={100 - roiMetrics.riskScore} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Safety Score: {(100 - roiMetrics.riskScore).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Projections</CardTitle>
          <CardDescription>Monthly revenue and profit projections based on current inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(roiMetrics.projectedRevenue / 12)}
              </div>
              <p className="text-sm font-medium">Monthly Revenue</p>
              <p className="text-xs text-muted-foreground">Average projected</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency((roiMetrics.projectedRevenue * roiMetrics.profitMargin / 100) / 12)}
              </div>
              <p className="text-sm font-medium">Monthly Profit</p>
              <p className="text-xs text-muted-foreground">After expenses</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(roiMetrics.projectedRevenue * roiMetrics.profitMargin / 100)}
              </div>
              <p className="text-sm font-medium">Annual Profit</p>
              <p className="text-xs text-muted-foreground">Net income</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 ROI Optimization Recommendations</CardTitle>
          <CardDescription>Actionable steps to improve your return on investment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roiMetrics.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-900 dark:text-blue-100">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Benchmarks</CardTitle>
          <CardDescription>How your portfolio compares to industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Monthly ROI</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{roiMetrics.monthlyROI.toFixed(1)}%</span>
                <Badge variant={roiMetrics.monthlyROI > 2 ? "default" : "secondary"}>
                  {roiMetrics.monthlyROI > 2 ? "Above Average" : "Below Average"}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Break-Even Time</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{roiMetrics.breakEvenTime.toFixed(1)} months</span>
                <Badge variant={roiMetrics.breakEvenTime < 6 ? "default" : "secondary"}>
                  {roiMetrics.breakEvenTime < 6 ? "Fast Recovery" : "Standard"}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Annual ROI</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{roiMetrics.yearlyROI.toFixed(1)}%</span>
                <Badge variant={roiMetrics.yearlyROI > 25 ? "default" : "secondary"}>
                  {roiMetrics.yearlyROI > 25 ? "Excellent" : "Good"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}