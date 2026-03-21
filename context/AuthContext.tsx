'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { ROUTES } from '@/config/routes';
import { authService } from '@/domains/auth/auth.service';
import type { User } from '@/domains/user/types';
import { API_UNAUTHORIZED_EVENT } from '@/lib/api/client';

type AuthContextValue = {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  hasInitialized: boolean;
  /** True when `user` is non-null (session resolved successfully). */
  isAuthenticated: boolean;
  /** Re-fetch the current user from `/auth/me`. */
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Admin session state (Laravel Sanctum / cookie-backed API). The real security
 * boundary is the API; this context drives UI and redirects only.
 */
export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();

  const [user, setUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = React.useState<boolean>(false);

  const checkSession = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);

    const response = await authService.me();

    if (response && response.status === 'error') {
      setUser(null);
      setError(response.message);
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    setUser(response.data ?? null);
    setError(null);
    setIsLoading(false);
    setHasInitialized(true);
  }, []);

  const logout = React.useCallback(async (): Promise<void> => {
    setIsLoading(true);

    await authService.logout();

    setUser(null);
    setError(null);
    setIsLoading(false);

    router.replace(ROUTES.ADMIN.AUTH.LOGIN);
  }, [router]);

  React.useEffect(() => {
    if (!hasInitialized) {
      const timeoutId = window.setTimeout(() => {
        void checkSession();
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [checkSession, hasInitialized]);

  React.useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setError(null);
      setHasInitialized(true);
      router.replace(ROUTES.ADMIN.AUTH.LOGIN);
    };

    window.addEventListener(API_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(API_UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [router]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      error,
      isLoading,
      hasInitialized,
      isAuthenticated: user !== null,
      checkSession,
      logout,
    }),
    [user, error, isLoading, hasInitialized, checkSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
