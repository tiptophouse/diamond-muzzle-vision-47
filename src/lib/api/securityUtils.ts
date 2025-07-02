import { checkRateLimit } from './rateLimiter';

interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
  securityLevel: 'high' | 'medium' | 'low';
}

export function validateInput(input: string, type: 'telegram_id' | 'text' | 'number'): SecurityValidationResult {
  // Basic input validation
  if (!input || input.length === 0) {
    return {
      isValid: false,
      error: 'Input cannot be empty',
      securityLevel: 'low'
    };
  }

  // Length validation
  if (input.length > 10000) {
    return {
      isValid: false,
      error: 'Input too long',
      securityLevel: 'low'
    };
  }

  // Type-specific validation
  switch (type) {
    case 'telegram_id':
      if (!/^\d+$/.test(input) || input.length > 15) {
        return {
          isValid: false,
          error: 'Invalid Telegram ID format',
          securityLevel: 'low'
        };
      }
      break;

    case 'number':
      if (!/^\d+(\.\d+)?$/.test(input)) {
        return {
          isValid: false,
          error: 'Invalid number format',
          securityLevel: 'low'
        };
      }
      break;

    case 'text':
      // Check for potential XSS patterns
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
      ];

      for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
          return {
            isValid: false,
            error: 'Potentially dangerous content detected',
            securityLevel: 'low'
          };
        }
      }
      break;
  }

  return {
    isValid: true,
    securityLevel: 'high'
  };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function validateApiRequest(
  userId: number,
  endpoint: string,
  userAgent?: string
): { allowed: boolean; reason?: string } {
  // Rate limiting check
  const rateLimit = checkRateLimit('api', userId.toString(), endpoint);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      reason: 'Rate limit exceeded'
    };
  }

  // User agent validation (basic bot detection)
  if (userAgent) {
    const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
    const isBot = suspiciousAgents.some(agent => 
      userAgent.toLowerCase().includes(agent)
    );
    
    if (isBot) {
      return {
        allowed: false,
        reason: 'Automated requests not allowed'
      };
    }
  }

  return { allowed: true };
}

export function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

export function logSecurityEvent(
  event: string,
  userId: number,
  details: Record<string, any>
): void {
  console.warn(`🚨 Security Event: ${event}`, {
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
}