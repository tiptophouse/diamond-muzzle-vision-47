
// Build-time optimizations and environment checks
export const BUILD_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Build-time feature flags
export const FEATURES = {
  enableDetailedLogging: BUILD_CONFIG.isDevelopment,
  enablePerformanceMonitoring: BUILD_CONFIG.isProduction,
  enableDebugMode: BUILD_CONFIG.isDevelopment,
} as const;

// Environment validation at build time
export function validateBuildEnvironment(): void {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn('⚠️ BUILD: Missing environment variables:', missingVars);
  }
}

// Tree-shaking helper for conditional imports
export function conditionalImport<T>(
  condition: boolean,
  importFn: () => Promise<T>
): Promise<T | null> {
  if (condition) {
    return importFn();
  }
  return Promise.resolve(null);
}

// Performance monitoring utilities
export const performanceUtils = {
  startTimer: (label: string) => {
    if (FEATURES.enablePerformanceMonitoring) {
      performance.mark(`${label}-start`);
    }
  },
  
  endTimer: (label: string) => {
    if (FEATURES.enablePerformanceMonitoring) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }
  },
  
  logPerformance: (label: string, startTime: number) => {
    if (FEATURES.enableDetailedLogging) {
      console.log(`⏱️ ${label}: ${Date.now() - startTime}ms`);
    }
  }
};

// Initialize build environment validation
if (BUILD_CONFIG.isDevelopment) {
  validateBuildEnvironment();
}
