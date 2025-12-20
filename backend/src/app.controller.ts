import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { OddsApiService } from './odds-api/odds-api.service';
import { GamesService } from './games/games.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly oddsApiService: OddsApiService,
    private readonly gamesService: GamesService,
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

  @Get('test-next-game')
  async testNextGame() {
    try {
      const nextGame = await this.gamesService.fetchNextCavaliersGame();

      if (!nextGame) {
        return {
          success: true,
          message: 'No upcoming Cavaliers games found',
          nextGame: null,
        };
      }

      return {
        success: true,
        nextGame: {
          gameId: nextGame.gameId,
          homeTeam: nextGame.homeTeam,
          awayTeam: nextGame.awayTeam,
          startTime: nextGame.startTime,
          spread: nextGame.spread,
          status: nextGame.status,
          // Additional context
          isCavaliersHome: nextGame.homeTeam === 'Cleveland Cavaliers',
          spreadExplanation:
            nextGame.spread < 0
              ? `Cavaliers favored by ${Math.abs(nextGame.spread)} points`
              : `Cavaliers underdogs by ${nextGame.spread} points`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('test-all-games')
  async testAllGames() {
    try {
      const games = await this.gamesService.fetchAllCavaliersGames();

      return {
        success: true,
        totalGames: games.length,
        games: games.map((game) => ({
          gameId: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          startTime: game.startTime,
          spread: game.spread,
          isCavaliersHome: game.homeTeam === 'Cleveland Cavaliers',
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sync-next-game')
  async syncNextGame() {
    try {
      const game = await this.gamesService.syncNextCavaliersGame();

      if (!game) {
        return {
          success: true,
          message: 'No upcoming Cavaliers game to sync',
          game: null,
        };
      }

      return {
        success: true,
        message: 'Next Cavaliers game synced to database',
        game: {
          id: game._id,
          gameId: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          startTime: game.startTime,
          spread: game.spread,
          status: game.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sync-all-games')
  async syncAllGames() {
    try {
      const games = await this.gamesService.syncAllCavaliersGames();

      return {
        success: true,
        message: `Synced ${games.length} Cavaliers game(s) to database`,
        totalGames: games.length,
        games: games.map((game) => ({
          id: game._id,
          gameId: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          startTime: game.startTime,
          spread: game.spread,
          status: game.status,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('get-games')
  async getGames() {
    try {
      const games = await this.gamesService.getUpcomingGames();

      return {
        success: true,
        totalGames: games.length,
        games: games.map((game) => ({
          id: game._id,
          gameId: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          startTime: game.startTime,
          spread: game.spread,
          status: game.status,
          createdAt: game['createdAt'],
          updatedAt: game['updatedAt'],
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
