interface LogConfig {
  production: boolean;
  development: boolean;
  sanitizeSensitive: boolean;
}

const LOG_CONFIG: LogConfig = {
  production: false, // Disable detailed logs in production
  development: true, // Enable logs in development
  sanitizeSensitive: true, // Always sanitize sensitive data
};

// Sensitive data patterns to redact
const SENSITIVE_PATTERNS = [
  /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /token["\s:=]+[a-zA-Z0-9_\-\.]+/gi,
  /password["\s:=]+[^\s"]+/gi,
  /secret["\s:=]+[^\s"]+/gi,
  /auth["\s:=]+[a-zA-Z0-9_\-\.]+/gi,
  /telegram_id["\s:=]+\d+/gi,
  /init_data["\s:=]+[^\s"]+/gi,
];

// Fields to redact completely
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'auth',
  'authorization',
  'init_data',
  'initData',
  'telegram_id',
  'user_id',
  'bearer',
];

function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    let sanitized = data;
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(data[key]);
      }
    });
    return sanitized;
  }

  return data;
}

function shouldLog(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? LOG_CONFIG.production : LOG_CONFIG.development;
}

export const secureLog = {
  info: (message: string, data?: any) => {
    if (!shouldLog()) return;
    
    const sanitizedData = LOG_CONFIG.sanitizeSensitive && data ? sanitizeData(data) : data;
    console.log(`[INFO] ${message}`, sanitizedData);
  },

  warn: (message: string, data?: any) => {
    if (!shouldLog()) return;
    
    const sanitizedData = LOG_CONFIG.sanitizeSensitive && data ? sanitizeData(data) : data;
    console.warn(`[WARN] ${message}`, sanitizedData);
  },

  error: (message: string, data?: any) => {
    // Always log errors, but sanitize them
    const sanitizedData = LOG_CONFIG.sanitizeSensitive && data ? sanitizeData(data) : data;
    console.error(`[ERROR] ${message}`, sanitizedData);
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'production') return; // Never log debug in production
    
    const sanitizedData = LOG_CONFIG.sanitizeSensitive && data ? sanitizeData(data) : data;
    console.debug(`[DEBUG] ${message}`, sanitizedData);
  },

  // Security-specific logging that's always sanitized
  security: (event: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const sanitizedData = sanitizeData(data);
    console.warn(`[SECURITY] ${timestamp} - ${event}`, sanitizedData);
  }
};

// Utility to check if data contains sensitive information
export function containsSensitiveData(data: any): boolean {
  const dataStr = JSON.stringify(data).toLowerCase();
  return SENSITIVE_FIELDS.some(field => dataStr.includes(field));
}

// Function to redact sensitive URLs
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query parameters that might contain sensitive data
    const sensitiveParams = ['token', 'auth', 'secret', 'key', 'password'];
    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    });
    return urlObj.toString();
  } catch {
    return sanitizeData(url);
  }
}