import { BetSelection } from '../schemas/bet.schema';

export class CreateBetDto {
  gameId: string;
  selection: BetSelection;
}
