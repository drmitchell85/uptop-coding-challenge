'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAllGames, useSettleGame, useDeleteAllBets } from '@/lib/hooks/useAdmin';
import { Game, SettleGameResponse } from '@/lib/api/types';
import { format } from 'date-fns';

/**
 * GameSettlement component
 * Admin interface for settling games with final scores
 * Awards points to winners and updates bet statuses
 */
export function GameSettlement() {
  const { games, loading: gamesLoading, error: gamesError, fetchGames } = useAllGames();
  const { settleGame, loading: settleLoading, error: settleError } = useSettleGame();
  const { deleteAllBets, loading: deleteLoading, error: deleteError } = useDeleteAllBets();
  const { update: updateSession } = useSession();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [settlementResult, setSettlementResult] = useState<SettleGameResponse | null>(null);
  const [resetResult, setResetResult] = useState<{ deletedCount: number } | null>(null);

  // Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Filter for upcoming games that can be settled
  const upcomingGames = games.filter(game => game.status === 'upcoming');
  const finishedGames = games.filter(game => game.status === 'finished');

  const handleSettle = async () => {
    if (!selectedGame || !homeScore || !awayScore) return;

    const result = await settleGame(selectedGame.id, {
      finalHomeScore: parseInt(homeScore),
      finalAwayScore: parseInt(awayScore),
    });

    if (result) {
      setSettlementResult(result);
      // Reset form
      setSelectedGame(null);
      setHomeScore('');
      setAwayScore('');
      // Refresh games list
      fetchGames();
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to RESET everything (bets, points, and games)? This cannot be undone.')) {
      return;
    }

    const result = await deleteAllBets();

    if (result) {
      setResetResult(result);
      // Clear other messages
      setSettlementResult(null);
      // Update session with reset points (1000)
      await updateSession({ points: 1000 });
      // Refresh games to update UI
      fetchGames();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Settlement</h2>
          <p className="text-gray-600">
            Select a game and enter the final scores to settle bets and award points to winners.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={deleteLoading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            deleteLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
          }`}
        >
          {deleteLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Resetting...
            </div>
          ) : (
            '🔄 RESET ALL'
          )}
        </button>
      </div>

      {/* Reset Result */}
      {resetResult && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">🗑️</div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-2">
                Reset Complete!
              </h3>
              <p className="text-orange-800">
                {resetResult.deletedCount} bet(s) deleted, points reset to 1000, and all games reset to upcoming.
              </p>
              <p className="text-sm text-orange-700 mt-2">
                Everything is back to the starting state!
              </p>
            </div>
            <button
              onClick={() => setResetResult(null)}
              className="text-orange-600 hover:text-orange-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Settlement Result */}
      {settlementResult && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-3xl mr-4">✅</div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-3">
                Game Settled Successfully!
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700 font-semibold">Game:</p>
                  <p className="text-green-800">
                    {settlementResult.game.awayTeam} {settlementResult.game.finalAwayScore} @{' '}
                    {settlementResult.game.homeTeam} {settlementResult.game.finalHomeScore}
                  </p>
                </div>
                <div>
                  <p className="text-green-700 font-semibold">Bets Settled:</p>
                  <div className="text-green-800">
                    <p>Total: {settlementResult.betsSettled.total}</p>
                    <p>Won: {settlementResult.betsSettled.won}</p>
                    <p>Lost: {settlementResult.betsSettled.lost}</p>
                    <p>Push: {settlementResult.betsSettled.push}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettlementResult(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {gamesError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading games: {gamesError}</p>
        </div>
      )}

      {settleError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error settling game: {settleError}</p>
        </div>
      )}

      {deleteError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error deleting bets: {deleteError}</p>
        </div>
      )}

      {/* Loading State */}
      {gamesLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games...</p>
        </div>
      )}

      {/* Settlement Form */}
      {!gamesLoading && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Settle a Game</h3>

          {/* Game Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Game to Settle:
            </label>
            <select
              value={selectedGame?.id || ''}
              onChange={(e) => {
                const game = upcomingGames.find(g => g.id === e.target.value);
                setSelectedGame(game || null);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition text-gray-900"
            >
              <option value="" className="text-gray-900">-- Select a game --</option>
              {upcomingGames.map((game) => (
                <option key={game.id} value={game.id} className="text-gray-900">
                  {game.awayTeam} @ {game.homeTeam} -{' '}
                  {format(new Date(game.startTime), 'MMM d, h:mm a')} (Spread: {game.spread})
                </option>
              ))}
            </select>
            {upcomingGames.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No upcoming games available to settle. All games have been settled.
              </p>
            )}
          </div>

          {/* Score Input */}
          {selectedGame && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Selected Game:</p>
                <p className="text-indigo-800">
                  {selectedGame.awayTeam} @ {selectedGame.homeTeam}
                </p>
                <p className="text-sm text-indigo-700 mt-1">
                  Spread: {selectedGame.spread} ({selectedGame.spreadExplanation})
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedGame.homeTeam} (Home) Final Score:
                  </label>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    min="0"
                    placeholder="e.g., 112"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {selectedGame.awayTeam} (Away) Final Score:
                  </label>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    min="0"
                    placeholder="e.g., 108"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition text-gray-900"
                  />
                </div>
              </div>

              <button
                onClick={handleSettle}
                disabled={!homeScore || !awayScore || settleLoading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  homeScore && awayScore && !settleLoading
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {settleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Settling Game...
                  </div>
                ) : (
                  'Settle Game & Award Points'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Finished Games List */}
      {finishedGames.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Settled Games ({finishedGames.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {finishedGames.map((game) => (
              <div
                key={game.id}
                className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {game.awayTeam} {game.finalAwayScore} @ {game.homeTeam} {game.finalHomeScore}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(game.startTime), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    ✓ Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
