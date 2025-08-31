
// src/api/sftp.ts
import { http } from "./http";

// Updated to match actual FastAPI response format (flat structure)
export type SFTPProvisionResponse = {
  host: string;
  port: number;
  username: string;
  password: string;
  folder_path: string;
  ftp_username: string;
  status: string;
  created_at: string;
  id?: string;
  last_used_at?: string;
  expires_at?: string;
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
  return http<SFTPProvisionResponse>("/api/v1/sftp/provision", { 
    method: "POST",
    body: JSON.stringify({ telegram_id })
  });
}

export async function getSftpStatus(telegram_id: number): Promise<SFTPStatusResponse> {
  return http<SFTPStatusResponse>(`/api/v1/sftp/status/${telegram_id}`, { 
    method: "GET" 
  });
}

export async function testSftpConnection(telegram_id: number): Promise<SFTPTestConnectionResponse> {
  return http<SFTPTestConnectionResponse>("/api/v1/sftp/test-connection", {
    method: "POST",
    body: JSON.stringify({ telegram_id })
  });
}

export async function deactivateSftp(telegram_id: number): Promise<{ status: string; message: string }> {
  return http<{ status: string; message: string }>("/api/v1/sftp/deactivate", {
    method: "POST", 
    body: JSON.stringify({ telegram_id })
  });
}
