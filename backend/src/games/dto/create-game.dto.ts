import { GameStatus } from '../schemas/game.schema';

export class CreateGameDto {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;
  status?: GameStatus;
}
