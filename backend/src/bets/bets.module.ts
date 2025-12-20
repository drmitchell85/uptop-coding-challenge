import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from './schemas/bet.schema';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { GamesModule } from '../games/games.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bet.name, schema: BetSchema }]),
    GamesModule, // Import to access Game model
    AuthModule, // Import to use JwtAuthGuard
  ],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [MongooseModule, BetsService],
})
export class BetsModule {}
