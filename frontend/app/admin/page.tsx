'use client';

import { Header } from '@/components/layout/Header';
import { GameSettlement } from '@/components/admin/GameSettlement';
import { withAdminAuth } from '@/lib/auth';

/**
 * Admin page
 * Game settlement interface for admin users
 * Only accessible to users with role='admin'
 */
function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🛡️ Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Manage games and settle bets
            </p>
          </div>

          {/* Game Settlement Interface */}
          <GameSettlement />

          {/* Info Footer */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Admin Access
            </h3>
            <p className="text-sm text-blue-800">
              This page is protected by the <code className="bg-blue-100 px-2 py-1 rounded">withAdminAuth</code> HOC,
              which requires both authentication AND admin role.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Only admin users can settle games and award points to winners.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrap with withAdminAuth HOC to protect this page
export default withAdminAuth(AdminPage);
