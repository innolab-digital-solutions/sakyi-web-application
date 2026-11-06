/**
 * Validates required public env vars in production builds/runtime.
 * Server-only; do not import from Client Components.
 */
const REQUIRED_PRODUCTION_PUBLIC = [
  'NEXT_PUBLIC_API_DOMAIN_ENDPOINT',
  'NEXT_PUBLIC_API_VERSION_ENDPOINT',
] as const;

export function assertProductionPublicEnv(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing: string[] = [];
  for (const key of REQUIRED_PRODUCTION_PUBLIC) {
    const value = process.env[key];
    if (value === undefined || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables in production: ${missing.join(', ')}`,
    );
  }
}
