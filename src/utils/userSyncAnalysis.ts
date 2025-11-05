/**
 * User Sync Analysis Utility
 * Compares backend CSV data with frontend database to identify missing users
 */

export interface BackendUser {
  telegram_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  language_code: string | null;
  last_activity_at: string | null;
}

export interface SyncAnalysisResult {
  backendTotal: number;
  frontendTotal: number;
  missingInFrontend: BackendUser[];
  missingCount: number;
  matchingCount: number;
  syncPercentage: number;
}

/**
 * Parse CSV row to extract user data
 */
function parseCSVRow(row: string): BackendUser | null {
  try {
    const parts = row.split(',');
    if (parts.length < 2) return null;
    
    const telegram_id = parts[1]?.trim();
    if (!telegram_id || telegram_id === 'id') return null;
    
    const language_code = parts[2]?.trim() || null;
    const first_name = parts[3]?.trim() || null;
    const last_name = parts[4]?.trim() || null;
    const phone_number = parts[5]?.trim() || null;
    const last_activity_at = parts[6]?.trim() || null;
    
    return {
      telegram_id,
      first_name,
      last_name,
      phone_number,
      language_code,
      last_activity_at
    };
  } catch (error) {
    console.error('Error parsing CSV row:', error);
    return null;
  }
}

/**
 * Analyze sync status between backend and frontend
 */
export function analyzeSyncStatus(
  csvContent: string,
  frontendUsers: Array<{ telegram_id: number | string }>
): SyncAnalysisResult {
  // Parse CSV
  const lines = csvContent.split('\n');
  const backendUsers: BackendUser[] = [];
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const user = parseCSVRow(line);
    if (user && user.telegram_id) {
      backendUsers.push(user);
    }
  }
  
  // Create a Set of frontend telegram IDs for fast lookup
  const frontendTelegramIds = new Set(
    frontendUsers.map(u => String(u.telegram_id))
  );
  
  // Find users in backend but not in frontend
  const missingInFrontend = backendUsers.filter(
    backendUser => !frontendTelegramIds.has(backendUser.telegram_id)
  );
  
  const matchingCount = backendUsers.length - missingInFrontend.length;
  const syncPercentage = backendUsers.length > 0 
    ? (matchingCount / backendUsers.length) * 100 
    : 0;
  
  return {
    backendTotal: backendUsers.length,
    frontendTotal: frontendUsers.length,
    missingInFrontend,
    missingCount: missingInFrontend.length,
    matchingCount,
    syncPercentage
  };
}

/**
 * Generate CSV report of missing users
 */
export function generateMissingUsersCSV(missingUsers: BackendUser[]): string {
  const headers = ['Telegram ID', 'First Name', 'Last Name', 'Phone Number', 'Language', 'Last Activity'];
  const rows = [headers.join(',')];
  
  for (const user of missingUsers) {
    rows.push([
      user.telegram_id,
      user.first_name || '',
      user.last_name || '',
      user.phone_number || '',
      user.language_code || '',
      user.last_activity_at || ''
    ].join(','));
  }
  
  return rows.join('\n');
}

/**
 * Download analysis results as CSV
 */
export function downloadAnalysisReport(result: SyncAnalysisResult): void {
  const csvContent = generateMissingUsersCSV(result.missingInFrontend);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `missing_users_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
