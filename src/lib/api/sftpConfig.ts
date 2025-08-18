
// SFTP API Configuration - Updated for correct FastAPI backend
export const SFTP_CONFIG = {
  API_BASE: "http://136.0.3.22:8000",
  PREFIX: "/api/v1",
  ENDPOINTS: {
    ALIVE: "/alive",
    PROVISION: "/sftp/provision", 
    TEST_CONNECTION: "/sftp/test-connection"
  }
} as const;

export const getSftpEndpoint = (endpoint: keyof typeof SFTP_CONFIG.ENDPOINTS): string => {
  return `${SFTP_CONFIG.API_BASE}${SFTP_CONFIG.PREFIX}${SFTP_CONFIG.ENDPOINTS[endpoint]}`;
};

// Helper to get Telegram ID for SFTP operations
export const getTelegramIdForSFTP = (): string => {
  if (typeof window === 'undefined') return "2138564172"; // Server-side fallback
  
  const tg = (window as any).Telegram?.WebApp?.initDataUnsafe;
  const telegramId = tg?.user?.id ?? tg?.user?.user_id;
  
  // Local dev fallback
  if (!telegramId) {
    console.warn('No Telegram ID found, using dev fallback');
    return "2138564172";
  }
  
  return String(telegramId);
};

// Check if SFTP server is available
export const checkSftpServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SFTP_CONFIG.API_BASE}${SFTP_CONFIG.PREFIX}${SFTP_CONFIG.ENDPOINTS.ALIVE}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.error('SFTP server health check failed:', error);
    return false;
  }
};
