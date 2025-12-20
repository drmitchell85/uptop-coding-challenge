'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

/**
 * Options for withAuth HOC
 */
interface WithAuthOptions {
  redirectTo?: string;
  loadingComponent?: ComponentType;
}

/**
 * Higher-Order Component for protecting pages
 *
 * Usage:
 * ```tsx
 * function MyProtectedPage() {
 *   return <div>Protected content</div>;
 * }
 * export default withAuth(MyProtectedPage);
 * ```
 */
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/signin', loadingComponent: LoadingComponent } = options;

  return function ProtectedComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      // Redirect to sign-in if not authenticated
      if (status === 'unauthenticated') {
        router.push(redirectTo);
      }
    }, [status, router]);

    // Show loading state while checking authentication
    if (status === 'loading') {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    // Don't render content if unauthenticated (will redirect)
    if (status === 'unauthenticated') {
      return null;
    }

    // Render component for authenticated users
    return <Component {...props} />;
  };
}
