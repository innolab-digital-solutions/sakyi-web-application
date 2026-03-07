'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import PATHS from '@/config/paths';
import {
  checkSession as checkSessionService,
  logout as logoutService,
} from '@/lib/api/services/auth';
import type { User } from '@/types/admin/user';
import type { ApiError } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const checkSession = useCallback(async () => {
    setIsLoading(true);

    const response = await checkSessionService();

    if (response.status === 'error') {
      const errorResponse = response as ApiError;

      setUser(null);
      setError(
        errorResponse.message || 'Unable to verify authenticated session.',
      );
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    setUser(response.data ?? null);
    setError(null);
    setIsLoading(false);
    setHasInitialized(true);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    await logoutService();

    setUser(null);
    setError(null);
    setIsLoading(false);
    router.replace(PATHS.ADMIN.AUTH.LOGIN);
  }, [router]);

  useEffect(() => {
    if (!hasInitialized) {
      const timeoutId = window.setTimeout(() => {
        void checkSession();
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [checkSession, hasInitialized]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isReady: hasInitialized,
      error,
      checkSession,
      logout,
    }),
    [user, isLoading, hasInitialized, error, checkSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
};

export default AuthProvider;
