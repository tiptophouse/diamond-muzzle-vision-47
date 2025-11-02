
// src/api/sftp.ts
import { http } from "./http";

// Match actual FastAPI response format
export type SFTPProvisionResponse = {
  username: string;
  password: string;
  host_name: string;
  port_number: number;
  folder: string;
  test_result: boolean;
};

export type SFTPStatusResponse = {
  id: string;
  ftp_username: string;
  ftp_folder_path: string;
  status: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
};

export type SFTPTestConnectionResponse = {
  status: 'success' | 'failed';
  message?: string;
};

export async function provisionSftp(telegram_id: number): Promise<SFTPProvisionResponse> {
  console.log('📡 API: Calling SFTP provision endpoint for user:', telegram_id);
  
  return http<SFTPProvisionResponse>("/api/v1/sftp/provision", { 
    method: "POST",
    body: JSON.stringify({ telegram_id })
  });
}

export async function getSftpStatus(telegram_id: number): Promise<SFTPStatusResponse> {
  console.log('📡 API: Getting SFTP status for user:', telegram_id);
  
  return http<SFTPStatusResponse>(`/api/v1/sftp/status/${telegram_id}`, { 
    method: "GET" 
  });
}

export async function testSftpConnection(telegram_id: number): Promise<SFTPTestConnectionResponse> {
  console.log('📡 API: Testing SFTP connection for user:', telegram_id);
  
  return http<SFTPTestConnectionResponse>("/api/v1/sftp/test-connection", {
    method: "POST",
    body: JSON.stringify({ telegram_id })
  });
}

export async function deactivateSftp(telegram_id: number): Promise<{ status: string; message: string }> {
  console.log('📡 API: Deactivating SFTP for user:', telegram_id);
  
  return http<{ status: string; message: string }>("/api/v1/sftp/deactivate", {
    method: "POST", 
    body: JSON.stringify({ telegram_id })
  });
}
