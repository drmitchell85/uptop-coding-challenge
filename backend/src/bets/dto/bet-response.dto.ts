import { BetSelection, BetStatus } from '../schemas/bet.schema';

/**
 * Response DTO for a single bet
 */
export class BetResponseDto {
  id: string;
  userId: string;
  gameId: string;
  selection: BetSelection;
  status: BetStatus;
  pointsAwarded: number;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Populated game data (if included)
   */
  game?: {
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
    spread: number;
    status: string;
  };
}

/**
 * Success response for creating a bet
 */
export class CreateBetSuccessResponseDto {
  success: true;
  bet: BetResponseDto;
  updatedPoints: number; // User's updated points balance after placing bet
  message?: string;
}

/**
 * Success response for getting user bets
 */
export class GetBetsSuccessResponseDto {
  success: true;
  bets: BetResponseDto[];
  total: number;
}

/**
 * Error response wrapper
 */
export class BetErrorResponseDto {
  success: false;
  error: string;
  message?: string;
}

/**
 * Union types for API responses
 */
export type CreateBetApiResponse =
  | CreateBetSuccessResponseDto
  | BetErrorResponseDto;
export type GetBetsApiResponse = GetBetsSuccessResponseDto | BetErrorResponseDto;
