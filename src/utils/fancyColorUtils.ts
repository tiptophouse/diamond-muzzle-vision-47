
// Utility functions for fancy color diamond detection and formatting

export interface FancyColorInfo {
  isFancyColor: boolean;
  colorDescription: string;
  intensity?: string;
  hue?: string;
}

// Fancy color intensity levels (from lowest to highest value)
const FANCY_INTENSITIES = [
  'faint',
  'very light',
  'light',
  'fancy light',
  'fancy',
  'fancy intense',
  'fancy vivid',
  'fancy deep'
];

// Common fancy color hues
const FANCY_HUES = [
  'yellow', 'orange', 'brown', 'pink', 'red', 'purple', 'violet',
  'blue', 'green', 'gray', 'black', 'white', 'champagne', 'cognac'
];

export function detectFancyColor(colorValue: string): FancyColorInfo {
  if (!colorValue) {
    return { isFancyColor: false, colorDescription: colorValue || 'Unknown' };
  }

  const colorLower = colorValue.toLowerCase().trim();
  
  // Check if it's a standard D-Z grade
  const isStandardGrade = /^[d-z]$/.test(colorLower) || 
    ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].includes(colorLower);
  
  if (isStandardGrade) {
    return { isFancyColor: false, colorDescription: colorValue };
  }

  // Check if it contains fancy color terminology
  const hasFancyIntensity = FANCY_INTENSITIES.some(intensity => 
    colorLower.includes(intensity.toLowerCase())
  );
  
  const hasFancyHue = FANCY_HUES.some(hue => 
    colorLower.includes(hue.toLowerCase())
  );

  // If it contains "fancy" or known fancy color terms, it's a fancy color
  const isFancyColor = colorLower.includes('fancy') || 
    hasFancyIntensity || 
    hasFancyHue ||
    colorLower.includes('champagne') ||
    colorLower.includes('cognac') ||
    colorLower.includes('canary');

  if (isFancyColor) {
    // Extract intensity and hue if possible
    const intensity = FANCY_INTENSITIES.find(int => 
      colorLower.includes(int.toLowerCase())
    );
    
    const hue = FANCY_HUES.find(h => 
      colorLower.includes(h.toLowerCase())
    );

    return {
      isFancyColor: true,
      colorDescription: colorValue,
      intensity: intensity ? intensity.charAt(0).toUpperCase() + intensity.slice(1) : undefined,
      hue: hue ? hue.charAt(0).toUpperCase() + hue.slice(1) : undefined
    };
  }

  return { isFancyColor: false, colorDescription: colorValue };
}

export function formatFancyColorDescription(colorInfo: FancyColorInfo): string {
  if (!colorInfo.isFancyColor) {
    return colorInfo.colorDescription;
  }

  // If we already have a well-formatted description, return it
  if (colorInfo.colorDescription.toLowerCase().includes('fancy')) {
    return colorInfo.colorDescription;
  }

  // Try to construct a proper fancy color description
  if (colorInfo.intensity && colorInfo.hue) {
    return `Fancy ${colorInfo.intensity} ${colorInfo.hue}`;
  }

  return colorInfo.colorDescription;
}

// Check if a diamond likely has a cut grade (only round brilliants typically get GIA cut grades)
export function shouldShowCutGrade(shape: string, cut: string): boolean {
  if (!cut || cut.toLowerCase() === 'unknown') return false;
  
  const shapeL = shape.toLowerCase();
  const cutL = cut.toLowerCase();
  
  // Only show cut grade for round brilliants or if explicitly graded
  return shapeL.includes('round') || 
    ['excellent', 'very good', 'good', 'fair', 'poor'].includes(cutL);
}

// Format polish/symmetry for display
export function formatPolishSymmetry(polish?: string, symmetry?: string): string | null {
  if (!polish && !symmetry) return null;
  
  if (polish && symmetry && polish === symmetry) {
    return `${polish} Polish & Symmetry`;
  }
  
  const parts = [];
  if (polish) parts.push(`${polish} Polish`);
  if (symmetry) parts.push(`${symmetry} Symmetry`);
  
  return parts.join(' • ');
}
