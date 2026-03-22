/**
 * Budget-conscious Sentry tuning from environment variables.
 * Safe to import from Node, Edge, and client bundles (uses only `process.env`).
 */

export type SentryDeploymentTier = 'production' | 'staging' | 'development';

const normalizeAppEnv = (): string =>
  (process.env.NEXT_PUBLIC_APP_ENV ?? '').trim().toLowerCase();

/**
 * Reads `NEXT_PUBLIC_SENTRY_DSN` only (does not apply the enable flag).
 */
const readRawPublicSentryDsn = (): string | undefined => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn && dsn.length > 0 ? dsn : undefined;
};

/**
 * Explicit opt-in / opt-out via `NEXT_PUBLIC_SENTRY_ENABLED` or `SENTRY_ENABLED`.
 * When unset, neither forces on nor off (DSN alone decides).
 */
const parseExplicitSentryEnabled = (): boolean | undefined => {
  const raw =
    process.env.NEXT_PUBLIC_SENTRY_ENABLED ?? process.env.SENTRY_ENABLED;
  if (raw === undefined || String(raw).trim() === '') return undefined;
  const s = String(raw).trim().toLowerCase();
  if (['0', 'false', 'no', 'off'].includes(s)) return false;
  if (['1', 'true', 'yes', 'on'].includes(s)) return true;
  return undefined;
};

/**
 * Whether Sentry should run (init + send events). Use `NEXT_PUBLIC_SENTRY_ENABLED=false`
 * to turn everything off without removing the package or deleting call sites.
 *
 * - Explicit `false` → off (ignores DSN).
 * - Explicit `true` → on only if a DSN is configured.
 * - Unset → on only if a DSN is configured (same as today).
 */
export const isSentryEnabled = (): boolean => {
  const explicit = parseExplicitSentryEnabled();
  if (explicit === false) return false;
  const dsn = readRawPublicSentryDsn();
  if (explicit === true) return dsn !== undefined;
  return dsn !== undefined;
};

const parseSampleRate = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || String(raw).trim() === '') return fallback;
  const n = Number.parseFloat(String(raw));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
};

const BUDGET_RATES: Record<
  SentryDeploymentTier,
  {
    traces: number;
    replaySession: number;
    replayOnError: number;
    logs: boolean;
  }
> = {
  production: {
    traces: 0.05,
    replaySession: 0,
    replayOnError: 0.2,
    logs: false,
  },
  staging: {
    traces: 0.12,
    replaySession: 0.02,
    replayOnError: 0.35,
    logs: false,
  },
  development: {
    traces: 1,
    replaySession: 0.05,
    replayOnError: 1,
    logs: true,
  },
};

/**
 * Deployment tier for default sampling. Uses `NEXT_PUBLIC_APP_ENV` first,
 * then falls back to `NODE_ENV` when the app env is unset.
 */
export const getSentryDeploymentTier = (): SentryDeploymentTier => {
  const appEnv = normalizeAppEnv();
  if (appEnv === 'production') return 'production';
  if (appEnv === 'staging') return 'staging';
  if (appEnv === 'development' || appEnv === 'dev') return 'development';
  if (process.env.NODE_ENV === 'production') return 'production';
  return 'development';
};

/**
 * Sentry `environment` tag value. Override with `NEXT_PUBLIC_SENTRY_ENVIRONMENT`.
 */
export const getSentryEnvironment = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim();
  if (explicit) return explicit;
  const app = normalizeAppEnv();
  if (app) return app;
  return process.env.NODE_ENV ?? 'development';
};

/**
 * Performance monitoring sample rate (0–1). Override with
 * `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`.
 */
export const getSentryTracesSampleRate = (): number =>
  parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    BUDGET_RATES[getSentryDeploymentTier()].traces,
  );

/**
 * Session Replay sampling for normal sessions. Override with
 * `NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE`.
 */
export const getSentryReplaySessionSampleRate = (): number =>
  parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE,
    BUDGET_RATES[getSentryDeploymentTier()].replaySession,
  );

/**
 * Session Replay sampling when an error occurs. Override with
 * `NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE`.
 */
export const getSentryReplayOnErrorSampleRate = (): number =>
  parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE,
    BUDGET_RATES[getSentryDeploymentTier()].replayOnError,
  );

/**
 * Whether Sentry Logs are enabled. Override with `NEXT_PUBLIC_SENTRY_ENABLE_LOGS`
 * or `SENTRY_ENABLE_LOGS` (`1` / `true` / `yes`).
 */
export const getSentryEnableLogs = (): boolean => {
  const raw =
    process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS ?? process.env.SENTRY_ENABLE_LOGS;
  if (raw !== undefined) {
    return ['1', 'true', 'yes'].includes(String(raw).trim().toLowerCase());
  }
  return BUDGET_RATES[getSentryDeploymentTier()].logs;
};

/**
 * DSN for `@sentry/nextjs` when Sentry is enabled; `undefined` when disabled
 * (no DSN or `NEXT_PUBLIC_SENTRY_ENABLED=false`).
 */
export const getPublicSentryDsn = (): string | undefined =>
  isSentryEnabled() ? readRawPublicSentryDsn() : undefined;

/**
 * Release identifier for Sentry events and source maps.
 */
export const getSentryRelease = (): string | undefined => {
  const r =
    process.env.NEXT_PUBLIC_SENTRY_RELEASE?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  return r && r.length > 0 ? r : undefined;
};
