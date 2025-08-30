
import { api } from "@/lib/api";
import { getAuthHeaders, getBackendAuthToken } from "@/lib/api/auth";

export type SFTPProvisionResponse = {
  sftp_server: string;
  username: string;
  password: string;
  test_result: boolean;
};

export type SFTPCredentials = {
  host: string;
  port: number;
  username: string;
  password: string;
  folder_path: string;
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
    host: data.sftp_server,
    port: 22,
    username: data.username,
    password: data.password,
    folder_path: `/home/${data.username}/inbox`,
    test_result: data.test_result
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
    server: data.sftp_server,
    username: data.username,
    hasPassword: !!data.password,
    testResult: data.test_result
  });
  
  // Map the FastAPI response to our expected format
  const credentials: SFTPCredentials = {
    host: data.sftp_server,
    port: 22, // Default SFTP port
    username: data.username,
    password: data.password,
    folder_path: `/home/${data.username}/inbox`, // Derive folder path from username
    test_result: data.test_result
  };
  
  console.log('✅ SFTP: JWT authenticated account provisioned successfully:', {
    host: credentials.host,
    username: credentials.username,
    folder_path: credentials.folder_path,
    test_result: credentials.test_result
  });
  
  return credentials;
}
