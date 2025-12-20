import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { BetSelection } from '../schemas/bet.schema';

export class CreateBetDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsEnum(BetSelection)
  @IsNotEmpty()
  selection: BetSelection;
}
