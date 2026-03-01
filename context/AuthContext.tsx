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

/**
 * Shape of the auth context exposed via `AuthProvider` / `useAuth`.
 */
type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
};

/**
 * Internal React context carrying authentication state.
 *
 * Prefer using `AuthProvider` and `useAuth` instead of consuming this context
 * directly to keep usage consistent across the app.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Top-level provider for authentication state.
 *
 * Responsibilities:
 * - Verify the current session on mount via the ADMIN.AUTH.ME endpoint.
 * - Expose derived auth state (user, isAuthenticated, isLoading, error).
 * - Provide `checkSession()` for manual revalidation.
 * - Provide `logout()` backed by the LOGOUT endpoint.
 *
 * This provider should wrap modules that require a verified authenticated user.
 *
 * @param {PropsWithChildren} props - React children that require access to auth state.
 * @returns {JSX.Element} Provider wrapping the passed children.
 */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  /**
   * Re-validates the current authenticated session against the ME endpoint and
   * normalizes the auth state based on the API response.
   *
   * Behavior:
   * - Sets `isLoading` while the request is in-flight.
   * - On success: updates `user`, clears `error`, and marks the provider as initialized.
   * - On failure: clears `user`, records a human-readable error, and still marks
   *   the provider as initialized so routing logic can proceed.
   *
   * This function is exposed via the context as `checkSession`.
   *
   * @returns {Promise<void>} A promise that resolves once the session check has completed.
   */
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

  /**
   * Logs out the current user via the LOGOUT endpoint and resets local auth state.
   *
   * Behavior:
   * - Sets `isLoading` while the logout request is in-flight.
   * - Regardless of API outcome (given `throwOnError: false`), clears `user`
   *   and `error`, resets `isLoading`, and redirects to the login route.
   *
   * This function is exposed via the context as `logout`.
   *
   * @returns {Promise<void>} A promise that resolves once local state has been cleared
   * and navigation to the login page has been triggered.
   */
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

/**
 * Convenience hook for consuming the admin auth context within client
 * components inside the protected admin dashboard.
 *
 * Throws a descriptive error when used outside of `AuthProvider` to surface
 * configuration issues early in development.
 *
 * @returns {AuthContextValue} The current admin auth context value.
 */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
};

export default AuthProvider;
