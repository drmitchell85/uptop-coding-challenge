'use client';

import { useNextGame, useBets } from '@/lib/hooks';
import { Header } from '@/components/layout/Header';
import { withAuth } from '@/lib/auth';

/**
 * Test page for API client functionality
 * This page requires authentication (demonstrates withAuth HOC)
 * This page will be removed in production
 */
function TestApiPage() {
  const { game, loading: gameLoading, error: gameError } = useNextGame();
  const { bets, loading: betsLoading, error: betsError } = useBets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            API Client Test Page
          </h1>

          {/* Test Next Game Endpoint */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              GET /games/next
            </h2>
            {gameLoading && <p className="text-gray-600">Loading...</p>}
            {gameError && (
              <p className="text-red-600">Error: {gameError}</p>
            )}
            {!gameLoading && !gameError && (
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(game, null, 2)}
              </pre>
            )}
          </div>

          {/* Test Bets Endpoint */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              GET /bets (requires authentication)
            </h2>
            {betsLoading && <p className="text-gray-600">Loading...</p>}
            {betsError && (
              <p className="text-red-600">Error: {betsError}</p>
            )}
            {!betsLoading && !betsError && (
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(bets, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Wrap with withAuth HOC to protect this page
export default withAuth(TestApiPage);
