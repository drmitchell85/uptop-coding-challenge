import { GameStatus } from '../schemas/game.schema';

/**
 * Response DTO for game data
 * Used for GET /games/next endpoint
 */
export class GameResponseDto {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;
  status: GameStatus;
  createdAt?: Date;
  updatedAt?: Date;

  /**
   * Helper text explaining the spread from Cavaliers perspective
   */
  spreadExplanation?: string;

  /**
   * Whether Cavaliers are the home team
   */
  isCavaliersHome?: boolean;
}

/**
 * Success response wrapper
 */
export class GameSuccessResponseDto {
  success: true;
  game: GameResponseDto | null;
  message?: string;
}

/**
 * Error response wrapper
 */
export class GameErrorResponseDto {
  success: false;
  error: string;
  message?: string;
}

/**
 * Union type for all game responses
 */
export type GameApiResponse = GameSuccessResponseDto | GameErrorResponseDto;
