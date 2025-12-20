import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schemas/game.schema';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { OddsApiModule } from '../odds-api/odds-api.module';
import { AuthModule } from '../auth/auth.module';
import { BetsModule } from '../bets/bets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    OddsApiModule,
    AuthModule, // Import AuthModule to use JwtAuthGuard and User model
    forwardRef(() => BetsModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [MongooseModule, GamesService],
})
export class GamesModule implements OnModuleInit {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Called when the module has been initialized
   * Ensures mock games exist if USE_MOCK_DATA is enabled
   */
  async onModuleInit() {
    await this.gamesService.ensureMockGamesExist();
  }
}
