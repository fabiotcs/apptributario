'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './useSession';

export interface UseRequireAuthOptions {
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Custom hook to protect pages that require authentication
 * Redirects to login if not authenticated or doesn't have required role
 */
export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const router = useRouter();
  const { status, user } = useSession();
  const { requiredRoles = [], redirectTo = '/auth/login' } = options;

  useEffect(() => {
    // If still loading, don't do anything
    if (status === 'loading') {
      return;
    }

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    // If authenticated but missing required role, redirect to access denied
    if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
      router.push('/auth/access-denied');
    }
  }, [status, user, requiredRoles, redirectTo, router]);

  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user,
    hasRequiredRole: !requiredRoles.length || (user && requiredRoles.includes(user.role)),
  };
};
