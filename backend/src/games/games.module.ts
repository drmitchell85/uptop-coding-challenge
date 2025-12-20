import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/game.schema';
import { GamesService } from './games.service';
import { OddsApiModule } from '../odds-api/odds-api.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    OddsApiModule,
  ],
  providers: [GamesService],
  exports: [MongooseModule, GamesService],
})
export class GamesModule {}
