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
    shape: formData.shape.toLowerCase(), // Backend expects lowercase
    weight: formData.carat,
    color: formData.color,
    clarity: formData.clarity,
    certificate_number: parseInt(formData.certificateNumber || '0'),
    lab: formData.lab || null,
    length: formData.length || null,
    width: formData.width || null,
    depth: formData.depth || null,
    ratio: formData.ratio || 1.01, // Default ratio if not provided
    cut: formData.cut || null,
    polish: (formData.polish || 'Good').toUpperCase(),
    symmetry: (formData.symmetry || 'Good').toUpperCase(),
    fluorescence: (formData.fluorescence || 'None').toUpperCase(),
    table: (formData.tablePercentage && formData.tablePercentage > 0) ? formData.tablePercentage : 57,
    depth_percentage: (formData.depthPercentage && formData.depthPercentage > 0) ? formData.depthPercentage : 61,
    gridle: formData.gridle || '',
    culet: (formData.culet || 'NONE').toUpperCase(),
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
  if (formData.shape !== undefined) update.shape = formData.shape.toLowerCase(); // Backend expects lowercase
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
  if (formData.polish !== undefined) update.polish = formData.polish ? formData.polish.toUpperCase() : null;
  if (formData.symmetry !== undefined) update.symmetry = formData.symmetry ? formData.symmetry.toUpperCase() : null;
  if (formData.fluorescence !== undefined) update.fluorescence = formData.fluorescence ? formData.fluorescence.toUpperCase() : null;
  if (formData.tablePercentage !== undefined) update.table = (formData.tablePercentage && formData.tablePercentage > 0) ? formData.tablePercentage : null;
  if (formData.depthPercentage !== undefined) update.depth_percentage = (formData.depthPercentage && formData.depthPercentage > 0) ? formData.depthPercentage : null;
  if (formData.gridle !== undefined) update.gridle = formData.gridle || null;
  if (formData.culet !== undefined) update.culet = formData.culet ? formData.culet.toUpperCase() : null;
  if (formData.certificateComment !== undefined) update.certificate_comment = formData.certificateComment || null;
  if (formData.rapnet !== undefined) update.rapnet = formData.rapnet || null;
  if (formData.pricePerCarat !== undefined) update.price_per_carat = formData.pricePerCarat || null;
  if (formData.picture !== undefined) update.picture = formData.picture || null;
  
  return update;
}

/**
 * Get diamond ID from stock number
 * FastAPI requires integer diamond_id, but we might only have stock_number
 * This needs to query the inventory to find the ID
 */
export function extractDiamondId(diamond: any): number | null {
  // Try multiple possible ID fields
  if (diamond.id && typeof diamond.id === 'number') return diamond.id;
  if (diamond.diamondId && typeof diamond.diamondId === 'number') return diamond.diamondId;
  if (diamond.diamond_id && typeof diamond.diamond_id === 'number') return diamond.diamond_id;
  
  // Try to parse string IDs
  if (diamond.id && typeof diamond.id === 'string') {
    const parsed = parseInt(diamond.id);
    if (!isNaN(parsed)) return parsed;
  }
  
  return null;
}
