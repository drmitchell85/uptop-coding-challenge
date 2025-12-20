'use client';

import { Game } from '@/lib/api/types';
import { format } from 'date-fns';

interface GameCardProps {
  game: Game;
}

/**
 * GameCard component
 * Displays game information including teams, start time, and point spread
 */
export function GameCard({ game }: GameCardProps) {
  const formattedDate = format(new Date(game.startTime), 'EEEE, MMMM d');
  const formattedTime = format(new Date(game.startTime), 'h:mm a');

  // Determine if spread favors Cavaliers
  const isCavsFavored = game.spread < 0;
  const spreadValue = Math.abs(game.spread);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200">
      {/* Date and Time */}
      <div className="text-center mb-4">
        <div className="text-sm font-medium text-gray-600">{formattedDate}</div>
        <div className="text-2xl font-bold text-gray-900">{formattedTime}</div>
      </div>

      {/* Teams Display */}
      <div className="flex items-center justify-between mb-6">
        {/* Away Team */}
        <div className={`flex-1 text-center p-4 rounded-lg ${
          !game.isCavaliersHome ? 'bg-wine-600 text-white' : 'bg-white'
        }`}>
          <div className="text-xs uppercase tracking-wide font-semibold mb-1 opacity-75">
            Away
          </div>
          <div className="text-lg font-bold">
            {game.awayTeam.replace('Cleveland Cavaliers', 'Cavaliers')}
          </div>
        </div>

        {/* VS Divider */}
        <div className="px-4 text-2xl font-bold text-gray-400">VS</div>

        {/* Home Team */}
        <div className={`flex-1 text-center p-4 rounded-lg ${
          game.isCavaliersHome ? 'bg-wine-600 text-white' : 'bg-white'
        }`}>
          <div className="text-xs uppercase tracking-wide font-semibold mb-1 opacity-75">
            Home
          </div>
          <div className="text-lg font-bold">
            {game.homeTeam.replace('Cleveland Cavaliers', 'Cavaliers')}
          </div>
        </div>
      </div>

      {/* Point Spread Information */}
      <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Point Spread:</span>
          <span className="text-2xl font-bold text-indigo-600">
            {game.spread > 0 ? '+' : ''}{game.spread}
          </span>
        </div>
        <div className="text-sm text-gray-600 leading-relaxed">
          {game.spreadExplanation}
        </div>

        {/* Visual Spread Indicator */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className={`font-semibold ${isCavsFavored ? 'text-green-700' : 'text-gray-500'}`}>
              {isCavsFavored ? '✓ Favored' : 'Underdog'}
            </div>
            <div className="text-gray-600">
              {spreadValue} point{spreadValue !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Game Status Badge */}
      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          {game.status === 'upcoming' ? 'Upcoming Game' : 'Game Finished'}
        </span>
      </div>
    </div>
  );
}

// Tailwind custom color configuration note:
// The wine-600 color is used for Cavaliers branding (wine and gold)
// If not defined in tailwind.config, it will fall back gracefully
