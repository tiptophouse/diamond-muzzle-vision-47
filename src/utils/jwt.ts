
import CryptoJS from 'crypto-js';

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export interface TelegramJWTPayload extends JWTPayload {
  telegram_user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  auth_date: number;
  hash: string;
}

// Base64 URL encode
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Base64 URL decode
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// Create JWT token
export function createJWT(payload: TelegramJWTPayload, secret: string): string {
  const header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Add standard claims
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60), // 24 hours
    iss: 'telegram-miniapp',
    jti: CryptoJS.lib.WordArray.random(16).toString()
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = CryptoJS.HmacSHA256(data, secret).toString(CryptoJS.enc.Base64);
  const encodedSignature = base64UrlEncode(signature);

  return `${data}.${encodedSignature}`;
}

// Verify JWT token
export function verifyJWT(token: string, secret: string): TelegramJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = CryptoJS.HmacSHA256(data, secret).toString(CryptoJS.enc.Base64);
    const expectedEncodedSignature = base64UrlEncode(expectedSignature);

    if (encodedSignature !== expectedEncodedSignature) {
      console.error('JWT signature verification failed');
      return null;
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TelegramJWTPayload;
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('JWT token expired');
      return null;
    }

    // Check not before
    if (payload.nbf && payload.nbf > now) {
      console.error('JWT token not yet valid');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Extract payload without verification (for debugging)
export function decodeJWT(token: string): TelegramJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(base64UrlDecode(parts[1])) as TelegramJWTPayload;
    return payload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Create JWT from Telegram initData
export function createJWTFromTelegramData(initData: string, secret: string): string | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');

    if (!userParam || !authDate || !hash) {
      console.error('Missing required Telegram data parameters');
      return null;
    }

    const user = JSON.parse(decodeURIComponent(userParam));
    
    const payload: TelegramJWTPayload = {
      telegram_user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium,
      auth_date: parseInt(authDate),
      hash: hash
    };

    return createJWT(payload, secret);
  } catch (error) {
    console.error('Failed to create JWT from Telegram data:', error);
    return null;
  }
}

// Validate Telegram hash
export function validateTelegramHash(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    // Remove hash from params
    urlParams.delete('hash');
    
    // Sort parameters
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = CryptoJS.HmacSHA256(botToken, 'WebAppData');
    
    // Calculate expected hash
    const expectedHash = CryptoJS.HmacSHA256(sortedParams, secretKey).toString(CryptoJS.enc.Hex);
    
    return hash === expectedHash;
  } catch (error) {
    console.error('Telegram hash validation error:', error);
    return false;
  }
}

// Security helper to check token freshness
export function isTokenFresh(token: string, maxAgeMinutes: number = 60): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.iat) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenAge = now - payload.iat;
  const maxAge = maxAgeMinutes * 60;

  return tokenAge <= maxAge;
}
