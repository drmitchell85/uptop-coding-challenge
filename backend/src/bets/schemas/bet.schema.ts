import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BetDocument = HydratedDocument<Bet>;

export enum BetSelection {
  CAVALIERS = 'cavaliers',
  OPPONENT = 'opponent',
}

export enum BetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  PUSH = 'push',
}

@Schema({ timestamps: true })
export class Bet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;

  @Prop({ required: true, enum: BetSelection })
  selection: BetSelection;

  @Prop({ required: true, enum: BetStatus, default: BetStatus.PENDING })
  status: BetStatus;

  @Prop({ default: 0 })
  pointsAwarded: number;
}

export const BetSchema = SchemaFactory.createForClass(Bet);

// Add indexes
BetSchema.index({ userId: 1 });
BetSchema.index({ gameId: 1 });
BetSchema.index({ status: 1 });
// Compound index to prevent duplicate bets per user per game
BetSchema.index({ userId: 1, gameId: 1 }, { unique: true });
