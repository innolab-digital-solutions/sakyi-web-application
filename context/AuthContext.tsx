'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { ROUTES } from '@/config/routes';
import { authService } from '@/domains/auth/auth.service';
import type { User } from '@/domains/user/types';

type AuthContextValue = {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  hasInitialized: boolean;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

/**
 * Provides authentication session state and management functions to the React component tree.
 *
 * - Tracks the current logged-in user and session authentication state.
 * - Handles session initialization, user loading, logout, authentication errors, and loading state.
 * - Exposes actions for session validation (checkSession) and logout, as well as useful flags (isAuthenticated, isReady, isLoading).
 * - Persists authentication state in memory for descendant components.
 *
 * @param {React.PropsWithChildren} props - The children to be wrapped by the authentication provider.
 * @returns {JSX.Element} The provider component supplying authentication context to its descendants.
 *
 * Context value:
 *   - user: The authenticated user object (or null if not authenticated).
 *   - isAuthenticated: Boolean indicating if a user is currently authenticated.
 *   - isLoading: Boolean indicating whether authentication/session state is currently being determined or a mutation is in progress.
 *   - hasInitialized: Boolean indicating if authentication state has been initialized.
 *   - error: An error message related to authentication (or null if there is no error).
 *   - checkSession: Function to manually verify and refresh the current session/user.
 *   - logout: Function to log out the current user and reset session state.
 *
 * Usage:
 *   Wrap application components in <AuthProvider> to enable authentication session tracking and access management actions.
 */
export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();

  const [user, setUser] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = React.useState<boolean>(false);

  /**
   * Verifies and refreshes the current authentication session state.
   *
   * - Initiates an API call to load the authenticated user (via authService.me).
   * - Updates the user state if authenticated, or clears it and sets an error on failure.
   * - Adjusts loading and initialization flags to reflect session resolution.
   *
   * @returns {Promise<void>} Resolves when session check and context state updates are complete.
   *
   * Usage:
   *   Call to manually refresh authentication context/user after login, logout, or app boot.
   */
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

  /**
   * Logs out the current user by calling the backend logout endpoint.
   *
   * - Performs a logout API call to invalidate the session.
   * - Resets user and authentication state on successful logout.
   * - Redirects the user to the login page.
   * - Sets appropriate loading states during the operation.
   *
   * @returns {Promise<void>} Resolves when logout and redirect are complete.
   */
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

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        isLoading,
        hasInitialized,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
