
import { api } from "@/lib/api";
import { getAuthHeaders, getBackendAuthToken } from "@/lib/api/auth";

export type SFTPProvisionResponse = {
  username: string;
  password: string;
  host: string;
  port: number;
  upload_dir: string;
  expires_at: string;
  status: string;
  connection_test: boolean;
  // Backward compatibility with old API format
  sftp_server?: string;
  test_result?: boolean;
};

export type SFTPCredentials = {
  host: string;
  port: number;
  username: string;
  password: string;
  folder_path: string;
  upload_dir?: string;
  expires_at?: string;
  status?: string;
  test_result: boolean;
};

export async function getSftpStatus(telegramId: number): Promise<SFTPCredentials | null> {
  console.log('🔍 SFTP: Checking existing SFTP status for user:', telegramId);
  
  const jwtToken = getBackendAuthToken();
  if (!jwtToken) {
    console.error('❌ SFTP: No JWT token available for SFTP status check');
    throw new Error('JWT authentication required for SFTP status check');
  }
  
  const response = await api.get<SFTPProvisionResponse>(`/api/v1/sftp/status/${telegramId}`);
  
  if (response.error) {
    console.log('ℹ️ SFTP: No existing credentials found or error:', response.error);
    return null;
  }
  
  if (!response.data) {
    console.log('ℹ️ SFTP: No existing credentials found');
    return null;
  }
  
  const data = response.data;
  console.log('✅ SFTP: Existing credentials found:', {
    server: data.sftp_server || data.host,
    username: data.username,
    testResult: data.test_result || data.connection_test
  });
  
  return {
    host: data.host || data.sftp_server || 'sftp.brilliantbot.com',
    port: data.port || 22,
    username: data.username,
    password: data.password,
    folder_path: data.upload_dir || `/home/${data.username}/inbox`,
    upload_dir: data.upload_dir,
    expires_at: data.expires_at,
    status: data.status,
    test_result: data.connection_test ?? data.test_result ?? false
  };
}

export async function provisionSftp(telegramId: number): Promise<SFTPCredentials> {
  console.log('🔐 SFTP: Starting JWT authenticated SFTP provision for user:', telegramId);
  
  // CRITICAL: Ensure JWT authentication is available
  const jwtToken = getBackendAuthToken();
  if (!jwtToken) {
    console.error('❌ SFTP: No JWT token available for SFTP provision');
    throw new Error('JWT authentication required for SFTP provision. Please ensure you are accessing this app through Telegram.');
  }
  
  console.log('✅ SFTP: JWT token available for authenticated request');
  
  try {
    // Get proper JWT authentication headers
    const authHeaders = await getAuthHeaders();
    console.log('🔐 SFTP: JWT authentication headers prepared for SFTP endpoint');
    
    // Make direct authenticated request to SFTP provision endpoint
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mazalbot.com';
    const response = await fetch(`${API_BASE_URL}/api/v1/sftp/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...authHeaders, // Include JWT Bearer token and other auth headers
      },
      body: JSON.stringify({
        telegram_id: telegramId
      }),
    });
    
    console.log('📡 SFTP: Response status:', response.status);
    
    if (response.status === 401 || response.status === 403) {
      console.error('❌ SFTP: Authentication failed - JWT token invalid or expired');
      throw new Error('Authentication failed: Please refresh the app and try again. Make sure you are accessing this through Telegram.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SFTP: JWT authenticated provision failed:', response.status, errorText);
      throw new Error(`SFTP provision failed: ${response.status} ${response.statusText}`);
    }
    
    const data: SFTPProvisionResponse = await response.json();
    console.log('✅ SFTP: JWT authenticated provision response received:', {
      host: data.host || data.sftp_server,
      username: data.username,
      hasPassword: !!data.password,
      status: data.status,
      expires_at: data.expires_at,
      connection_test: data.connection_test
    });
    
    // Map the FastAPI response to our expected format
    const credentials: SFTPCredentials = {
      host: data.host || data.sftp_server || 'sftp.brilliantbot.com',
      port: data.port || 22,
      username: data.username,
      password: data.password,
      folder_path: data.upload_dir || `/home/${data.username}/inbox`,
      upload_dir: data.upload_dir,
      expires_at: data.expires_at,
      status: data.status,
      test_result: data.connection_test ?? data.test_result ?? false
    };
    
    console.log('✅ SFTP: JWT authenticated account provisioned successfully:', {
      host: credentials.host,
      username: credentials.username,
      folder_path: credentials.folder_path,
      test_result: credentials.test_result
    });
    
    return credentials;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ SFTP: Provision error:', error.message);
      throw error;
    }
    console.error('❌ SFTP: Unknown provision error:', error);
    throw new Error('Unknown error occurred during SFTP provision');
  }
}
