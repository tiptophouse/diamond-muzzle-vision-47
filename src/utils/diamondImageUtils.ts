// Utility functions for processing diamond image URLs from various providers

// List of trusted diamond image and 360° service providers
const TRUSTED_DIAMOND_IMAGE_SERVERS = [
  'segoma.com',
  'sarine.com', 
  'gemadviser.com',
  'gia.edu',
  'diamondscreener.com',
  'my360.fab',
  'my360.sela',
  'v360.in',
  'diamondview.aspx',
  'unsplash.com' // For demo purposes
];

// Patterns that indicate 360° viewers (should be excluded from regular images)
const VIEWER_360_PATTERNS = [
  '.html',
  'diamondview.aspx',
  'v360.in',
  'my360.fab',
  'my360.sela', 
  'sarine',
  '360',
  '3d',
  'rotate'
];

/**
 * Check if a URL is from a trusted diamond image server
 */
const isTrustedDiamondServer = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return TRUSTED_DIAMOND_IMAGE_SERVERS.some(server => lowerUrl.includes(server));
};

/**
 * Check if a URL appears to be a 360° viewer
 */
const is360ViewerUrl = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return VIEWER_360_PATTERNS.some(pattern => lowerUrl.includes(pattern)) ||
         url.match(/DAN\d+-\d+[A-Z]?\.jpg$/i) !== null;
};

/**
 * Enhanced image URL processing that supports dynamic URLs from trusted diamond servers
 */
export const processImageUrl = (imageUrl: string | undefined): string | undefined => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return undefined;
  }

  const trimmedUrl = imageUrl.trim();
  
  // Skip invalid or placeholder values
  if (!trimmedUrl || 
      trimmedUrl === 'default' || 
      trimmedUrl === 'null' || 
      trimmedUrl === 'undefined' ||
      trimmedUrl.length < 10) {
    return undefined;
  }

  // Skip 360° viewers (these should go to gem360Url field instead)
  if (is360ViewerUrl(trimmedUrl)) {
    return undefined;
  }

  // Must be a valid HTTP/HTTPS URL
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return undefined;
  }

  // For trusted diamond servers, allow dynamic URLs (like .aspx)
  if (isTrustedDiamondServer(trimmedUrl)) {
    // Special handling for Segoma URLs
    if (trimmedUrl.includes('segoma.com') && trimmedUrl.includes('v.aspx')) {
      return trimmedUrl;
    }
    
    // Allow other trusted diamond server patterns
    return trimmedUrl;
  }

  // For non-trusted servers, require standard image extensions
  const hasImageExtension = trimmedUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
  const isImageServiceUrl = trimmedUrl.includes('/image') ||
                           trimmedUrl.includes('w=') || 
                           trimmedUrl.includes('h=');   

  if (hasImageExtension || isImageServiceUrl) {
    return trimmedUrl;
  }

  return undefined;
};

/**
 * Enhanced 360° URL detection and processing
 */
export const detect360Url = (url: string | undefined): string | undefined => {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmedUrl = url.trim();
  
  // Skip invalid or placeholder values
  if (!trimmedUrl || 
      trimmedUrl === 'default' || 
      trimmedUrl === 'null' || 
      trimmedUrl === 'undefined' ||
      trimmedUrl.length < 10) {
    return undefined;
  }

  // Check for 360° indicators
  if (!is360ViewerUrl(trimmedUrl)) {
    return undefined;
  }

  // Ensure proper protocol
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }

  return trimmedUrl;
};