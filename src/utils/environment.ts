
export interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || 
                       hostname.includes('lovableproject.com') ||
                       hostname === '127.0.0.1';
  
  return {
    apiBaseUrl: isDevelopment ? 'http://localhost:8000' : 'https://api.mazalbot.com',
    isDevelopment,
    isProduction: !isDevelopment,
  };
}

export function logEnvironmentInfo() {
  const config = getEnvironmentConfig();
  console.log('🌍 Environment Configuration:', {
    hostname: window.location.hostname,
    apiBaseUrl: config.apiBaseUrl,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
  });
}
