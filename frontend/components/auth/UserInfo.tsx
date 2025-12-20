'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { SignOutButton } from './SignOutButton';

/**
 * User info component
 * Displays authenticated user information and sign out button
 */
export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-300 h-8 w-32 rounded"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/signin"
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {session.user.name || session.user.email}
        </p>
        <p className="text-xs text-gray-600">
          💰 {session.user.points.toLocaleString()} points
        </p>
      </div>
      <SignOutButton />
    </div>
  );
}
