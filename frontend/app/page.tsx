'use client';

import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { GameCard } from '@/components/games/GameCard';
import { BetForm } from '@/components/bets/BetForm';
import { useNextGame } from '@/lib/hooks/useGames';
import { useBets } from '@/lib/hooks/useBets';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const { game, loading: gameLoading, error: gameError } = useNextGame();
  const { refetch: refetchBets } = useBets();

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
            <div>
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {session.user.name}! 🏀
                </h1>
                <p className="text-lg text-gray-600">
                  You have <span className="font-bold text-indigo-600">{session.user.points.toLocaleString()}</span> points
                </p>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Next Game & Betting */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Next Game Section - Phase 6.2 */}
                  <section className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🏀</span>
                      Next Game
                    </h2>

                    {gameLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading game data...</p>
                      </div>
                    ) : gameError ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-red-600 font-medium mb-2">Error loading game</p>
                        <p className="text-sm text-gray-600">{gameError}</p>
                      </div>
                    ) : game ? (
                      <GameCard game={game} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4">📅</div>
                        <p className="text-gray-600 font-medium mb-2">No upcoming games</p>
                        <p className="text-sm text-gray-500">Check back soon for the next Cavaliers game!</p>
                      </div>
                    )}
                  </section>

                  {/* Betting Interface Section - Phase 6.3 */}
                  <section className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🎯</span>
                      Place Your Bet
                    </h2>

                    {gameLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Loading...</p>
                      </div>
                    ) : game ? (
                      <BetForm game={game} onBetPlaced={refetchBets} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎲</div>
                        <p className="text-gray-600 font-medium mb-2">No game available</p>
                        <p className="text-sm text-gray-500">
                          Betting will be enabled when a game is scheduled
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Column: Betting History */}
                <div className="lg:col-span-1">
                  {/* User Bets Section - Phase 6.4 */}
                  <section className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📊</span>
                      Your Bets
                    </h2>
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Betting history coming in Phase 6.4</p>
                      <p className="text-xs mt-2">Will show: Past bets, status, points earned</p>
                    </div>
                  </section>
                </div>
              </div>

              {/* Quick Stats Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700">-</div>
                  <div className="text-sm text-green-600 font-medium">Bets Placed</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700">-</div>
                  <div className="text-sm text-blue-600 font-medium">Bets Won</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700">-</div>
                  <div className="text-sm text-purple-600 font-medium">Win Rate</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
