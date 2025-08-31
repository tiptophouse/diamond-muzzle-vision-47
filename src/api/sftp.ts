
// src/api/sftp.ts
import { api } from "@/lib/api";
import { getAuthHeaders } from "@/lib/api/auth";

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

export async function provisionSftp(telegramId: number): Promise<SFTPCredentials> {
  console.log('🔐 SFTP: Provisioning SFTP account for user:', telegramId);
  
  // Get proper authentication headers
  const authHeaders = await getAuthHeaders();
  console.log('🔐 SFTP: Auth headers prepared:', {
    hasAuth: !!authHeaders.Authorization,
    headerKeys: Object.keys(authHeaders)
  });
  
  const response = await api.post<SFTPProvisionResponse>('/api/v1/sftp/provision', {
    telegram_id: telegramId
  });
  
  if (response.error || !response.data) {
    console.error('❌ SFTP: Provision failed:', response.error);
    throw new Error(response.error || 'Failed to provision SFTP account');
  }
  
  const data = response.data;
  console.log('✅ SFTP: Provision response received:', {
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
  
  console.log('✅ SFTP: Account provisioned successfully:', {
    host: credentials.host,
    username: credentials.username,
    folder_path: credentials.folder_path,
    test_result: credentials.test_result
  });
  
  return credentials;
}
