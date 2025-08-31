
// Utility functions to help debug Telegram init_data issues

export function logTelegramEnvironment() {
  console.log('🔍 TELEGRAM ENVIRONMENT COMPLETE DEBUG:');
  
  // Check if we're in a browser
  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }

  // Check Telegram availability
  console.log('📱 Telegram object:', {
    telegramExists: !!window.Telegram,
    telegramType: typeof window.Telegram,
    telegramKeys: window.Telegram ? Object.keys(window.Telegram) : []
  });

  // Check WebApp availability
  if (window.Telegram?.WebApp) {
    const wa = window.Telegram.WebApp;
    console.log('🔍 WebApp properties:', {
      version: wa.version || 'unknown',
      platform: wa.platform || 'unknown', 
      colorScheme: wa.colorScheme || 'unknown',
      themeParams: wa.themeParams,
      isExpanded: wa.isExpanded || false,
      viewportHeight: wa.viewportHeight || 0,
      viewportStableHeight: wa.viewportStableHeight || 0,
      headerColor: wa.headerColor || 'unknown',
      backgroundColor: wa.backgroundColor || 'unknown'
    });

    console.log('🔍 WebApp init data:', {
      initData: wa.initData,
      initDataLength: wa.initData?.length || 0,
      initDataUnsafe: wa.initDataUnsafe,
      initDataUnsafeKeys: Object.keys(wa.initDataUnsafe || {})
    });
  } else {
    console.log('❌ WebApp not available');
  }

  // Check if we might be in development
  console.log('🔍 Environment info:', {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent,
    isDevelopment: window.location.hostname === 'localhost' || 
                   window.location.hostname.includes('lovableproject.com')
  });
}

export function parseInitData(initDataString: string) {
  if (!initDataString) {
    console.log('❌ No init data to parse');
    return null;
  }

  try {
    const params = new URLSearchParams(initDataString);
    const parsed = {
      query_id: params.get('query_id'),
      user: params.get('user'),
      auth_date: params.get('auth_date'),
      hash: params.get('hash'),
      allParams: [...params.entries()]
    };

    console.log('🔍 Parsed init data:', parsed);

    if (parsed.user) {
      try {
        const userObj = JSON.parse(decodeURIComponent(parsed.user));
        console.log('🔍 Parsed user object:', userObj);
        return { ...parsed, userObject: userObj };
      } catch (error) {
        console.error('❌ Failed to parse user object:', error);
      }
    }

    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse init data:', error);
    return null;
  }
}

export function generateMockInitData(userId: number = 123456789, firstName: string = 'Test User') {
  const mockUser = {
    id: userId,
    first_name: firstName,
    last_name: 'User',
    username: 'testuser',
    language_code: 'en'
  };

  const mockInitData = new URLSearchParams({
    query_id: 'mock_query_id_' + Date.now(),
    user: encodeURIComponent(JSON.stringify(mockUser)),
    auth_date: Math.floor(Date.now() / 1000).toString(),
    hash: 'mock_hash_for_testing'
  }).toString();

  console.log('🔧 Generated mock init data:', {
    mockInitData,
    mockUser,
    length: mockInitData.length
  });

  return mockInitData;
}
