'use client';

import { useState, useEffect } from 'react';
import { Game, BetSelection } from '@/lib/api/types';
import { useCreateBet, useBets } from '@/lib/hooks/useBets';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BetFormProps {
  game: Game;
  onBetPlaced?: () => void;
}

/**
 * BetForm component
 * Allows users to place bets on a game by selecting Cavaliers or Opponent
 */
export function BetForm({ game, onBetPlaced }: BetFormProps) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const { createBet, loading, error } = useCreateBet();
  const { bets } = useBets();
  const [selectedTeam, setSelectedTeam] = useState<BetSelection | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user already has a bet on this game
  const existingBet = bets.find(bet => bet.gameId === game.id);

  // Get opponent team name
  const opponentTeam = game.isCavaliersHome ? game.awayTeam : game.homeTeam;

  const handleSubmit = async () => {
    if (!selectedTeam || !session) return;

    const result = await createBet({
      gameId: game.id,
      selection: selectedTeam,
    });

    if (result) {
      const { bet, updatedPoints } = result;

      setSuccessMessage(
        `Bet placed successfully! You selected ${
          selectedTeam === 'cavaliers' ? 'Cavaliers' : opponentTeam
        }.`
      );
      setSelectedTeam(null);

      // Update session with new points balance
      await updateSession({ points: updatedPoints });

      // Call callback to refresh bets list
      if (onBetPlaced) {
        onBetPlaced();
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  // Clear messages when game changes
  useEffect(() => {
    setSuccessMessage(null);
    setSelectedTeam(null);
  }, [game.id]);

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Sign in to place bets</p>
        <a
          href="/signin"
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (existingBet) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="text-3xl mr-4">✅</div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">
              You've already placed a bet on this game!
            </h3>
            <p className="text-sm text-blue-700 mb-1">
              <strong>Your selection:</strong>{' '}
              {existingBet.selection === 'cavaliers' ? 'Cavaliers' : opponentTeam}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Status:</strong>{' '}
              <span className="capitalize">{existingBet.status}</span>
            </p>
            {existingBet.status === 'pending' && (
              <p className="text-xs text-blue-600 mt-3">
                Check back after the game to see if you won!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🎉</div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚠️</div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Team Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select your pick:
        </label>

        {/* Cavaliers Option */}
        <button
          onClick={() => setSelectedTeam('cavaliers')}
          disabled={loading}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            selectedTeam === 'cavaliers'
              ? 'border-wine-600 bg-wine-50 ring-2 ring-wine-600'
              : 'border-gray-300 bg-white hover:border-wine-400 hover:bg-wine-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedTeam === 'cavaliers'
                    ? 'border-wine-600 bg-wine-600'
                    : 'border-gray-400'
                }`}
              >
                {selectedTeam === 'cavaliers' && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="font-bold text-gray-900">
                Cleveland Cavaliers
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {game.spread < 0 ? `Favored by ${Math.abs(game.spread)}` : `+${game.spread}`}
            </span>
          </div>
        </button>

        {/* Opponent Option */}
        <button
          onClick={() => setSelectedTeam('opponent')}
          disabled={loading}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            selectedTeam === 'opponent'
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
              : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedTeam === 'opponent'
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-400'
                }`}
              >
                {selectedTeam === 'opponent' && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="font-bold text-gray-900">{opponentTeam}</span>
            </div>
            <span className="text-sm text-gray-600">
              {game.spread > 0 ? `Favored by ${Math.abs(game.spread)}` : `+${Math.abs(game.spread)}`}
            </span>
          </div>
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedTeam || loading}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
          selectedTeam && !loading
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Placing Bet...
          </div>
        ) : (
          'Place Bet (Costs 100 points)'
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-center text-gray-500 mt-2">
        Costs 100 points to place. Win 200 points (100 profit) if correct! One bet per game.
      </p>
    </div>
  );
}
