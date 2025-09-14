import { useState, useCallback } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useToast } from '@/hooks/use-toast';

interface SearchCriteria {
  shape?: string;
  color?: string;
  clarity?: string;
  weight_min?: number;
  weight_max?: number;
  price_min?: number;
  price_max?: number;
}

interface QuickSearchResult {
  matches: Diamond[];
  searchText: string;
  criteriaUsed: SearchCriteria;
}

export function useInventoryQuickSearch(allDiamonds: Diamond[]) {
  const { toast } = useToast();
  const [lastSearch, setLastSearch] = useState<QuickSearchResult | null>(null);

  const searchByCriteria = useCallback((criteria: SearchCriteria): QuickSearchResult => {
    let filtered = allDiamonds;
    const usedCriteria: SearchCriteria = {};
    const searchTexts: string[] = [];

    // Apply shape filter
    if (criteria.shape && criteria.shape.trim()) {
      const normalizedShape = criteria.shape.toLowerCase().trim();
      filtered = filtered.filter(diamond => 
        diamond.shape.toLowerCase() === normalizedShape
      );
      usedCriteria.shape = criteria.shape;
      searchTexts.push(`צורה: ${criteria.shape}`);
    }

    // Apply color filter
    if (criteria.color && criteria.color.trim()) {
      const normalizedColor = criteria.color.toUpperCase().trim();
      filtered = filtered.filter(diamond => 
        diamond.color.toUpperCase() === normalizedColor
      );
      usedCriteria.color = criteria.color;
      searchTexts.push(`צבע: ${criteria.color}`);
    }

    // Apply clarity filter
    if (criteria.clarity && criteria.clarity.trim()) {
      const normalizedClarity = criteria.clarity.toUpperCase().trim();
      filtered = filtered.filter(diamond => 
        diamond.clarity.toUpperCase() === normalizedClarity
      );
      usedCriteria.clarity = criteria.clarity;
      searchTexts.push(`זכות: ${criteria.clarity}`);
    }

    // Apply weight range filter
    if (criteria.weight_min !== undefined && criteria.weight_min > 0) {
      filtered = filtered.filter(diamond => diamond.carat >= criteria.weight_min!);
      usedCriteria.weight_min = criteria.weight_min;
    }
    
    if (criteria.weight_max !== undefined && criteria.weight_max > 0) {
      filtered = filtered.filter(diamond => diamond.carat <= criteria.weight_max!);
      usedCriteria.weight_max = criteria.weight_max;
    }

    if (criteria.weight_min !== undefined || criteria.weight_max !== undefined) {
      const min = criteria.weight_min || 0;
      const max = criteria.weight_max || '∞';
      searchTexts.push(`משקל: ${min}-${max} קראט`);
    }

    // Apply price range filter
    if (criteria.price_min !== undefined && criteria.price_min > 0) {
      filtered = filtered.filter(diamond => diamond.price >= criteria.price_min!);
      usedCriteria.price_min = criteria.price_min;
    }
    
    if (criteria.price_max !== undefined && criteria.price_max > 0) {
      filtered = filtered.filter(diamond => diamond.price <= criteria.price_max!);
      usedCriteria.price_max = criteria.price_max;
    }

    if (criteria.price_min !== undefined || criteria.price_max !== undefined) {
      const min = criteria.price_min ? `$${criteria.price_min.toLocaleString()}` : '$0';
      const max = criteria.price_max ? `$${criteria.price_max.toLocaleString()}` : '∞';
      searchTexts.push(`מחיר: ${min}-${max}`);
    }

    const result: QuickSearchResult = {
      matches: filtered,
      searchText: searchTexts.join(', ') || 'חיפוש כללי',
      criteriaUsed: usedCriteria
    };

    setLastSearch(result);
    
    // Show toast with results
    toast({
      title: `🔍 נמצאו ${filtered.length} יהלומים`,
      description: result.searchText,
    });

    return result;
  }, [allDiamonds, toast]);

  const parseNotificationCriteria = useCallback((notification: any): SearchCriteria => {
    const criteria: SearchCriteria = {};
    
    try {
      // Try to parse search_query if it's JSON
      if (notification.data?.search_query) {
        const parsed = JSON.parse(notification.data.search_query);
        
        if (parsed.shape) criteria.shape = parsed.shape;
        if (parsed.color) criteria.color = parsed.color;
        if (parsed.clarity) criteria.clarity = parsed.clarity;
        if (parsed.weight_min) criteria.weight_min = parseFloat(parsed.weight_min);
        if (parsed.weight_max) criteria.weight_max = parseFloat(parsed.weight_max);
        if (parsed.price_min) criteria.price_min = parseFloat(parsed.price_min);
        if (parsed.price_max) criteria.price_max = parseFloat(parsed.price_max);
      }
      
      // Also check search_criteria object
      if (notification.data?.search_criteria) {
        const searchCriteria = notification.data.search_criteria;
        
        if (searchCriteria.shape) criteria.shape = searchCriteria.shape;
        if (searchCriteria.color) criteria.color = searchCriteria.color;
        if (searchCriteria.clarity) criteria.clarity = searchCriteria.clarity;
        if (searchCriteria.weight_min) criteria.weight_min = parseFloat(searchCriteria.weight_min);
        if (searchCriteria.weight_max) criteria.weight_max = parseFloat(searchCriteria.weight_max);
        if (searchCriteria.price_min) criteria.price_min = parseFloat(searchCriteria.price_min);
        if (searchCriteria.price_max) criteria.price_max = parseFloat(searchCriteria.price_max);
      }

      // Extract from diamonds_data if available (top match criteria)
      if (notification.data?.diamonds_data && notification.data.diamonds_data.length > 0) {
        const topMatch = notification.data.diamonds_data[0];
        if (!criteria.shape && topMatch.shape) criteria.shape = topMatch.shape;
        if (!criteria.color && topMatch.color) criteria.color = topMatch.color;
        if (!criteria.clarity && topMatch.clarity) criteria.clarity = topMatch.clarity;
      }

    } catch (error) {
      console.error('Error parsing notification criteria:', error);
    }

    return criteria;
  }, []);

  const searchFromNotification = useCallback((notification: any): QuickSearchResult => {
    const criteria = parseNotificationCriteria(notification);
    return searchByCriteria(criteria);
  }, [parseNotificationCriteria, searchByCriteria]);

  const createQuickReplyButtons = useCallback((notification: any) => {
    const criteria = parseNotificationCriteria(notification);
    const buttons = [];

    // Create specific search buttons based on available criteria
    if (criteria.shape && criteria.color && criteria.clarity) {
      buttons.push({
        text: `${criteria.shape} ${criteria.color} ${criteria.clarity}`,
        criteria: { shape: criteria.shape, color: criteria.color, clarity: criteria.clarity }
      });
    }

    if (criteria.shape && criteria.weight_min && criteria.weight_max) {
      buttons.push({
        text: `${criteria.shape} ${criteria.weight_min}-${criteria.weight_max}ct`,
        criteria: { shape: criteria.shape, weight_min: criteria.weight_min, weight_max: criteria.weight_max }
      });
    }

    if (criteria.color && criteria.clarity) {
      buttons.push({
        text: `${criteria.color} ${criteria.clarity}`,
        criteria: { color: criteria.color, clarity: criteria.clarity }
      });
    }

    if (criteria.shape) {
      buttons.push({
        text: `כל ${criteria.shape}`,
        criteria: { shape: criteria.shape }
      });
    }

    // Add full criteria search
    if (Object.keys(criteria).length > 0) {
      buttons.push({
        text: 'חיפוש מלא',
        criteria: criteria
      });
    }

    return buttons;
  }, [parseNotificationCriteria]);

  return {
    searchByCriteria,
    searchFromNotification,
    parseNotificationCriteria,
    createQuickReplyButtons,
    lastSearch,
  };
}