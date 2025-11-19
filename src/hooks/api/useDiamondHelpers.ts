/**
 * Helper utilities for diamond operations
 * Extracts diamond_id and ensures proper type conversion
 */

import { Diamond } from '@/components/inventory/InventoryTable';

/**
 * Extracts the integer diamond_id from a diamond object
 * FastAPI backend requires integer diamond_id for update/delete operations
 */
export function getDiamondId(diamond: Diamond | any): number {
  // Try multiple possible field names from FastAPI response
  const id = 
    (diamond as any).diamond_id ||
    (diamond as any).id ||
    (diamond as any).diamondId;
  
  if (!id) {
    console.error('❌ Diamond ID not found in object:', diamond);
    throw new Error('Diamond ID is required but not found. Please ensure the backend returns diamond_id.');
  }
  
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  if (isNaN(numericId) || numericId === 0) {
    console.error('❌ Invalid diamond ID:', id, 'from diamond:', diamond);
    throw new Error(`Invalid diamond ID: ${id}. Expected a non-zero integer.`);
  }
  
  return numericId;
}

/**
 * Checks if a diamond has a valid ID for CRUD operations
 */
export function hasDiamondId(diamond: Diamond | any): boolean {
  try {
    getDiamondId(diamond);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets stock number from diamond object
 */
export function getStockNumber(diamond: Diamond | any): string {
  return diamond.stockNumber || diamond.stock_number || diamond.stock || '';
}
