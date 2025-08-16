
export interface SFTPAccount {
  id: string;
  user_id: number;
  telegram_id: number;
  ftp_username: string;
  password_hash: string;
  ftp_folder_path: string;
  status: 'active' | 'suspended' | 'revoked';
  expires_at?: string;
  last_used_at?: string;
  password_changed_at?: string;
  created_at: string;
  updated_at: string;
  password?: string; // Only available immediately after generation/rotation
}

export interface SFTPUploadJob {
  id: string;
  user_id: number;
  ftp_account_id: string;
  filename: string;
  file_size_bytes?: number;
  status: 'received' | 'processing' | 'completed' | 'failed' | 'invalid';
  diamonds_processed: number;
  diamonds_failed: number;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Database response types (what we get from Supabase)
export interface SFTPAccountResponse {
  id: string;
  user_id: number;
  telegram_id: number;
  ftp_username: string;
  password_hash: string;
  ftp_folder_path: string;
  status: string; // Database returns string
  expires_at?: string;
  last_used_at?: string;
  password_changed_at?: string;
  created_at: string;
  updated_at: string;
  password?: string;
}

export interface SFTPUploadJobResponse {
  id: string;
  user_id: number;
  ftp_account_id: string;
  filename: string;
  file_size_bytes?: number;
  status: string; // Database returns string
  diamonds_processed: number;
  diamonds_failed: number;
  processing_started_at?: string;
  processing_completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}
