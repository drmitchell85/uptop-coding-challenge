'use client';

import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {status === 'loading' ? (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
              </div>
            </div>
          ) : !session ? (
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Welcome to Cavaliers Betting! 🏀
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Play-to-Earn betting on Cleveland Cavaliers point spreads
              </p>

              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  How It Works
                </h2>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-3">🔐</div>
                    <h3 className="font-semibold text-gray-900 mb-2">1. Sign In</h3>
                    <p className="text-sm text-gray-600">
                      Create an account and get 1000 starting points
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="font-semibold text-gray-900 mb-2">2. Place Bets</h3>
                    <p className="text-sm text-gray-600">
                      Bet on Cavaliers point spreads for upcoming games
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <h3 className="font-semibold text-gray-900 mb-2">3. Earn Points</h3>
                    <p className="text-sm text-gray-600">
                      Win 100 points for each correct prediction
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/signin"
                className="inline-block px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-lg hover:shadow-xl"
              >
                Get Started - Sign In
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {session.user.name}! 🏀
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                You have <span className="font-bold text-indigo-600">{session.user.points.toLocaleString()}</span> points
              </p>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Ready to bet on the Cavaliers?
                </h2>
                <p className="text-gray-600 mb-6">
                  Betting interface coming soon in Phase 6!
                </p>
                <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Next up:</strong> We'll add the game display and betting interface where you can place bets on upcoming Cavaliers games.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
