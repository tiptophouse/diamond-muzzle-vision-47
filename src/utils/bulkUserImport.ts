import { supabase } from '@/integrations/supabase/client';

export interface CsvUser {
  telegram_id: string;
  language_code: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  last_activity_at: string | null;
}

/**
 * Parse CSV content into user objects
 */
export function parseCsvUsers(csvContent: string): CsvUser[] {
  const lines = csvContent.trim().split('\n');
  const users: CsvUser[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // CSV format: column 2 is telegram_id, 3 is language_code, 4 is first_name, 5 is last_name, 6 is phone_number, 7 is last_activity_at
    const parts = line.split(',');
    
    if (parts.length < 2) continue;
    
    const telegram_id = parts[1]?.trim();
    if (!telegram_id || telegram_id === 'id') continue;

    const language_code = parts[2]?.trim() || null;
    const first_name = parts[3]?.trim() || null;
    const last_name = parts[4]?.trim() || null;
    const phone_number = parts[5]?.trim() || null;
    const last_activity_at = parts[6]?.trim() || null;

    users.push({
      telegram_id,
      language_code,
      first_name,
      last_name,
      phone_number,
      last_activity_at
    });
  }

  return users;
}

/**
 * Get existing telegram IDs from the database
 */
export async function getExistingUsers(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('telegram_id');

  if (error) {
    console.error('Error fetching existing users:', error);
    return new Set();
  }

  return new Set(data.map(u => String(u.telegram_id)));
}

/**
 * Find users that don't exist in the database
 */
export function findMissingUsers(csvUsers: CsvUser[], existingIds: Set<string>): CsvUser[] {
  return csvUsers.filter(user => !existingIds.has(user.telegram_id));
}

/**
 * Import users into the database in batches
 */
export async function importUsers(
  users: CsvUser[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  const batchSize = 50;
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    
    const insertData = batch.map(user => ({
      telegram_id: Number(user.telegram_id),
      first_name: user.first_name || 'User',
      last_name: user.last_name || '',
      language_code: user.language_code || 'en',
      phone_number: user.phone_number || null,
      is_premium: false,
      subscription_status: 'free'
    }));

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(insertData)
      .select();

    if (error) {
      failed += batch.length;
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      console.error(`Error importing batch:`, error);
    } else {
      success += data?.length || 0;
    }

    if (onProgress) {
      onProgress(Math.min(i + batchSize, users.length), users.length);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { success, failed, errors };
}

/**
 * Process CSV file and import missing users
 */
export async function processCsvAndImport(
  file: File,
  onProgress?: (phase: string, current: number, total: number) => void
): Promise<{
  totalInCsv: number;
  existingUsers: number;
  missingUsers: number;
  imported: number;
  failed: number;
  errors: string[];
}> {
  // Read CSV file
  const csvContent = await file.text();
  
  onProgress?.('Parsing CSV', 0, 100);
  const csvUsers = parseCsvUsers(csvContent);
  
  onProgress?.('Fetching existing users', 30, 100);
  const existingIds = await getExistingUsers();
  
  onProgress?.('Finding missing users', 50, 100);
  const missingUsers = findMissingUsers(csvUsers, existingIds);
  
  if (missingUsers.length === 0) {
    return {
      totalInCsv: csvUsers.length,
      existingUsers: existingIds.size,
      missingUsers: 0,
      imported: 0,
      failed: 0,
      errors: []
    };
  }
  
  onProgress?.('Importing users', 60, 100);
  const result = await importUsers(missingUsers, (current, total) => {
    const progress = 60 + (current / total) * 40;
    onProgress?.('Importing users', progress, 100);
  });
  
  onProgress?.('Complete', 100, 100);
  
  return {
    totalInCsv: csvUsers.length,
    existingUsers: existingIds.size,
    missingUsers: missingUsers.length,
    imported: result.success,
    failed: result.failed,
    errors: result.errors
  };
}
