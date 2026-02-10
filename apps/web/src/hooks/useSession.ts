'use client';

import { useSession as useNextAuthSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useCallback } from 'react';

export interface UseSessionReturn {
  session: any;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

/**
 * Custom hook to use session
 * Provides type-safe session access and sign out
 */
export const useSession = (): UseSessionReturn => {
  const { data: session, status } = useNextAuthSession();

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: true, callbackUrl: '/auth/login' });
  }, []);

  return {
    session,
    status,
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signOut,
  };
};
