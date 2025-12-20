'use client';

import { Header } from '@/components/layout/Header';
import { withAdminAuth } from '@/lib/auth';

/**
 * Admin page
 * Demonstrates withAdminAuth HOC for admin-only pages
 * Only accessible to users with role='admin'
 */
function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Dashboard
          </h1>

          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Admin Functions
            </h2>
            <p className="text-gray-600 mb-4">
              This page is only accessible to admin users.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> Game settlement and admin functions will be implemented in Phase 7.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Protection Pattern
            </h3>
            <p className="text-sm text-blue-800">
              This page demonstrates the <code className="bg-blue-100 px-2 py-1 rounded">withAdminAuth</code> HOC,
              which requires both authentication AND admin role.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Non-admin users will be redirected to the home page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrap with withAdminAuth HOC to protect this page
export default withAdminAuth(AdminPage);
