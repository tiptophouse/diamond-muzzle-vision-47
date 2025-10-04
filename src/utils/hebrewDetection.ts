/**
 * Hebrew Text Detection Utilities
 * Automatically detects Hebrew text and applies RTL styling
 */

/**
 * Check if a string contains Hebrew characters
 */
export function containsHebrew(text: string): boolean {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
}

/**
 * Check if text is primarily Hebrew (>50% Hebrew characters)
 */
export function isPrimaryHebrewText(text: string): boolean {
  if (!text || text.length === 0) return false;
  
  const hebrewChars = text.match(/[\u0590-\u05FF]/g);
  const hebrewCount = hebrewChars ? hebrewChars.length : 0;
  const totalChars = text.replace(/\s/g, '').length;
  
  return totalChars > 0 && (hebrewCount / totalChars) > 0.5;
}

/**
 * Get the appropriate direction for text content
 */
export function getTextDirection(text: string): 'ltr' | 'rtl' | 'auto' {
  if (!text) return 'ltr';
  
  if (isPrimaryHebrewText(text)) {
    return 'rtl';
  }
  
  if (containsHebrew(text)) {
    return 'auto'; // Let browser handle mixed content
  }
  
  return 'ltr';
}

/**
 * Apply Hebrew styling props to a component
 * Returns props object with dir and lang attributes if Hebrew is detected
 */
export function getHebrewProps(text: string) {
  const direction = getTextDirection(text);
  
  if (direction === 'rtl') {
    return {
      dir: 'rtl' as const,
      lang: 'he',
      className: 'hebrew-text'
    };
  }
  
  if (direction === 'auto') {
    return {
      dir: 'auto' as const,
      className: 'text-auto'
    };
  }
  
  return {};
}

/**
 * React hook for automatic Hebrew detection
 */
export function useHebrewDetection(text: string | undefined) {
  if (!text) return { isHebrew: false, dir: 'ltr' as const, props: {} };
  
  const isHebrew = containsHebrew(text);
  const isPrimary = isPrimaryHebrewText(text);
  const dir = getTextDirection(text);
  const props = getHebrewProps(text);
  
  return {
    isHebrew,
    isPrimaryHebrew: isPrimary,
    dir,
    props
  };
}
