/**
 * Diamond Routing Hook
 * 
 * Handles consistent diamond navigation and URL generation
 * Uses the data consistency utilities to ensure proper routing
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  normalizeDiamondId, 
  createDiamondShareUrl, 
  validateDiamondData,
  type DiamondIdentifier 
} from '@/lib/dataConsistency';

export function useDiamondRouting() {
  const navigate = useNavigate();

  const navigateToDetails = useCallback((diamond: DiamondIdentifier) => {
    const { stockNumber } = normalizeDiamondId(diamond);
    navigate(`/diamond/${encodeURIComponent(stockNumber)}`);
  }, [navigate]);

  const navigateToEdit = useCallback((diamond: DiamondIdentifier) => {
    const { stockNumber } = normalizeDiamondId(diamond);
    navigate(`/edit-diamond/${encodeURIComponent(stockNumber)}`);
  }, [navigate]);

  const generateShareUrl = useCallback((diamond: DiamondIdentifier, baseUrl?: string) => {
    return createDiamondShareUrl(diamond, baseUrl);
  }, []);

  const validateBeforeAction = useCallback((diamond: any, action: string) => {
    const validation = validateDiamondData(diamond);
    
    if (!validation.isValid) {
      console.error(`Cannot ${action} diamond: ${validation.errors.join(', ')}`);
      return { 
        success: false, 
        errors: validation.errors,
        normalized: validation.normalized
      };
    }

    return { 
      success: true, 
      errors: [],
      normalized: validation.normalized
    };
  }, []);

  const getConsistentDiamondId = useCallback((diamond: DiamondIdentifier) => {
    return normalizeDiamondId(diamond);
  }, []);

  return {
    navigateToDetails,
    navigateToEdit,
    generateShareUrl,
    validateBeforeAction,
    getConsistentDiamondId
  };
}