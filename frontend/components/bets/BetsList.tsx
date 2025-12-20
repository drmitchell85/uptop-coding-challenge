'use client';

import { useBets } from '@/lib/hooks/useBets';
import { Bet, BetStatus } from '@/lib/api/types';
import { format } from 'date-fns';

/**
 * BetsList component
 * Displays user's betting history with status and points earned
 */
export function BetsList() {
  const { bets, loading, error } = useBets();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
        <p className="text-sm text-gray-600">Loading bets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-sm text-red-600 font-medium mb-1">Error loading bets</p>
        <p className="text-xs text-gray-600">{error}</p>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-sm text-gray-600 font-medium mb-1">No bets yet</p>
        <p className="text-xs text-gray-500">
          Place your first bet on an upcoming game!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {bets.map((bet) => (
        <BetCard key={bet.id} bet={bet} />
      ))}
    </div>
  );
}

/**
 * Individual bet card component
 */
function BetCard({ bet }: { bet: Bet }) {
  const statusConfig = getStatusConfig(bet.status);

  // Get team names
  const game = bet.game;
  const opponentTeam = game?.isCavaliersHome ? game.awayTeam : game?.homeTeam;
  const selectedTeamName = bet.selection === 'cavaliers' ? 'Cavaliers' : opponentTeam;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
        >
          <span className="mr-1">{statusConfig.icon}</span>
          {statusConfig.label}
        </span>
        {bet.pointsAwarded > 0 && (
          <span className="text-sm font-bold text-green-700">
            +{bet.pointsAwarded} pts
          </span>
        )}
      </div>

      {/* Game Info */}
      {game && (
        <div className="mb-2">
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {game.homeTeam.replace('Cleveland Cavaliers', 'Cavs')} vs{' '}
            {game.awayTeam.replace('Cleveland Cavaliers', 'Cavs')}
          </div>
          <div className="text-xs text-gray-600">
            {format(new Date(game.startTime), 'MMM d, h:mm a')}
          </div>
        </div>
      )}

      {/* Selection */}
      <div className="bg-white border border-gray-200 rounded px-3 py-2">
        <div className="text-xs text-gray-600 mb-1">Your Pick:</div>
        <div className="text-sm font-bold text-gray-900">{selectedTeamName}</div>
        {game && (
          <div className="text-xs text-gray-500 mt-1">
            Spread: {bet.selection === 'cavaliers'
              ? (game.spread > 0 ? `+${game.spread}` : game.spread)
              : (game.spread > 0 ? game.spread : `+${Math.abs(game.spread)}`)}
          </div>
        )}
      </div>

      {/* Final Score (if game finished) */}
      {game?.status === 'finished' && game.finalHomeScore !== undefined && game.finalAwayScore !== undefined && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
          Final: {game.homeTeam.replace('Cleveland Cavaliers', 'Cavs')} {game.finalHomeScore} - {game.awayTeam.replace('Cleveland Cavaliers', 'Cavs')} {game.finalAwayScore}
        </div>
      )}

      {/* Pending message */}
      {bet.status === 'pending' && (
        <div className="mt-2 text-xs text-gray-500 italic">
          Waiting for game to finish...
        </div>
      )}
    </div>
  );
}

/**
 * Get styling configuration for bet status
 */
function getStatusConfig(status: BetStatus) {
  switch (status) {
    case 'won':
      return {
        icon: '🎉',
        label: 'Won',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
    case 'lost':
      return {
        icon: '😞',
        label: 'Lost',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      };
    case 'push':
      return {
        icon: '🤝',
        label: 'Push',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      };
    case 'pending':
    default:
      return {
        icon: '⏳',
        label: 'Pending',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      };
  }
}
