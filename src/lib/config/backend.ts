
// Backend configuration management
export const BACKEND_CONFIG = {
  API_URL: 'https://api.mazalbot.com',
  ACCESS_TOKEN: 'ifj9ov1rh20fslfp',
  SELLERS_BOT_URL: 'http://166.88.90.125:8001',
  MAKE_WEBHOOK_URL: 'https://hook.eu1.make.com/pe4zsmm82vt5fglrahnm5rtyc6kkakaj',
  B2B_GROUP_ID: '-1002178695748',
  OPENAI_API_KEY: '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',
  OPENAI_API_KEY_LIMITED: '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'
};

export const getBackendHeaders = () => ({
  'Authorization': `Bearer ${BACKEND_CONFIG.ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const logApiCall = (endpoint: string, method: string, data?: any) => {
  console.log(`🚀 API Call: ${method} ${endpoint}`, data ? { data } : '');
};
