#!/usr/bin/env node
/**
 * Fails CI when required public env vars are unset.
 * GitHub Actions should set these (see `.github/workflows/code-quality.yml`).
 */
const required = [
  'NEXT_PUBLIC_API_DOMAIN_ENDPOINT',
  'NEXT_PUBLIC_API_VERSION_ENDPOINT',
];

const missing = required.filter((key) => {
  const v = process.env[key];
  return v === undefined || String(v).trim() === '';
});

if (missing.length > 0) {
  console.error(
    `[verify-env] Missing required environment variables: ${missing.join(', ')}`,
  );
  process.exit(1);
}

console.log('[verify-env] OK');
