import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GameDocument = HydratedDocument<Game>;

export enum GameStatus {
  UPCOMING = 'upcoming',
  FINISHED = 'finished',
}

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ required: true })
  homeTeam: string;

  @Prop({ required: true })
  awayTeam: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  spread: number;

  @Prop({ required: true, enum: GameStatus, default: GameStatus.UPCOMING })
  status: GameStatus;

  @Prop()
  finalHomeScore?: number;

  @Prop()
  finalAwayScore?: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);

// Add indexes
GameSchema.index({ gameId: 1 });
GameSchema.index({ startTime: 1 });
GameSchema.index({ status: 1 });
