import { BetSelection, BetStatus } from '../schemas/bet.schema';

export interface IBet {
  _id?: string;
  userId: string;
  gameId: string;
  selection: BetSelection;
  status: BetStatus;
  pointsAwarded: number;
  createdAt?: Date;
  updatedAt?: Date;
}
