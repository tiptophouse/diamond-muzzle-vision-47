import { z } from 'zod';

/**
 * SECURITY: Validation schemas for FastAPI authentication
 * These ensure that all data sent to and received from the backend is properly validated
 */

// Telegram initData validation schema
export const telegramInitDataSchema = z.string()
  .min(50, 'InitData must be at least 50 characters')
  .max(10000, 'InitData exceeds maximum length')
  .refine((data) => {
    // Validate that initData contains required Telegram fields
    try {
      const params = new URLSearchParams(data);
      return params.has('user') && params.has('hash') && params.has('auth_date');
    } catch {
      return false;
    }
  }, 'InitData must contain valid Telegram authentication parameters (user, hash, auth_date)');

// Sign-in request validation schema
export const signInRequestSchema = z.object({
  init_data: telegramInitDataSchema
});

// Sign-in response validation schema (matches FastAPI OpenAPI spec)
export const signInResponseSchema = z.object({
  token: z.string().min(1, 'Token cannot be empty'),
  has_subscription: z.boolean()
});

// Export types for TypeScript
export type SignInRequest = z.infer<typeof signInRequestSchema>;
export type SignInResponse = z.infer<typeof signInResponseSchema>;

/**
 * Validate Telegram initData before sending to backend
 * @throws {Error} If initData is invalid
 */
export function validateInitData(initData: string): void {
  try {
    telegramInitDataSchema.parse(initData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new Error(`Invalid Telegram initData: ${messages}`);
    }
    throw error;
  }
}

/**
 * Validate sign-in response from backend
 * @throws {Error} If response is invalid
 */
export function validateSignInResponse(response: unknown): SignInResponse {
  try {
    return signInResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid backend response: ${messages}`);
    }
    throw error;
  }
}

/**
 * Extract and validate user data from Telegram initData
 */
export function extractTelegramUser(initData: string): {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
} | null {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (!userParam) {
      console.error('❌ VALIDATION: No user parameter in initData');
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userParam));
    
    // Validate required fields
    if (!user.id || typeof user.id !== 'number') {
      console.error('❌ VALIDATION: Invalid user ID');
      return null;
    }
    
    if (!user.first_name || typeof user.first_name !== 'string') {
      console.error('❌ VALIDATION: Invalid first name');
      return null;
    }
    
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium,
      photo_url: user.photo_url
    };
  } catch (error) {
    console.error('❌ VALIDATION: Failed to extract user from initData:', error);
    return null;
  }
}
