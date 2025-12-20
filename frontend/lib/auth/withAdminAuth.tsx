'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';

/**
 * Options for withAdminAuth HOC
 */
interface WithAdminAuthOptions {
  redirectTo?: string;
  loadingComponent?: ComponentType;
}

/**
 * Higher-Order Component for protecting admin-only pages
 * Requires user to be authenticated AND have admin role
 *
 * Usage:
 * ```tsx
 * function AdminPage() {
 *   return <div>Admin content</div>;
 * }
 * export default withAdminAuth(AdminPage);
 * ```
 */
export function withAdminAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAdminAuthOptions = {}
) {
  const { redirectTo = '/', loadingComponent: LoadingComponent } = options;

  return function ProtectedAdminComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      // Redirect to home if not authenticated
      if (status === 'unauthenticated') {
        router.push('/signin');
        return;
      }

      // Redirect to home if authenticated but not admin
      if (status === 'authenticated' && session?.user?.role !== 'admin') {
        router.push(redirectTo);
      }
    }, [status, session, router]);

    // Show loading state while checking authentication
    if (status === 'loading') {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying admin access...</p>
          </div>
        </div>
      );
    }

    // Don't render if unauthenticated or not admin
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      return null;
    }

    // Render component for admin users
    return <Component {...props} />;
  };
}
