interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockedUntil?: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getKey(identifier: string, endpoint: string): string {
    return `${identifier}:${endpoint}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      // Clean up expired entries
      if (entry.blocked && entry.blockedUntil && now > entry.blockedUntil) {
        this.requests.delete(key);
      } else if (!entry.blocked && now - entry.firstRequest > this.config.windowMs) {
        this.requests.delete(key);
      }
    }
  }

  public isAllowed(identifier: string, endpoint: string): boolean {
    this.cleanup();
    
    const key = this.getKey(identifier, endpoint);
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry) {
      // First request
      this.requests.set(key, {
        count: 1,
        firstRequest: now,
        blocked: false
      });
      return true;
    }

    // Check if blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }

    // Reset if window expired
    if (now - entry.firstRequest > this.config.windowMs) {
      this.requests.set(key, {
        count: 1,
        firstRequest: now,
        blocked: false
      });
      return true;
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true;
      entry.blockedUntil = now + this.config.blockDuration;
      return false;
    }

    return true;
  }

  public getRemainingRequests(identifier: string, endpoint: string): number {
    const key = this.getKey(identifier, endpoint);
    const entry = this.requests.get(key);
    
    if (!entry) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - entry.count);
  }

  public getResetTime(identifier: string, endpoint: string): number | null {
    const key = this.getKey(identifier, endpoint);
    const entry = this.requests.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.blocked && entry.blockedUntil) {
      return entry.blockedUntil;
    }

    return entry.firstRequest + this.config.windowMs;
  }
}

// Rate limiter configurations for different endpoints
export const rateLimiters = {
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    blockDuration: 30 * 60 * 1000 // 30 minutes
  }),
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    blockDuration: 5 * 60 * 1000 // 5 minutes
  }),
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    blockDuration: 10 * 60 * 1000 // 10 minutes
  }),
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    blockDuration: 5 * 60 * 1000 // 5 minutes
  })
};

export function checkRateLimit(
  type: keyof typeof rateLimiters,
  identifier: string,
  endpoint: string
): { allowed: boolean; remaining: number; resetTime: number | null } {
  const limiter = rateLimiters[type];
  const allowed = limiter.isAllowed(identifier, endpoint);
  const remaining = limiter.getRemainingRequests(identifier, endpoint);
  const resetTime = limiter.getResetTime(identifier, endpoint);

  if (!allowed) {
    console.warn(`🚨 Rate limit exceeded for ${identifier} on ${endpoint}`);
  }

  return { allowed, remaining, resetTime };
}

export function createRateLimitHeaders(
  remaining: number,
  resetTime: number | null
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': remaining.toString(),
  };

  if (resetTime) {
    headers['X-RateLimit-Reset'] = Math.ceil(resetTime / 1000).toString();
  }

  return headers;
}