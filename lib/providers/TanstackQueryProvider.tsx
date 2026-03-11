'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, useState } from 'react';

const TanstackQueryProvider = ({ children }: PropsWithChildren) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 1,
            gcTime: 1000 * 60 * 5,
            retry: (failureCount, error: unknown) => {
              // Narrow to objects only
              if (error && typeof error === 'object') {
                const maybeWithStatus = error as {
                  status?: number;
                  response?: { status?: number };
                };

                const status =
                  maybeWithStatus.response?.status ?? maybeWithStatus.status;

                if (typeof status === 'number') {
                  // Do not retry on most 4xx (client/validation/auth)
                  if (
                    status >= 400 &&
                    status < 500 &&
                    status !== 408 &&
                    status !== 429
                  ) {
                    return false;
                  }

                  // Retry only on transient errors
                  if (status >= 500 || status === 408 || status === 429) {
                    return failureCount < 2;
                  }
                }
              }

              // Network/unknown errors: allow a couple of retries
              return failureCount < 2;
            },
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default TanstackQueryProvider;
