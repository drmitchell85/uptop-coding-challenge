'use client';

import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * User profile page
 * Demonstrates ProtectedRoute component wrapper pattern
 */
export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              My Profile
            </h1>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-lg text-gray-900">
                    {session?.user?.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-lg text-gray-900">
                    {session?.user?.name || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Balance
                  </label>
                  <p className="text-2xl font-bold text-indigo-600">
                    💰 {session?.user?.points.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-lg text-gray-900 capitalize">
                    {session?.user?.role}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    This page demonstrates the <code className="bg-gray-100 px-2 py-1 rounded">ProtectedRoute</code> component wrapper pattern for protecting content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
