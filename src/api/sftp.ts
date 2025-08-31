
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
    server: data.sftp_server,
    username: data.username,
    testResult: data.test_result
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
    throw new Error('JWT authentication required for SFTP provision');
  }
  
  console.log('✅ SFTP: JWT token available for authenticated request');
  
  // Get proper JWT authentication headers
  const authHeaders = await getAuthHeaders();
  console.log('🔐 SFTP: JWT authentication headers prepared for SFTP endpoint');
  
  // Make JWT authenticated request to SFTP provision endpoint
  const response = await api.post<SFTPProvisionResponse>('/api/v1/sftp/provision', {
    telegram_id: telegramId
  });
  
  if (response.error || !response.data) {
    console.error('❌ SFTP: JWT authenticated provision failed:', response.error);
    throw new Error(response.error || 'Failed to provision SFTP account with JWT authentication');
  }
  
  const data = response.data;
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
}
