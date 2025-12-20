'use client';

import { useSession } from 'next-auth/react';
import { useBets } from '@/lib/hooks/useBets';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface PointsDisplayProps {
  variant?: 'compact' | 'full';
}

/**
 * PointsDisplay component
 * Shows user's points balance with transaction history and animations
 */
export function PointsDisplay({ variant = 'full' }: PointsDisplayProps) {
  const { data: session } = useSession();
  const { bets } = useBets();
  const [animatePoints, setAnimatePoints] = useState(false);
  const [previousPoints, setPreviousPoints] = useState<number | null>(null);

  const currentPoints = session?.user?.points || 0;

  // Animate points when they change
  useEffect(() => {
    if (previousPoints !== null && currentPoints !== previousPoints) {
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);
    }
    setPreviousPoints(currentPoints);
  }, [currentPoints, previousPoints]);

  // Get winning bets sorted by date (most recent first)
  const winningBets = bets
    .filter(bet => bet.pointsAwarded > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5); // Show last 5 transactions

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg p-4 text-center shadow-md">
        <div className="text-sm font-semibold text-gray-900 mb-1">Your Points</div>
        <div
          className={`text-3xl font-bold text-white transition-all duration-300 ${
            animatePoints ? 'scale-125' : 'scale-100'
          }`}
        >
          {currentPoints.toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">💰</span>
        Points Balance
      </h2>

      {/* Current Balance */}
      <div className="bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 rounded-xl p-6 mb-6 text-center shadow-lg">
        <div className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">
          Current Balance
        </div>
        <div
          className={`text-5xl font-bold text-white transition-all duration-500 ${
            animatePoints ? 'scale-110 animate-pulse' : 'scale-100'
          }`}
        >
          {currentPoints.toLocaleString()}
        </div>
        <div className="text-xs text-gray-800 mt-2 opacity-90">points</div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <span className="mr-2">📜</span>
          Recent Transactions
        </h3>

        {winningBets.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-gray-600">No point transactions yet</p>
            <p className="text-xs text-gray-500 mt-1">Win bets to earn points!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {winningBets.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">✅</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Bet Won
                      </div>
                      {bet.game && (
                        <div className="text-xs text-gray-600">
                          {bet.game.homeTeam.replace('Cleveland Cavaliers', 'Cavs')} vs{' '}
                          {bet.game.awayTeam.replace('Cleveland Cavaliers', 'Cavs')}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {format(new Date(bet.updatedAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">
                    +{bet.pointsAwarded}
                  </div>
                  <div className="text-xs text-green-600">points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <span className="mr-1">💡</span>
            <span>Bets cost 100 pts. Win 200 pts (100 profit)!</span>
          </div>
          {winningBets.length > 0 && (
            <div className="text-green-600 font-semibold">
              {winningBets.reduce((sum, bet) => sum + bet.pointsAwarded, 0)} pts earned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
