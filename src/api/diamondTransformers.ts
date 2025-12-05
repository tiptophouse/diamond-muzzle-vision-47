/**
 * Data transformation utilities for diamond CRUD operations
 * Maps between frontend camelCase and backend snake_case
 * Enum values aligned with FastAPI OpenAPI spec
 */

import { DiamondFormData } from "@/components/inventory/form/types";

// Backend expects these exact field names (snake_case)
// Aligned with src__api__endpoints__create_diamond__DiamondCreateRequest
export interface FastAPIDiamondCreate {
  stock: string;
  shape: string;  // lowercase with spaces: "round brilliant", "princess", etc.
  weight: number;
  color: string;  // uppercase: "D", "E", "F", etc.
  clarity: string;  // uppercase: "FL", "IF", "VVS1", etc.
  certificate_number: number;
  lab?: string | null;
  length?: number | null;
  width?: number | null;
  depth?: number | null;
  ratio?: number | null;
  cut?: string | null;  // Quality enum: "EXCELLENT", "VERY GOOD", "GOOD", "POOR"
  polish: string;  // Quality enum: "EXCELLENT", "VERY GOOD", "GOOD", "POOR"
  symmetry: string;  // Quality enum: "EXCELLENT", "VERY GOOD", "GOOD", "POOR"
  fluorescence: string;  // "NONE", "FAINT", "MEDIUM", "STRONG", "VERY STRONG"
  table: number;
  depth_percentage: number;
  gridle: string;
  culet: string;  // "NONE", "VERY SMALL", "SMALL", "MEDIUM", etc.
  certificate_comment?: string | null;
  rapnet?: number | null;
  price_per_carat?: number | null;
  picture?: string | null;
}

// Aligned with DiamondUpdateRequest from OpenAPI spec
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
 * Normalize quality grade to match FastAPI Quality enum
 * Valid values: "EXCELLENT", "VERY GOOD", "GOOD", "POOR"
 */
function normalizeQuality(value: string | undefined | null): string {
  if (!value) return 'EXCELLENT';
  const upper = value.toUpperCase().trim();
  const validQualities = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'POOR'];
  if (validQualities.includes(upper)) return upper;
  // Map common variations
  if (upper === 'EX' || upper === 'EXC') return 'EXCELLENT';
  if (upper === 'VG') return 'VERY GOOD';
  if (upper === 'GD' || upper === 'G') return 'GOOD';
  if (upper === 'PR' || upper === 'P' || upper === 'FAIR') return 'POOR';
  return 'EXCELLENT';
}

/**
 * Normalize fluorescence to match FastAPI Fluorescence enum
 * Valid values: "NONE", "FAINT", "MEDIUM", "STRONG", "VERY STRONG"
 */
function normalizeFluorescence(value: string | undefined | null): string {
  if (!value) return 'NONE';
  const upper = value.toUpperCase().trim();
  const validFluor = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'VERY STRONG'];
  if (validFluor.includes(upper)) return upper;
  // Map common variations
  if (upper === 'N' || upper === 'NON') return 'NONE';
  if (upper === 'F' || upper === 'FNT') return 'FAINT';
  if (upper === 'M' || upper === 'MED') return 'MEDIUM';
  if (upper === 'S' || upper === 'STR' || upper === 'STRG') return 'STRONG';
  if (upper === 'VS' || upper === 'VST' || upper === 'VSTG') return 'VERY STRONG';
  return 'NONE';
}

/**
 * Normalize culet to match FastAPI Culet enum
 * Valid values: "NONE", "VERY SMALL", "SMALL", "MEDIUM", "SLIGHTLY LARGE", "LARGE", "VERY LARGE", "EXTREMELY LARGE"
 */
function normalizeCulet(value: string | undefined | null): string {
  if (!value) return 'NONE';
  const upper = value.toUpperCase().trim();
  const validCulets = ['NONE', 'VERY SMALL', 'SMALL', 'MEDIUM', 'SLIGHTLY LARGE', 'LARGE', 'VERY LARGE', 'EXTREMELY LARGE'];
  if (validCulets.includes(upper)) return upper;
  // Map common variations
  if (upper === 'N' || upper === 'NON') return 'NONE';
  if (upper === 'VS' || upper === 'VSM') return 'VERY SMALL';
  if (upper === 'S' || upper === 'SM' || upper === 'SML') return 'SMALL';
  if (upper === 'M' || upper === 'MED') return 'MEDIUM';
  if (upper === 'SL' || upper === 'STL') return 'SLIGHTLY LARGE';
  if (upper === 'L' || upper === 'LG' || upper === 'LRG') return 'LARGE';
  if (upper === 'VL' || upper === 'VLG') return 'VERY LARGE';
  if (upper === 'EL' || upper === 'ELG' || upper === 'XL') return 'EXTREMELY LARGE';
  return 'NONE';
}

