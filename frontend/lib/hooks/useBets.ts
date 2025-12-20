'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient, ApiError } from '../api/client';
import {
  Bet,
  CreateBetRequest,
  CreateBetResponse,
  GetBetsResponse,
} from '../api/types';

/**
 * Hook for managing user bets
 */
export function useBets() {
  const { data: session } = useSession();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = useCallback(async () => {
    if (!session?.user?.accessToken) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<GetBetsResponse>(
        '/bets',
        session.user.accessToken
      );
      setBets(response.bets);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch bets');
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.accessToken]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  return { bets, loading, error, refetch: fetchBets };
}

/**
 * Hook for creating a bet
 */
export function useCreateBet() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBet = async (
    request: CreateBetRequest
  ): Promise<Bet | null> => {
    if (!session?.user?.accessToken) {
      setError('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<CreateBetResponse>(
        '/bets',
        request,
        session.user.accessToken
      );
      return response.bet;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create bet');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createBet, loading, error };
}
