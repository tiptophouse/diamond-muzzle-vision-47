/**
 * Data Consistency Utilities
 * 
 * Centralizes diamond ID handling and routing consistency
 * to fix data mismatch issues between different parts of the system
 */

export interface DiamondIdentifier {
  id?: string;
  stockNumber?: string;
  stock_number?: string;
  stock?: string;
}

/**
 * Normalizes diamond identifiers across the system
 * Ensures consistent ID handling between API, database, and UI
 */
export function normalizeDiamondId(diamond: DiamondIdentifier): {
  id: string;
  stockNumber: string;
} {
  // Priority order for stock number identification
  const stockNumber = diamond.stockNumber || 
                     diamond.stock_number || 
                     diamond.stock || 
                     diamond.id || 
                     'UNKNOWN';

  // Generate consistent ID if missing
  const id = diamond.id || `diamond_${stockNumber}`;

  return {
    id: String(id),
    stockNumber: String(stockNumber)
  };
}

/**
 * Creates consistent share URLs that work across the system
 */
export function createDiamondShareUrl(diamond: DiamondIdentifier, baseUrl?: string): string {
  const { stockNumber } = normalizeDiamondId(diamond);
  const base = baseUrl || window.location.origin;
  
  // Use stock number for consistency with backend
  return `${base}/diamond/${encodeURIComponent(stockNumber)}`;
}

/**
 * Validates diamond data consistency
 */
export function validateDiamondData(diamond: any): {
  isValid: boolean;
  errors: string[];
  normalized: DiamondIdentifier;
} {
  const errors: string[] = [];
  const normalized = normalizeDiamondId(diamond);

  if (!normalized.stockNumber || normalized.stockNumber === 'UNKNOWN') {
    errors.push('Missing stock number identifier');
  }

  if (!diamond.carat || diamond.carat <= 0) {
    errors.push('Invalid carat weight');
  }

  if (!diamond.shape) {
    errors.push('Missing shape information');
  }

  if (!diamond.color) {
    errors.push('Missing color information');
  }

  if (!diamond.clarity) {
    errors.push('Missing clarity information');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized
  };
}

/**
 * Ensures API endpoints use consistent identifiers
 */
export function getConsistentApiEndpoint(action: string, diamond: DiamondIdentifier, userId: number): string {
  const { stockNumber } = normalizeDiamondId(diamond);
  
  const endpoints = {
    view: `/api/v1/diamonds/${encodeURIComponent(stockNumber)}?user_id=${userId}`,
    update: `/api/v1/diamonds/${encodeURIComponent(stockNumber)}?user_id=${userId}`,
    delete: `/api/v1/diamonds/${encodeURIComponent(stockNumber)}?user_id=${userId}`,
    share: `/api/v1/diamonds/${encodeURIComponent(stockNumber)}/share?user_id=${userId}`
  };

  return endpoints[action as keyof typeof endpoints] || endpoints.view;
}

/**
 * Standardizes diamond data format for consistency across components
 */
export function standardizeDiamondFormat(rawDiamond: any): any {
  const { id, stockNumber } = normalizeDiamondId(rawDiamond);
  
  return {
    ...rawDiamond,
    id,
    stockNumber,
    // Ensure consistent field naming
    carat: Number(rawDiamond.carat || rawDiamond.weight || 0),
    price: Number(rawDiamond.price || rawDiamond.total_price || 0),
    imageUrl: rawDiamond.imageUrl || rawDiamond.image_url || rawDiamond.Image || rawDiamond.picture,
    certificateUrl: rawDiamond.certificateUrl || rawDiamond.certificate_url,
    gem360Url: rawDiamond.gem360Url || rawDiamond.gem360_url || rawDiamond.v360_url
  };
}