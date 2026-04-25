/**
 * Application configuration loaded from environment variables
 */
const requireEnvValue = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const apiBaseUrl = requireEnvValue(
  "NEXT_PUBLIC_API_BASE_URL",
  process.env.NEXT_PUBLIC_API_BASE_URL
);
const appUrl = requireEnvValue(
  "NEXT_PUBLIC_APP_URL",
  process.env.NEXT_PUBLIC_APP_URL
);

export const config = {
  // API Configuration
  api: {
  baseUrl: apiBaseUrl,
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  fullUrl: `${apiBaseUrl}/api/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}`,
  },
  
  // App Configuration
  app: {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'HireKarma',
  url: appUrl,
  },
  
  // Feature Flags
  features: {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  debugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment() {
  const missingVars: string[] = [];
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) missingVars.push('NEXT_PUBLIC_API_BASE_URL');
  if (!process.env.NEXT_PUBLIC_APP_URL) missingVars.push('NEXT_PUBLIC_APP_URL');
  
  if (missingVars.length > 0) {
  console.warn('Missing environment variables:', missingVars);
  console.warn('Using default values. Check your .env.local file.');
  }
  
  return missingVars.length === 0;
}

// Validate environment on import
if (typeof window !== 'undefined') {
  validateEnvironment();
}
