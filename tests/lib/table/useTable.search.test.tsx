// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTable } from '@/lib/table';
import { fetchTablePage } from '@/lib/table/fetch';

const { navigation, replaceMock, searchStore } = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  return {
    navigation: {
      pathname: '/admin/users',
      search: '',
    },
    replaceMock: vi.fn(),
    searchStore: {
      subscribe(listener: () => void) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      notify() {
        listeners.forEach((listener) => listener());
      },
    },
  };
});

vi.mock('next/navigation', async () => {
  const React = await import('react');
  return {
    useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
    usePathname: () => navigation.pathname,
    useSearchParams: () => {
      const [, setTick] = React.useState(0);
      React.useEffect(
        () => searchStore.subscribe(() => setTick((n) => n + 1)),
        [],
      );
      return new URLSearchParams(navigation.search);
    },
  };
});

vi.mock('@/lib/table/fetch', () => ({
  fetchTablePage: vi.fn(),
}));

const fetchTablePageMock = vi.mocked(fetchTablePage);

function emptyPageResponse() {
  return {
    status: 'success' as const,
    message: 'ok',
    data: [],
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function lastReplaceQuery(): string {
  const url = replaceMock.mock.calls.at(-1)?.[0];
  if (typeof url !== 'string') return '';
  return url.includes('?') ? (url.split('?')[1] ?? '') : '';
}

function applyLastReplace() {
  navigation.search = lastReplaceQuery();
  searchStore.notify();
}

function setUrlSearch(query: string) {
  navigation.search = query;
  searchStore.notify();
}

function searchParamFromCall(
  call: (typeof fetchTablePageMock.mock.calls)[number],
): string | undefined {
  const params = call[1];
  if (!params || typeof params !== 'object' || !('search' in params)) {
    return undefined;
  }
  const value = params.search;
  return typeof value === 'string' ? value : undefined;
}

async function renderUseTable(debounceMs = 400) {
  const rendered = renderHook(
    () =>
      useTable('/admin/users', {
        params: { sync: true, writeInitialToUrl: true },
        search: { enabled: true, debounceMs },
        tanstack: { retry: false },
      }),
    { wrapper: createWrapper() },
  );

  await act(async () => {
    await Promise.resolve();
    applyLastReplace();
  });

  return rendered;
}

describe('useTable search debounce', () => {
  beforeEach(() => {
    navigation.search = '';
    replaceMock.mockClear();
    fetchTablePageMock.mockReset();
    fetchTablePageMock.mockResolvedValue(emptyPageResponse());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does_not_fetch_a_search_term_until_typing_has_paused_for_the_debounce', async () => {
    const { result } = await renderUseTable(400);
    const callsBeforeTyping = fetchTablePageMock.mock.calls.length;

    act(() => {
      result.current.controls.search?.onChange('h');
    });
    act(() => {
      result.current.controls.search?.onChange('he');
    });
    act(() => {
      result.current.controls.search?.onChange('hel');
    });

    expect(result.current.controls.search?.value).toBe('hel');
    expect(fetchTablePageMock.mock.calls.length).toBe(callsBeforeTyping);

    await act(async () => {
      vi.advanceTimersByTime(399);
      await Promise.resolve();
    });
    expect(fetchTablePageMock.mock.calls.length).toBe(callsBeforeTyping);

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    vi.useRealTimers();
    await waitFor(() => {
      expect(
        fetchTablePageMock.mock.calls.some(
          (call) => searchParamFromCall(call) === 'hel',
        ),
      ).toBe(true);
    });
  });

  it('keeps_the_typed_value_when_a_stale_url_search_lands_mid_keystroke', async () => {
    const { result } = await renderUseTable(400);

    act(() => {
      result.current.controls.search?.onChange('a');
    });

    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    const staleQuery = lastReplaceQuery();
    expect(staleQuery).toContain('search=a');

    act(() => {
      result.current.controls.search?.onChange('abc');
    });
    expect(result.current.controls.search?.value).toBe('abc');

    act(() => {
      setUrlSearch(staleQuery);
    });

    expect(result.current.controls.search?.value).toBe('abc');
  });

  it('clears_the_applied_search_after_debounce_when_the_box_is_emptied', async () => {
    const { result } = await renderUseTable(400);

    act(() => {
      result.current.controls.search?.onChange('yoga');
    });
    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    vi.useRealTimers();
    await waitFor(() => {
      expect(
        fetchTablePageMock.mock.calls.some(
          (call) => searchParamFromCall(call) === 'yoga',
        ),
      ).toBe(true);
    });

    vi.useFakeTimers();
    act(() => {
      result.current.controls.search?.onChange('');
    });
    expect(result.current.controls.search?.value).toBe('');

    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    vi.useRealTimers();
    await waitFor(() => {
      expect(searchParamFromCall(fetchTablePageMock.mock.calls.at(-1)!)).toBe(
        undefined,
      );
    });
  });
});
