// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import {
  getPublicSentryDsn,
  getSentryEnableLogs,
  getSentryEnvironment,
  getSentryRelease,
  getSentryReplayOnErrorSampleRate,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
} from '@/lib/sentry';

const sentryDsn = getPublicSentryDsn();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,

    environment: getSentryEnvironment(),
    release: getSentryRelease(),

    integrations: [Sentry.replayIntegration()],

    tracesSampleRate: getSentryTracesSampleRate(),

    enableLogs: getSentryEnableLogs(),

    replaysSessionSampleRate: getSentryReplaySessionSampleRate(),

    replaysOnErrorSampleRate: getSentryReplayOnErrorSampleRate(),

    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
