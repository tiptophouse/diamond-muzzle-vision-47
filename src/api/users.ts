import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

export interface BlockedUser {
  id: string;
  telegram_id: number;
  blocked_by_telegram_id: number;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BlockUserParams {
  telegramId: number;
  blockedByTelegramId: number;
  reason?: string;
}

/**
 * Block a user by their Telegram ID
 */
export async function blockUser({ telegramId, blockedByTelegramId, reason }: BlockUserParams): Promise<BlockedUser> {
  logger.info('Blocking user', { telegramId, blockedByTelegramId });
  
  try {
    // Check if user is already blocked
    const { data: existing } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    if (existing) {
      logger.warn('User already blocked', { telegramId });
      throw new Error('User is already blocked');
    }
    
    // Insert blocked user record
    const { data, error } = await supabase
      .from('blocked_users')
      .insert({
        telegram_id: telegramId,
        blocked_by_telegram_id: blockedByTelegramId,
        reason: reason || 'No reason provided'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logger.info('User blocked successfully', { telegramId, data });
    return data as BlockedUser;
  } catch (error: any) {
    logger.error('Failed to block user', error, { telegramId });
    throw new Error(error.message || 'Failed to block user');
  }
}

/**
 * Unblock a user by their Telegram ID
 */
export async function unblockUser(telegramId: number): Promise<void> {
  logger.info('Unblocking user', { telegramId });
  
  try {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('telegram_id', telegramId);
    
    if (error) throw error;
    
    logger.info('User unblocked successfully', { telegramId });
  } catch (error: any) {
    logger.error('Failed to unblock user', error, { telegramId });
    throw new Error(error.message || 'Failed to unblock user');
  }
}

/**
 * Check if a user is blocked
 */
export async function isUserBlocked(telegramId: number): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    return !!data;
  } catch (error: any) {
    logger.error('Failed to check block status', error, { telegramId });
    return false;
  }
}

/**
 * Get all blocked users (admin only)
 */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
  logger.info('Fetching all blocked users');
  
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    logger.info('Blocked users fetched', { count: data?.length || 0 });
    return (data || []) as BlockedUser[];
  } catch (error: any) {
    logger.error('Failed to fetch blocked users', error);
    throw new Error(error.message || 'Failed to fetch blocked users');
  }
}

/**
 * Get blocked user details
 */
export async function getBlockedUser(telegramId: number): Promise<BlockedUser | null> {
  try {
    const { data } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    return data as BlockedUser | null;
  } catch (error: any) {
    logger.error('Failed to get blocked user', error, { telegramId });
    return null;
  }
}
