
// SFTP API client for FastAPI backend
import { checkSftpServerHealth, SFTP_CONFIG } from './sftpConfig';

const SFTP_API_BASE = SFTP_CONFIG.API_BASE;
const SFTP_API_PREFIX = SFTP_CONFIG.PREFIX;

export interface ProvisionResponse {
  success: boolean;
  credentials: {
    host: string;
    port: number;
    username: string;
    password: string;
    folder_path: string;
  };
  account: {
    telegram_id: string | number;
    ftp_username: string;
    ftp_folder_path: string;
    status: "active" | "inactive";
    created_at: string;
    expires_at: string;
  };
}

export interface TestConnectionResponse {
  status: "success" | "failed" | "pending";
  last_event?: string;
}

export interface AliveResponse {
  ok: boolean;
}

// Get Telegram ID with fallback for local dev
function getTelegramId(): string {
  if (typeof window === 'undefined') return "2138564172"; // Server-side fallback
  
  const tg = (window as any).Telegram?.WebApp?.initDataUnsafe;
  const telegramId = tg?.user?.id ?? tg?.user?.user_id;
  
  // Local dev fallback
  if (!telegramId) {
    console.warn('No Telegram ID found, using dev fallback');
    return "2138564172";
  }
  
  return String(telegramId);
}

// API call helper with proper error handling
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${SFTP_API_BASE}${SFTP_API_PREFIX}${endpoint}`;
  
  console.log('🚀 SFTP API Call:', url, options.method || 'GET');
  
  // First check if server is healthy
  const isHealthy = await checkSftpServerHealth();
  if (!isHealthy) {
    throw new Error('SFTP server is currently unavailable. Please try again later or contact support.');
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        // Keep the original error message if parsing fails
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ SFTP API Response:', data);
    return data as T;
    
  } catch (error) {
    console.error('❌ SFTP API Error:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`SFTP server at ${SFTP_API_BASE} is not responding. Please check your internet connection or try again later.`);
    }
    
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('SFTP server request timed out. Please try again later.');
    }
    
    throw error;
  }
}

export const sftpApi = {
  // Health check
  async alive(): Promise<AliveResponse> {
    return apiCall<AliveResponse>('/alive', { method: 'GET' });
  },

  // Provision SFTP credentials
  async provision(telegramId?: string): Promise<ProvisionResponse> {
    const telegram_id = telegramId || getTelegramId();
    
    return apiCall<ProvisionResponse>('/sftp/provision', {
      method: 'POST',
      body: JSON.stringify({ telegram_id }),
    });
  },

  // Test SFTP connection
  async testConnection(telegramId?: string): Promise<TestConnectionResponse> {
    const telegram_id = telegramId || getTelegramId();
    
    return apiCall<TestConnectionResponse>('/sftp/test-connection', {
      method: 'POST',
      body: JSON.stringify({ telegram_id }),
    });
  },
};
