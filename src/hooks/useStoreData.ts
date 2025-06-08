
import { useState, useEffect, useMemo } from "react";
import { fetchInventoryData } from "@/services/inventoryDataService";
import { convertDiamondsToInventoryFormat } from "@/services/diamondAnalytics";

export function useStoreData(filters: any, sortBy: string) {
  const [loading, setLoading] = useState(true);
  const [allDiamonds, setAllDiamonds] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchInventoryData();
        
        if (result.error) {
          setError(result.error);
          setAllDiamonds([]);
          return;
        }
        
        if (result.data && result.data.length > 0) {
          // Convert to display format and filter for store visible items only
          const convertedDiamonds = convertDiamondsToInventoryFormat(result.data, 0)
            .filter(diamond => 
              diamond.status?.toLowerCase() === 'available' && 
              diamond.store_visible === true
            );
          
          setAllDiamonds(convertedDiamonds);
        } else {
          setAllDiamonds([]);
        }
      } catch (err) {
        console.error('Store data loading error:', err);
        setError('Failed to load diamond collection');
        setAllDiamonds([]);
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, []);

  const filteredAndSortedDiamonds = useMemo(() => {
    let filtered = [...allDiamonds];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(diamond =>
        diamond.shape?.toLowerCase().includes(searchLower) ||
        diamond.color?.toLowerCase().includes(searchLower) ||
        diamond.clarity?.toLowerCase().includes(searchLower) ||
        diamond.cut?.toLowerCase().includes(searchLower) ||
        diamond.lab?.toLowerCase().includes(searchLower)
      );
    }

    // Apply shape filter
    if (filters.shape.length > 0) {
      filtered = filtered.filter(diamond => 
        filters.shape.includes(diamond.shape)
      );
    }

    // Apply color filter
    const colorIndex = (color: string) => {
      const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      return colors.indexOf(color);
    };
    
    const minColorIndex = colorIndex(filters.color[0]);
    const maxColorIndex = colorIndex(filters.color[1]);
    
    filtered = filtered.filter(diamond => {
      const diamondColorIndex = colorIndex(diamond.color);
      return diamondColorIndex >= minColorIndex && diamondColorIndex <= maxColorIndex;
    });

    // Apply clarity filter
    if (filters.clarity.length > 0) {
      filtered = filtered.filter(diamond => 
        filters.clarity.includes(diamond.clarity)
      );
    }

    // Apply cut filter
    if (filters.cut.length > 0) {
      filtered = filtered.filter(diamond => 
        filters.cut.includes(diamond.cut)
      );
    }

    // Apply carat filter
    filtered = filtered.filter(diamond => 
      diamond.carat >= filters.carat[0] && diamond.carat <= filters.carat[1]
    );

    // Apply price filter
    filtered = filtered.filter(diamond => 
      diamond.price >= filters.price[0] && diamond.price <= filters.price[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'carat-asc':
        filtered.sort((a, b) => a.carat - b.carat);
        break;
      case 'carat-desc':
        filtered.sort((a, b) => b.carat - a.carat);
        break;
      default:
        break;
    }

    return filtered;
  }, [allDiamonds, filters, sortBy]);

  return {
    diamonds: filteredAndSortedDiamonds,
    loading,
    error,
  };
}
