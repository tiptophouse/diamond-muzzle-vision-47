import { toast } from "@/components/ui/use-toast";

// Input sanitization utilities
export const InputValidator = {
  // Sanitize text input to prevent XSS
  sanitizeText: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 1000); // Limit length
  },

  // Validate and sanitize numeric input
  sanitizeNumber: (input: any, min = 0, max = Number.MAX_SAFE_INTEGER): number | null => {
    const num = parseFloat(input);
    if (isNaN(num) || num < min || num > max) {
      return null;
    }
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  },

  // Validate stock number format
  validateStockNumber: (stockNumber: string): { isValid: boolean; message?: string } => {
    if (!stockNumber || typeof stockNumber !== 'string') {
      return { isValid: false, message: 'Stock number is required' };
    }

    const sanitized = stockNumber.trim();
    
    if (sanitized.length < 1) {
      return { isValid: false, message: 'Stock number cannot be empty' };
    }

    if (sanitized.length > 50) {
      return { isValid: false, message: 'Stock number too long (max 50 characters)' };
    }

    // Allow alphanumeric, hyphens, underscores only
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      return { isValid: false, message: 'Stock number can only contain letters, numbers, hyphens, and underscores' };
    }

    return { isValid: true };
  },

  // Validate carat weight
  validateCarat: (carat: any): { isValid: boolean; value?: number; message?: string } => {
    const num = InputValidator.sanitizeNumber(carat, 0.01, 50);
    
    if (num === null) {
      return { isValid: false, message: 'Carat must be between 0.01 and 50' };
    }

    return { isValid: true, value: num };
  },

  // Validate price
  validatePrice: (price: any): { isValid: boolean; value?: number; message?: string } => {
    const num = InputValidator.sanitizeNumber(price, 0, 10000000);
    
    if (num === null) {
      return { isValid: false, message: 'Price must be between 0 and 10,000,000' };
    }

    return { isValid: true, value: num };
  },

  // Validate URL format
  validateUrl: (url: string): { isValid: boolean; message?: string } => {
    if (!url) return { isValid: true }; // Optional field
    
    const sanitized = url.trim();
    
    try {
      const urlObj = new URL(sanitized);
      
      // Only allow https URLs for security
      if (urlObj.protocol !== 'https:') {
        return { isValid: false, message: 'Only HTTPS URLs are allowed' };
      }

      // Block potentially malicious domains
      const blockedDomains = ['javascript', 'data', 'file', 'ftp'];
      if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return { isValid: false, message: 'Invalid URL domain' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, message: 'Invalid URL format' };
    }
  },

  // Validate certificate number
  validateCertificateNumber: (certNumber: string): { isValid: boolean; message?: string } => {
    if (!certNumber) return { isValid: true }; // Optional field
    
    const sanitized = certNumber.trim();
    
    if (sanitized.length > 20) {
      return { isValid: false, message: 'Certificate number too long (max 20 characters)' };
    }

    if (!/^[a-zA-Z0-9]+$/.test(sanitized)) {
      return { isValid: false, message: 'Certificate number can only contain letters and numbers' };
    }

    return { isValid: true };
  },

  // Comprehensive form validation
  validateDiamondForm: (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required field validations
    const stockValidation = InputValidator.validateStockNumber(data.stockNumber);
    if (!stockValidation.isValid) {
      errors.push(stockValidation.message || 'Invalid stock number');
    }

    const caratValidation = InputValidator.validateCarat(data.carat);
    if (!caratValidation.isValid) {
      errors.push(caratValidation.message || 'Invalid carat weight');
    }

    const priceValidation = InputValidator.validatePrice(data.price);
    if (!priceValidation.isValid) {
      errors.push(priceValidation.message || 'Invalid price');
    }

    // Optional field validations
    if (data.certificateUrl) {
      const urlValidation = InputValidator.validateUrl(data.certificateUrl);
      if (!urlValidation.isValid) {
        errors.push(urlValidation.message || 'Invalid certificate URL');
      }
    }

    if (data.certificateNumber) {
      const certValidation = InputValidator.validateCertificateNumber(data.certificateNumber);
      if (!certValidation.isValid) {
        errors.push(certValidation.message || 'Invalid certificate number');
      }
    }

    // Additional validations for other numeric fields
    const numericFields = ['length', 'width', 'depth', 'ratio', 'tablePercentage', 'depthPercentage'];
    numericFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        const num = InputValidator.sanitizeNumber(data[field], 0, 1000);
        if (num === null) {
          errors.push(`${field} must be a valid number between 0 and 1000`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }
};

// Rate limiting for form submissions
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxAttempts = 5; // 5 attempts per minute

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeRemaining = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, timeRemaining);
  }
}

export const formRateLimiter = new RateLimiter();

// Helper function to show validation errors
export function showValidationErrors(errors: string[]): void {
  if (errors.length > 0) {
    toast({
      title: "Validation Error",
      description: errors.join('. '),
      variant: "destructive",
    });
  }
}

// Helper function to sanitize entire form data
export function sanitizeFormData(data: any): any {
  const sanitized: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string') {
      sanitized[key] = InputValidator.sanitizeText(value);
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else {
      sanitized[key] = value; // Keep other types as-is
    }
  });
  
  return sanitized;
}