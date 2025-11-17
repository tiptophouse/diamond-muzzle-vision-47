/**
 * SFTP API Client
 * Handles SFTP user provisioning
 */

import { http } from '@/api/http';
import type { SFTPResponseScheme } from '@/types/backend-api';

/**
 * Provision SFTP access for the authenticated user
 * Creates SFTP credentials and returns connection details
 * @returns SFTP connection details including username, password, host, port, and folder
 */
export async function provisionSFTP(): Promise<SFTPResponseScheme> {
  return http<SFTPResponseScheme>('/api/v1/sftp/provision', {
    method: 'POST',
  });
}
