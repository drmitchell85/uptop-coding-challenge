import { GameStatus } from '../schemas/game.schema';

export interface IGame {
  _id?: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;
  status: GameStatus;
  finalHomeScore?: number;
  finalAwayScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
