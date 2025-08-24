import { useState, useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MarginAlert {
  diamond: Diamond;
  marketPrice: number;
  currentPrice: number;
  marginOpportunity: number;
  percentageBelow: number;
}

export interface MatchingOpportunity {
  diamond: Diamond;
  buyerRequest: {
    id: string;
    criteria: any;
    buyerName: string;
    requestedPrice: number;
  };
  potentialProfit: number;
}

export interface ArbitrageOpportunity {
  diamond: Diamond;
  costPrice: number;
  marketDemand: number;
  profitPotential: number;
  profitPercentage: number;
}

export function useProfitOptimizer() {
  const [marginAlerts, setMarginAlerts] = useState<MarginAlert[]>([]);
  const [matchingOpportunities, setMatchingOpportunities] = useState<MatchingOpportunity[]>([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Analyze margin opportunities - when selling price is below market
  const analyzeMarginOpportunities = async (inventory: Diamond[]) => {
    if (!inventory.length) return [];

    const alerts: MarginAlert[] = [];
    
    for (const diamond of inventory) {
      // Simulate market price calculation (in real app, this would come from market data API)
      const marketPrice = calculateMarketPrice(diamond);
      const marginDifference = marketPrice - diamond.price;
      const percentageBelow = ((marketPrice - diamond.price) / marketPrice) * 100;

      if (percentageBelow > 15) { // Alert if priced 15%+ below market
        alerts.push({
          diamond,
          marketPrice,
          currentPrice: diamond.price,
          marginOpportunity: marginDifference,
          percentageBelow
        });
      }
    }

    return alerts.sort((a, b) => b.marginOpportunity - a.marginOpportunity);
  };

  // Find matching opportunities between inventory and buyer requests
  const findMatchingOpportunities = async (inventory: Diamond[]) => {
    try {
      // In real implementation, this would query a buyer requests database
      const mockBuyerRequests = generateMockBuyerRequests();
      const opportunities: MatchingOpportunity[] = [];

      for (const diamond of inventory) {
        for (const request of mockBuyerRequests) {
          if (isMatch(diamond, request.criteria)) {
            const potentialProfit = request.requestedPrice - diamond.price;
            if (potentialProfit > 0) {
              opportunities.push({
                diamond,
                buyerRequest: request,
                potentialProfit
              });
            }
          }
        }
      }

      return opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
    } catch (error) {
      console.error('Error finding matching opportunities:', error);
      return [];
    }
  };

  // Identify price arbitrage opportunities (20%+ profit potential)
  const identifyArbitrageOpportunities = async (inventory: Diamond[]) => {
    const opportunities: ArbitrageOpportunity[] = [];

    for (const diamond of inventory) {
      const costPrice = diamond.price * 0.85; // Assume 85% of listing price is cost
      const marketDemand = calculateMarketDemand(diamond);
      const profitPotential = marketDemand - costPrice;
      const profitPercentage = ((marketDemand - costPrice) / costPrice) * 100;

      if (profitPercentage >= 20) {
        opportunities.push({
          diamond,
          costPrice,
          marketDemand,
          profitPotential,
          profitPercentage
        });
      }
    }

    return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
  };

  // Calculate estimated market price based on diamond characteristics
  const calculateMarketPrice = (diamond: Diamond): number => {
    let basePrice = diamond.price;
    
    // Price adjustments based on characteristics
    const shapeMultiplier = getShapeMultiplier(diamond.shape);
    const colorMultiplier = getColorMultiplier(diamond.color);
    const clarityMultiplier = getClarityMultiplier(diamond.clarity);
    
    return basePrice * shapeMultiplier * colorMultiplier * clarityMultiplier;
  };

  // Calculate market demand pricing
  const calculateMarketDemand = (diamond: Diamond): number => {
    const marketPrice = calculateMarketPrice(diamond);
    const demandMultiplier = getDemandMultiplier(diamond);
    return marketPrice * demandMultiplier;
  };

  // Helper functions for market analysis
  const getShapeMultiplier = (shape: string): number => {
    const multipliers: Record<string, number> = {
      'Round': 1.2,
      'Princess': 1.1,
      'Cushion': 1.15,
      'Emerald': 1.05,
      'Oval': 1.1,
      'Pear': 1.0,
      'Marquise': 0.95,
      'Radiant': 1.05,
      'Asscher': 1.0,
      'Heart': 0.9
    };
    return multipliers[shape] || 1.0;
  };

  const getColorMultiplier = (color: string): number => {
    const multipliers: Record<string, number> = {
      'D': 1.3, 'E': 1.25, 'F': 1.2, 'G': 1.15, 'H': 1.1,
      'I': 1.05, 'J': 1.0, 'K': 0.95, 'L': 0.9, 'M': 0.85
    };
    return multipliers[color] || 1.0;
  };

  const getClarityMultiplier = (clarity: string): number => {
    const multipliers: Record<string, number> = {
      'FL': 1.4, 'IF': 1.35, 'VVS1': 1.25, 'VVS2': 1.2,
      'VS1': 1.15, 'VS2': 1.1, 'SI1': 1.05, 'SI2': 1.0,
      'I1': 0.9, 'I2': 0.8, 'I3': 0.7
    };
    return multipliers[clarity] || 1.0;
  };

  const getDemandMultiplier = (diamond: Diamond): number => {
    // Higher demand for popular sizes and characteristics
    if (diamond.carat >= 1.0 && diamond.carat <= 2.0) return 1.3;
    if (diamond.carat >= 0.5 && diamond.carat < 1.0) return 1.2;
    if (diamond.shape === 'Round' && diamond.color <= 'H') return 1.25;
    return 1.1;
  };

  // Generate mock buyer requests (in real app, this would come from database)
  const generateMockBuyerRequests = () => [
    {
      id: '1',
      criteria: { shape: 'Round', caratMin: 1.0, caratMax: 2.0, colorMax: 'H', clarityMin: 'VS1' },
      buyerName: 'Premium Jewelry Store',
      requestedPrice: 8000
    },
    {
      id: '2', 
      criteria: { shape: 'Princess', caratMin: 0.5, caratMax: 1.5, colorMax: 'I', clarityMin: 'SI1' },
      buyerName: 'Wholesale Diamonds Inc',
      requestedPrice: 4500
    },
    {
      id: '3',
      criteria: { shape: 'Cushion', caratMin: 1.5, caratMax: 3.0, colorMax: 'G', clarityMin: 'VVS2' },
      buyerName: 'Elite Diamond Collection',
      requestedPrice: 15000
    }
  ];

  // Check if diamond matches buyer criteria
  const isMatch = (diamond: Diamond, criteria: any): boolean => {
    if (criteria.shape && diamond.shape !== criteria.shape) return false;
    if (criteria.caratMin && diamond.carat < criteria.caratMin) return false;
    if (criteria.caratMax && diamond.carat > criteria.caratMax) return false;
    if (criteria.colorMax && diamond.color > criteria.colorMax) return false;
    if (criteria.clarityMin && diamond.clarity < criteria.clarityMin) return false;
    return true;
  };

  // Send Telegram notification for high-value opportunities
  const sendOpportunityAlert = async (opportunity: MarginAlert | MatchingOpportunity | ArbitrageOpportunity) => {
    try {
      let message = '';
      
      if ('marginOpportunity' in opportunity) {
        message = `🚨 MARGIN ALERT: ${opportunity.diamond.stockNumber} is priced ${opportunity.percentageBelow.toFixed(1)}% below market! Potential extra profit: $${opportunity.marginOpportunity.toFixed(0)}`;
      } else if ('potentialProfit' in opportunity) {
        message = `🎯 MATCH FOUND: ${opportunity.diamond.stockNumber} matches buyer request from ${opportunity.buyerRequest.buyerName}. Potential profit: $${opportunity.potentialProfit.toFixed(0)}`;
      } else {
        message = `💰 ARBITRAGE OPPORTUNITY: ${opportunity.diamond.stockNumber} has ${opportunity.profitPercentage.toFixed(1)}% profit potential. Estimated profit: $${opportunity.profitPotential.toFixed(0)}`;
      }

      await supabase.functions.invoke('send-telegram-message', {
        body: { message }
      });
    } catch (error) {
      console.error('Error sending opportunity alert:', error);
    }
  };

  // Main analysis function
  const runProfitAnalysis = async (inventory: Diamond[]) => {
    setIsAnalyzing(true);
    
    try {
      const [margins, matches, arbitrage] = await Promise.all([
        analyzeMarginOpportunities(inventory),
        findMatchingOpportunities(inventory), 
        identifyArbitrageOpportunities(inventory)
      ]);

      setMarginAlerts(margins);
      setMatchingOpportunities(matches);
      setArbitrageOpportunities(arbitrage);

      // Send alerts for top opportunities
      if (margins.length > 0) {
        await sendOpportunityAlert(margins[0]);
      }
      if (matches.length > 0) {
        await sendOpportunityAlert(matches[0]);
      }
      if (arbitrage.length > 0) {
        await sendOpportunityAlert(arbitrage[0]);
      }

      const totalOpportunities = margins.length + matches.length + arbitrage.length;
      
      toast({
        title: "💎 Profit Analysis Complete",
        description: `Found ${totalOpportunities} profit opportunities. Check your dashboard for details.`,
      });

    } catch (error) {
      console.error('Error running profit analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete profit analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    marginAlerts,
    matchingOpportunities,
    arbitrageOpportunities,
    isAnalyzing,
    runProfitAnalysis,
    sendOpportunityAlert
  };
}