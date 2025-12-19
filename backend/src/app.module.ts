import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { BetsModule } from './bets/bets.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, AuthModule, GamesModule, BetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
