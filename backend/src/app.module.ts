import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { BetsModule } from './bets/bets.module';
import { DatabaseModule } from './database/database.module';
import { OddsApiModule } from './odds-api/odds-api.module';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    GamesModule,
    BetsModule,
    OddsApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
