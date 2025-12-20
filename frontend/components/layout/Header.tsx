'use client';

import Link from 'next/link';
import { UserInfo } from '../auth/UserInfo';

/**
 * Header component
 * Displays app title and user authentication status
 */
export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏀</span>
            <h1 className="text-xl font-bold text-gray-900">
              Cavaliers Betting
            </h1>
          </Link>

          <UserInfo />
        </div>
      </div>
    </header>
  );
}
