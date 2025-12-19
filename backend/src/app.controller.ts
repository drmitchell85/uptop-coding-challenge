import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OddsApiService } from './odds-api/odds-api.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly oddsApiService: OddsApiService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-odds')
  async testOdds() {
    try {
      // Test health check first
      const isHealthy = await this.oddsApiService.healthCheck();

      if (!isHealthy) {
        return {
          success: false,
          message: 'Odds API health check failed',
        };
      }

      // Fetch NBA odds
      const games = await this.oddsApiService.fetchNbaOdds();

      // Filter for Cavaliers games
      const cavaliersGames = games.filter(
        (game) =>
          game.home_team === 'Cleveland Cavaliers' ||
          game.away_team === 'Cleveland Cavaliers',
      );

      return {
        success: true,
        totalGames: games.length,
        cavaliersGames: cavaliersGames.length,
        nextCavaliersGame: cavaliersGames[0] || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
