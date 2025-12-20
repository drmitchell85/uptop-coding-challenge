import { IsNumber, Min } from 'class-validator';

/**
 * DTO for settling a game with final scores
 */
export class SettleGameDto {
  @IsNumber()
  @Min(0)
  finalHomeScore: number;

  @IsNumber()
  @Min(0)
  finalAwayScore: number;
}

/**
 * Response DTO for game settlement
 */
export class SettleGameResponseDto {
  success: true;
  message: string;
  game: {
    id: string;
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    finalHomeScore: number;
    finalAwayScore: number;
    status: string;
  };
  betsSettled: {
    total: number;
    won: number;
    lost: number;
    push: number;
  };
}

/**
 * Error response for settlement
 */
export class SettleGameErrorResponseDto {
  success: false;
  error: string;
  message?: string;
}

export type SettleGameApiResponse =
  | SettleGameResponseDto
  | SettleGameErrorResponseDto;
