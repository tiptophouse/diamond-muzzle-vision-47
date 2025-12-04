/**
 * Data transformation utilities for diamond CRUD operations
 * Maps between frontend camelCase and backend snake_case
 */

import { DiamondFormData } from "@/components/inventory/form/types";

// Backend expects these exact field names (snake_case)
export interface FastAPIDiamondCreate {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  certificate_number: number;
  lab?: string | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  ratio?: number | null;
  cut?: string | null;
  polish: string;
  symmetry: string;
  fluorescence: string;
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;
  certificate_comment?: string | null;
  rapnet?: number | null;
  price_per_carat?: number | null;
  picture?: string | null;
}

export interface FastAPIDiamondUpdate {
  stock?: string | null;
  shape?: string | null;
  weight?: number | null;
  color?: string | null;
  clarity?: string | null;
  lab?: string | null;
  certificate_number?: number | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  ratio?: number | null;
  cut?: string | null;
  polish?: string | null;
  symmetry?: string | null;
  fluorescence?: string | null;
  table?: number | null;
  depth_percentage?: number | null;
  gridle?: string | null;
  culet?: string | null;
  certificate_comment?: string | null;
  rapnet?: number | null;
  price_per_carat?: number | null;
  picture?: string | null;
  store_visible?: boolean | null;
}

/**
 * Transform frontend form data to FastAPI create schema
 */
export function transformToFastAPICreate(formData: DiamondFormData): FastAPIDiamondCreate {
  return {
    stock: formData.stockNumber,
    shape: formData.shape,
    weight: formData.carat,
    color: formData.color,
    clarity: formData.clarity,
    certificate_number: parseInt(formData.certificateNumber || '0'),
    lab: formData.lab || null,
    length: formData.length || null,
    width: formData.width || null,
    depth: formData.depth || null,
    ratio: formData.ratio || null,
    cut: formData.cut || null,
    polish: formData.polish || 'GOOD',
    symmetry: formData.symmetry || 'GOOD',
    fluorescence: formData.fluorescence || 'NONE',
    table: formData.tablePercentage || 0,
    depth_percentage: formData.depthPercentage || 0,
    gridle: formData.gridle || '',
    culet: formData.culet || 'NONE',
    certificate_comment: formData.certificateComment || null,
    rapnet: formData.rapnet || null,
    price_per_carat: formData.pricePerCarat || null,
    picture: formData.picture || null,
  };
}

/**
 * Transform frontend form data to FastAPI update schema
 */
export function transformToFastAPIUpdate(formData: Partial<DiamondFormData>): FastAPIDiamondUpdate {
  const update: FastAPIDiamondUpdate = {};
  
  if (formData.stockNumber !== undefined) update.stock = formData.stockNumber;
  if (formData.shape !== undefined) update.shape = formData.shape;
  if (formData.carat !== undefined) update.weight = formData.carat;
  if (formData.color !== undefined) update.color = formData.color;
  if (formData.clarity !== undefined) update.clarity = formData.clarity;
  if (formData.certificateNumber !== undefined) update.certificate_number = parseInt(formData.certificateNumber);
  if (formData.lab !== undefined) update.lab = formData.lab || null;
  if (formData.length !== undefined) update.length = formData.length || null;
  if (formData.width !== undefined) update.width = formData.width || null;
  if (formData.depth !== undefined) update.depth = formData.depth || null;
  if (formData.ratio !== undefined) update.ratio = formData.ratio || null;
  if (formData.cut !== undefined) update.cut = formData.cut || null;
  if (formData.polish !== undefined) update.polish = formData.polish || null;
  if (formData.symmetry !== undefined) update.symmetry = formData.symmetry || null;
  if (formData.fluorescence !== undefined) update.fluorescence = formData.fluorescence || null;
  if (formData.tablePercentage !== undefined) update.table = formData.tablePercentage || null;
  if (formData.depthPercentage !== undefined) update.depth_percentage = formData.depthPercentage || null;
  if (formData.gridle !== undefined) update.gridle = formData.gridle || null;
  if (formData.culet !== undefined) update.culet = formData.culet || null;
  if (formData.certificateComment !== undefined) update.certificate_comment = formData.certificateComment || null;
  if (formData.rapnet !== undefined) update.rapnet = formData.rapnet || null;
  if (formData.pricePerCarat !== undefined) update.price_per_carat = formData.pricePerCarat || null;
  if (formData.picture !== undefined) update.picture = formData.picture || null;
  
  return update;
}

/**
 * Get diamond ID from diamond object
 * FastAPI requires integer diamond_id
 * Handles various field names and types from different data sources
 */
export function extractDiamondId(diamond: any): number | null {
  if (!diamond) {
    console.warn('⚠️ extractDiamondId: diamond object is null/undefined');
    return null;
  }

  // Priority order for ID fields
  const idFields = ['diamond_id', 'diamondId', 'id', 'inventory_id', 'inventoryId'];
  
  for (const field of idFields) {
    const value = diamond[field];
    
    if (value === undefined || value === null) continue;
    
    // Direct number
    if (typeof value === 'number' && !isNaN(value) && value > 0) {
      console.log(`✅ extractDiamondId: Found ID ${value} in field '${field}'`);
      return value;
    }
    
    // String that can be parsed to number
    if (typeof value === 'string') {
      // Handle composite IDs like "user_123_diamond_456" - extract last number
      const matches = value.match(/(\d+)/g);
      if (matches && matches.length > 0) {
        // Take the last numeric segment (likely the actual diamond ID)
        const parsed = parseInt(matches[matches.length - 1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          console.log(`✅ extractDiamondId: Parsed ID ${parsed} from field '${field}' value '${value}'`);
          return parsed;
        }
      }
    }
  }
  
  // Log available fields for debugging
  const availableFields = Object.keys(diamond).filter(k => 
    ['id', 'diamond_id', 'diamondId', 'inventory_id', 'stock', 'stockNumber', 'stock_number'].includes(k)
  );
  console.warn('⚠️ extractDiamondId: Could not extract numeric ID. Available fields:', availableFields, 'Values:', 
    availableFields.map(f => `${f}=${diamond[f]}`).join(', '));
  
  return null;
}
