
// SFTP API Configuration
export const SFTP_CONFIG = {
  API_BASE: "http://136.0.3.22:8000",
  PREFIX: "/api/v1",
  ENDPOINTS: {
    ALIVE: "/alive",
    PROVISION: "/sftp/provision", 
    TEST_CONNECTION: "/sftp/test-connection"
  }
} as const;

export const getSftpEndpoint = (endpoint: keyof typeof SFTP_CONFIG.ENDPOINTS): string => {
  return `${SFTP_CONFIG.API_BASE}${SFTP_CONFIG.PREFIX}${SFTP_CONFIG.ENDPOINTS[endpoint]}`;
};
