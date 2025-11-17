/**
 * Diamond Reports API Client
 * Handles diamond report creation and retrieval
 */

import { http } from '@/api/http';
import type { DiamondReportSchema } from '@/types/backend-api';

/**
 * Create a diamond report
 * @param data Report data
 * @returns Report ID
 */
export async function createReport(data: DiamondReportSchema): Promise<string> {
  return http<string>('/api/v1/create-report', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get a diamond report by ID
 * @param diamondId Diamond ID
 * @returns Diamond report data
 */
export async function getReport(diamondId: number): Promise<DiamondReportSchema> {
  const queryParams = new URLSearchParams({
    diamond_id: diamondId.toString(),
  });

  return http<DiamondReportSchema>(`/api/v1/get-report?${queryParams}`, {
    method: 'GET',
  });
}
