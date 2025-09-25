// Utility to systematically replace console.log statements with optimized logger
// This script helps migrate from console logging to production-ready Telegram logging

export const consoleReplacements = {
  // Diamond operations
  '🗑️ API: Calling delete diamond endpoint:': 'Diamond delete operation started',
  '✅ API: Delete response:': 'Diamond deleted successfully',
  '❌ API: Delete diamond failed:': 'Diamond delete operation failed',
  '➕ API: Creating diamond:': 'Diamond creation started', 
  '✅ API: Create response:': 'Diamond created successfully',
  '❌ API: Create diamond failed:': 'Diamond creation failed',
  '✏️ API: Updating diamond:': 'Diamond update started',
  '✅ API: Update response:': 'Diamond updated successfully',
  '❌ API: Update diamond failed:': 'Diamond update failed',
  '📦 API: Creating diamonds batch:': 'Batch diamond creation started',
  '✅ API: Batch create response:': 'Batch diamonds created successfully',
  '❌ API: Batch create diamonds failed:': 'Batch diamond creation failed',

  // HTTP operations
  '🔍 HTTP: Using cached backend health status:': 'Using cached backend health status',
  '🏥 HTTP: Testing FastAPI backend health at:': 'Testing backend health',
  '🏥 HTTP: Backend health result:': 'Backend health check completed',
  '🏥 HTTP: Backend health check failed:': 'Backend health check failed',
  '🔑 HTTP: Making request to:': 'Making API request',
  '❌ HTTP: No JWT token available for protected endpoint:': 'JWT token missing for protected endpoint',
  '❌ HTTP: Backend is not healthy for:': 'Backend unhealthy for request',
  '📡 HTTP: Response status:': 'API response received',
  '❌ HTTP: Server error response:': 'Server error received',
  '❌ HTTP: Server error text:': 'Server error details',
  '✅ HTTP: Delete successful': 'HTTP DELETE successful',
  '✅ HTTP: Create successful': 'HTTP POST successful',
  '✅ HTTP: Update successful': 'HTTP PUT successful',
  '✅ HTTP: Request successful': 'HTTP request successful',
  '❌ HTTP: Request error:': 'HTTP request failed',

  // Admin operations
  'Error sending bulk message:': 'Bulk message sending failed',
  'Error sending test message:': 'Test message sending failed', 
  'Failed to log admin action:': 'Admin action logging failed',
  'Error creating user:': 'User creation failed',
  '❌ Failed to check admin status:': 'Admin status check failed',
  'Deleting user:': 'User deletion started',
  'Error deleting analytics:': 'Analytics deletion failed',
  'Error deleting blocked user:': 'Blocked user deletion failed',
  'Error deleting user:': 'User deletion failed',
  'Deleting all mock data...': 'Mock data deletion started',
  'Error deleting mock data:': 'Mock data deletion failed',

  // Auth operations  
  '🔍 TelegramAuthProvider - Optimized auth state:': 'Telegram auth state updated',
  '⚠️ useSecureTelegramAuth is deprecated': 'Deprecated auth hook used',

  // Performance and metrics
  '👥 AdminUserManager: Total users loaded:': 'Users loaded in admin manager',
  '📊 User stats:': 'User statistics calculated',
  '🔍 Filtered users:': 'User filtering completed',
  '📊 Loaded diamonds for bulk sharing': 'Diamonds loaded for sharing',
  '❌ Error fetching diamonds:': 'Diamond fetching failed',
  '🚀 Starting bulk user processing': 'Bulk user processing started',
  '📊 Found existing profiles': 'Profile analysis completed'
};

// Helper to convert console statements to logger calls
export const convertConsoleToLogger = (originalMessage: string, data?: any): { level: 'info' | 'warn' | 'error'; message: string; context?: any } => {
  // Determine log level based on message content
  let level: 'info' | 'warn' | 'error' = 'info';
  
  if (originalMessage.includes('❌') || originalMessage.includes('Error') || originalMessage.includes('Failed')) {
    level = 'error';
  } else if (originalMessage.includes('⚠️') || originalMessage.includes('warn')) {
    level = 'warn';
  }

  // Clean up the message
  const cleanMessage = consoleReplacements[originalMessage as keyof typeof consoleReplacements] || 
                      originalMessage.replace(/[🔍🏥🔑📡❌✅➕✏️📦🗑️👥📊🚀⚠️]/g, '').trim();

  return {
    level,
    message: cleanMessage,
    context: data ? { originalData: data } : undefined
  };
};

// Batch replacement patterns for common scenarios
export const batchReplacements = [
  {
    pattern: /console\.log\('🔍 HTTP: Using cached backend health status:', (.+)\);/g,
    replacement: "logger.info('Using cached backend health status', { isHealthy: $1 });"
  },
  {
    pattern: /console\.log\('🏥 HTTP: Testing FastAPI backend health at:', (.+)\);/g,
    replacement: "logger.info('Testing backend health', { url: $1 });"
  },
  {
    pattern: /console\.error\('❌ (.+):', (.+)\);/g,
    replacement: "logger.error('$1', $2);"
  },
  {
    pattern: /console\.log\('✅ (.+):', (.+)\);/g,
    replacement: "logger.info('$1', { data: $2 });"
  },
  {
    pattern: /console\.warn\('⚠️ (.+)', (.+)\);/g,
    replacement: "logger.warn('$1', { data: $2 });"
  }
];