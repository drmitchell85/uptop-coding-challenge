'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 * Wraps content that requires authentication
 * Automatically redirects unauthenticated users to sign-in page
 */
export function ProtectedRoute({
  children,
  loadingComponent,
  redirectTo = '/signin',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <>
        {loadingComponent || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Don't render content if unauthenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  // Render protected content for authenticated users
  return <>{children}</>;
}
