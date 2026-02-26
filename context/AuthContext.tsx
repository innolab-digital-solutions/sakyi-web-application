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

import ENDPOINTS from '@/config/endpoints';
import PATHS from '@/config/paths';
import type { ApiError, ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

type User = {
  id: number;
  name: string;
  email: string;
  picture: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  address: string;
  status: 'active' | 'suspended' | 'archived';
  role: string;
  timestamps: {
    email_verified_at: string;
    last_login_at: string;
    created_at: string;
    updated_at: string;
  };
};

type MeResponseData = User | { user: User };

type AuthContextValue = {
  /**
   * The currently authenticated admin user, or null if no session exists.
   */
  user: User | null;
  /**
   * Indicates whether an authenticated admin session is present.
   */
  isAuthenticated: boolean;
  /**
   * Indicates whether an auth-related network request is currently in progress
   * (session check or logout).
   */
  isLoading: boolean;
  /**
   * Indicates whether the initial auth check has completed and the auth state
   * is ready to be consumed for routing decisions.
   */
  isReady: boolean;
  /**
   * Last auth-related error message, primarily for debugging UI.
   */
  error: string | null;
  /**
   * Re-validates the current admin session using the ME endpoint and updates
   * the global auth state. This is safe to call from any client component
   * wrapped by the provider.
   */
  checkSession: () => Promise<void>;
  /**
   * Logs out the current admin using the LOGOUT endpoint, clears local auth
   * state, and redirects to the admin login route.
   */
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Top-level provider for admin authentication state.
 *
 * Responsibilities:
 * - Verify the current session on mount via the ADMIN.AUTH.ME endpoint.
 * - Expose derived auth state (user, isAuthenticated, isLoading, error).
 * - Provide `checkSession()` for manual revalidation.
 * - Provide `logout()` backed by the ADMIN.AUTH.LOGOUT endpoint.
 *
 * This provider should wrap the protected admin dashboard modules.
 */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const extractUser = (response: ApiResponse<MeResponseData>): User | null => {
    if (response.status === 'error') {
      return null;
    }

    const payload = response.data;

    if (payload && typeof payload === 'object' && 'user' in payload) {
      return (payload as { user: User }).user ?? null;
    }

    return (payload as User) ?? null;
  };

  const checkSession = useCallback(async () => {
    setIsLoading(true);

    const response = await http.get<MeResponseData>(ENDPOINTS.ADMIN.AUTH.ME, {
      throwOnError: false,
    });

    if (response.status === 'error') {
      const errorResponse = response as ApiError;

      setUser(null);
      setError(errorResponse.message || 'Unable to verify admin session.');
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    const nextUser = extractUser(response);

    setUser(nextUser);
    setError(null);
    setIsLoading(false);
    setHasInitialized(true);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    await http.post<unknown>(ENDPOINTS.ADMIN.AUTH.LOGOUT, undefined, {
      throwOnError: false,
    });

    setUser(null);
    setError(null);
    setIsLoading(false);
    router.replace(PATHS.ADMIN.LOGIN);
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
 */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
};

export default AuthProvider;