/**
 * Normalize shape to match FastAPI Shape enum
 * Valid values are lowercase with spaces: "round brilliant", "princess", etc.
 */
function normalizeShape(value: string | undefined | null): string {
  if (!value) return 'round brilliant';
  const lower = value.toLowerCase().trim();
  const validShapes = [
    'round brilliant', 'princess', 'cushion', 'oval', 'emerald', 'pear',
    'marquise', 'asscher', 'radiant', 'heart', 'baguette', 'old european',
    'rose', 'tapered baguette', 'bullet', 'kite', 'half moons', 'trillion',
    'horse head', 'shield', 'hexagonal', 'old mine', 'rose head'
  ];
  if (validShapes.includes(lower)) return lower;
  // Map common variations
  if (lower === 'round' || lower === 'rnd' || lower === 'rb') return 'round brilliant';
  if (lower === 'pr' || lower === 'prin') return 'princess';
  if (lower === 'cu' || lower === 'cush') return 'cushion';
  if (lower === 'ov') return 'oval';
  if (lower === 'em' || lower === 'emer') return 'emerald';
  if (lower === 'ps' || lower === 'pear shape') return 'pear';
  if (lower === 'mq' || lower === 'marq') return 'marquise';
  if (lower === 'as' || lower === 'assh') return 'asscher';
  if (lower === 'ra' || lower === 'rad') return 'radiant';
  if (lower === 'ht' || lower === 'hrt') return 'heart';
  if (lower === 'bg' || lower === 'bag') return 'baguette';
  return lower; // Return as-is if no match found
}

/**
 * Transform frontend form data to FastAPI create schema
 */
export function transformToFastAPICreate(formData: DiamondFormData): FastAPIDiamondCreate {
  return {
    stock: formData.stockNumber,
    shape: normalizeShape(formData.shape),
    weight: formData.carat,
    color: (formData.color || 'D').toUpperCase(),
    clarity: (formData.clarity || 'VS1').toUpperCase(),
    certificate_number: parseInt(formData.certificateNumber || '0'),
    lab: formData.lab || null,
    length: formData.length || null,
    width: formData.width || null,
    depth: formData.depth || null,
    ratio: formData.ratio || null,
    cut: formData.cut ? normalizeQuality(formData.cut) : null,
    polish: normalizeQuality(formData.polish),
    symmetry: normalizeQuality(formData.symmetry),
    fluorescence: normalizeFluorescence(formData.fluorescence),
    table: formData.tablePercentage || 0,
    depth_percentage: formData.depthPercentage || 0,
    gridle: formData.gridle || '',
    culet: normalizeCulet(formData.culet),
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
  if (formData.shape !== undefined) update.shape = normalizeShape(formData.shape);
  if (formData.carat !== undefined) update.weight = formData.carat;
  if (formData.color !== undefined) update.color = formData.color?.toUpperCase() || null;
  if (formData.clarity !== undefined) update.clarity = formData.clarity?.toUpperCase() || null;
  if (formData.certificateNumber !== undefined) update.certificate_number = parseInt(formData.certificateNumber);
  if (formData.lab !== undefined) update.lab = formData.lab || null;
  if (formData.length !== undefined) update.length = formData.length || null;
  if (formData.width !== undefined) update.width = formData.width || null;
  if (formData.depth !== undefined) update.depth = formData.depth || null;
  if (formData.ratio !== undefined) update.ratio = formData.ratio || null;
  if (formData.cut !== undefined) update.cut = formData.cut ? normalizeQuality(formData.cut) : null;
  if (formData.polish !== undefined) update.polish = formData.polish ? normalizeQuality(formData.polish) : null;
  if (formData.symmetry !== undefined) update.symmetry = formData.symmetry ? normalizeQuality(formData.symmetry) : null;
  if (formData.fluorescence !== undefined) update.fluorescence = formData.fluorescence ? normalizeFluorescence(formData.fluorescence) : null;
  if (formData.tablePercentage !== undefined) update.table = formData.tablePercentage || null;
  if (formData.depthPercentage !== undefined) update.depth_percentage = formData.depthPercentage || null;
  if (formData.gridle !== undefined) update.gridle = formData.gridle || null;
  if (formData.culet !== undefined) update.culet = formData.culet ? normalizeCulet(formData.culet) : null;
  if (formData.certificateComment !== undefined) update.certificate_comment = formData.certificateComment || null;
  if (formData.rapnet !== undefined) update.rapnet = formData.rapnet || null;
  if (formData.pricePerCarat !== undefined) update.price_per_carat = formData.pricePerCarat || null;
  if (formData.picture !== undefined) update.picture = formData.picture || null;
  
  return update;
}

/**
 * Get diamond ID from stock number
 * FastAPI requires integer diamond_id, but we might only have stock_number
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDiamondId(diamond: any): number | null {
  if (!diamond) return null;
  
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
