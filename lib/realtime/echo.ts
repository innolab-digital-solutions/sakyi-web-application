import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { base } from '@/config/api/base';
import { ensureCsrfCookie, getCsrfToken } from '@/lib/api/client/csrf';

type ChannelAuthorizationData = {
  auth: string;
  channel_data?: string;
  shared_secret?: string;
};

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

/**
 * Creates a Laravel Echo client configured for Reverb.
 */
export async function createEchoClient() {
  await ensureCsrfCookie();
  const csrfToken = getCsrfToken();
  const authEndpoint = `${base.domainEndpoint}/broadcasting/auth`;

  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? '',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint,
    withCredentials: true,
    authorizer: (channel: { name: string }) => ({
      authorize: (
        socketId: string,
        callback: (
          error: Error | null,
          data: ChannelAuthorizationData | null,
        ) => void,
      ) => {
        void (async () => {
          try {
            const response = await fetch(authEndpoint, {
              method: 'POST',
              credentials: 'include',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken
                  ? {
                      'X-XSRF-TOKEN': csrfToken,
                    }
                  : {}),
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            });

            const payload = (await response
              .json()
              .catch(() => null)) as ChannelAuthorizationData | null;

            if (!response.ok) {
              callback(
                new Error(
                  `Broadcast auth failed with status ${response.status}`,
                ),
                payload,
              );
              return;
            }

            callback(null, payload);
          } catch (error) {
            const normalizedError =
              error instanceof Error
                ? error
                : new Error('Broadcast auth request failed');
            callback(normalizedError, null);
          }
        })();
      },
    }),
    // authorizer: (channel: { name: string }) => ({
    //   authorize: (
    //     socketId: string,
    //     callback: (
    //       error: Error | null,
    //       data: ChannelAuthorizationData | null,
    //     ) => void,
    //   ) => {
    //     void (async () => {
    //       try {
    //         const response = await fetch(authEndpoint, {
    //           method: 'POST',
    //           credentials: 'include',
    //           headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //             'X-Requested-With': 'XMLHttpRequest',
    //             ...(csrfToken
    //               ? {
    //                   'X-XSRF-TOKEN': csrfToken,
    //                   'X-CSRF-TOKEN': csrfToken,
    //                 }
    //               : {}),
    //           },
    //           body: JSON.stringify({
    //             socket_id: socketId,
    //             channel_name: channel.name,
    //           }),
    //         });

    //         const payload = (await response
    //           .json()
    //           .catch(() => null)) as ChannelAuthorizationData | null;

    //         if (!response.ok) {
    //           callback(
    //             new Error(`Broadcast auth failed with status ${response.status}`),
    //             payload,
    //           );
    //           return;
    //         }

    //         callback(null, payload);
    //       } catch (error) {
    //         const normalizedError =
    //           error instanceof Error
    //             ? error
    //             : new Error('Broadcast auth request failed');
    //         callback(normalizedError, null);
    //       }
    //     })();
    //   },
    // }),
    // auth: {
    //   headers: {
    //     Accept: 'application/json',
    //   },
    // },
  });
}
