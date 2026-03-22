// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
