// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The added config here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import {
  getPublicSentryDsn,
  getSentryEnableLogs,
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
} from '@/lib/sentry';

const sentryDsn = getPublicSentryDsn();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    environment: getSentryEnvironment(),
    release: getSentryRelease(),

    tracesSampleRate: getSentryTracesSampleRate(),

    enableLogs: getSentryEnableLogs(),

    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}
