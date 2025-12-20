/**
 * Custom hooks for admin operations
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '../api/client';
import {
  Game,
  SettleGameRequest,
  SettleGameResponse,
} from '../api/types';

/**
 * Hook for fetching all games (admin)
 * Returns all games including upcoming and finished
 */
export function useAllGames() {
  const { data: session } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    if (!session?.user?.accessToken) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch from the test endpoint that returns all games
      const response = await apiClient.get<{ success: boolean; games: Game[] }>(
        '/get-games',
        session.user.accessToken
      );

      setGames(response.games || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    games,
    loading,
    error,
    fetchGames,
  };
}

/**
 * Hook for settling a game (admin)
 * Awards points to winners and updates bet statuses
 */
export function useSettleGame() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settleGame = async (
    gameId: string,
    scores: SettleGameRequest
  ): Promise<SettleGameResponse | null> => {
    if (!session?.user?.accessToken) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<SettleGameResponse>(
        `/games/${gameId}/settle`,
        scores,
        session.user.accessToken
      );

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to settle game');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    settleGame,
    loading,
    error,
  };
}

/**
 * Hook for deleting all bets (admin)
 * Used for testing/resetting the application
 */
export function useDeleteAllBets() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAllBets = async (): Promise<{ success: boolean; deletedCount: number } | null> => {
    if (!session?.user?.accessToken) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
        deletedCount: number;
      }>('/bets', session.user.accessToken);

      return {
        success: response.success,
        deletedCount: response.deletedCount,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bets');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteAllBets,
    loading,
    error,
  };
}
