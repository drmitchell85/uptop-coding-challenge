'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, ApiError } from '../api/client';
import {
  Game,
  GetNextGameResponse,
  FetchNextGameResponse,
} from '../api/types';

/**
 * Hook for fetching the next Cavaliers game
 */
export function useNextGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<GetNextGameResponse>('/games/next');
        setGame(response.game);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to fetch game');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, []);

  return { game, loading, error };
}

/**
 * Hook for fetching and storing the next game from Odds API
 */
export function useFetchNextGame() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndStoreGame = async (): Promise<Game | null> => {
    if (!session?.user?.accessToken) {
      setError('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<FetchNextGameResponse>(
        '/games/next',
        undefined,
        session.user.accessToken
      );
      return response.game || null;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch game');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchAndStoreGame, loading, error };
}
