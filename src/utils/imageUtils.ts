// Utility functions for handling diamond images consistently across the app

import { Diamond } from "@/components/inventory/InventoryTable";

/**
 * Get the best available image URL from a diamond object
 * Checks multiple possible image fields in priority order
 */
export function getImageUrl(diamond: Diamond): string | undefined {
  // Priority order: imageUrl → picture → Image → image → gem360Url (if not 360 viewer)
  const candidates = [
    diamond.imageUrl,
    diamond.picture,
    diamond.Image,
    diamond.image,
    // Only use gem360Url if it's not a 360 viewer link
    diamond.gem360Url && !is360ViewerUrl(diamond.gem360Url) ? diamond.gem360Url : undefined
  ];

  // Find the first valid URL
  for (const url of candidates) {
    if (url && url.trim() && url !== 'null' && url !== 'undefined') {
      return url.trim();
    }
  }

  return undefined;
}

/**
 * Get fallback image URL for a diamond
 */
export function getFallbackImageUrl(stockNumber: string): string {
  return `https://miniapp.mazalbot.com/api/diamond-image/${stockNumber}`;
}

/**
 * Check if a URL is a 360° viewer link
 */
export function is360ViewerUrl(url: string): boolean {
  return url.includes('v360') || url.includes('360') || url.includes('viewer');
}

/**
 * Get video/360° URL from diamond
 */
export function get360Url(diamond: Diamond): string | undefined {
  const candidates = [
    diamond.gem360Url,
    diamond['Video link'],
    diamond.videoLink
  ];

  for (const url of candidates) {
    if (url && url.trim() && url !== 'null') {
      return url.trim();
    }
  }

  return undefined;
}

/**
 * Check if diamond has any image available
 */
export function hasImage(diamond: Diamond): boolean {
  return !!getImageUrl(diamond);
}

/**
 * Check if diamond has 360° view available
 */
export function has360View(diamond: Diamond): boolean {
  return !!get360Url(diamond);
}