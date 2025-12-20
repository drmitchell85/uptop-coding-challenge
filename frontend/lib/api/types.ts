/**
 * TypeScript types for API requests and responses
 */

// Game types
export interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  spread: number;
  status: 'upcoming' | 'finished';
  finalHomeScore?: number;
  finalAwayScore?: number;
  isCavaliersHome: boolean;
  spreadExplanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNextGameResponse {
  success: boolean;
  game: Game | null;
}

export interface FetchNextGameResponse {
  success: boolean;
  message: string;
  game?: Game;
}

// Bet types
export type BetSelection = 'cavaliers' | 'opponent';
export type BetStatus = 'pending' | 'won' | 'lost' | 'push';

export interface Bet {
  _id: string;
  userId: string;
  gameId: string;
  selection: BetSelection;
  status: BetStatus;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
  game?: Game;
}

export interface CreateBetRequest {
  gameId: string;
  selection: BetSelection;
}

export interface CreateBetResponse {
  success: boolean;
  bet: Bet;
}

export interface GetBetsResponse {
  success: boolean;
  bets: Bet[];
}

// Settlement types (admin)
export interface SettleGameRequest {
  finalHomeScore: number;
  finalAwayScore: number;
}

export interface SettleGameResponse {
  success: boolean;
  message: string;
  game: Game;
  betsSettled: number;
  pointsAwarded: number;
}
