import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GameResponseDto,
  GameSuccessResponseDto,
  GameErrorResponseDto,
  GameApiResponse,
} from './dto/game-response.dto';

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly gamesService: GamesService) {}

  /**
   * GET /games/next
   * Get the next upcoming Cleveland Cavaliers game from database
   * Public endpoint - no authentication required
   *
   * @returns Next Cavaliers game with spread data
   */
  @Get('next')
  async getNextGame(): Promise<GameApiResponse> {
    try {
      this.logger.log('📋 Fetching next Cavaliers game from database...');

      // Get upcoming games from database (limit 1)
      const games = await this.gamesService.getUpcomingGames(1);

      if (games.length === 0) {
        return {
          success: true,
          game: null,
          message: 'No upcoming Cavaliers games found in database',
        };
      }

      const game = games[0];

      // Map to response DTO
      const gameResponse: GameResponseDto = {
        id: game._id.toString(),
        gameId: game.gameId,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        startTime: game.startTime,
        spread: game.spread,
        status: game.status,
        createdAt: game['createdAt'],
        updatedAt: game['updatedAt'],
        isCavaliersHome: game.homeTeam === 'Cleveland Cavaliers',
        spreadExplanation:
          game.spread < 0
            ? `Cavaliers favored by ${Math.abs(game.spread)} points`
            : game.spread > 0
              ? `Cavaliers underdogs by ${game.spread} points`
              : 'Even spread (pick \'em)',
      };

      this.logger.log(
        `✅ Retrieved next game: ${gameResponse.awayTeam} @ ${gameResponse.homeTeam}`,
      );

      return {
        success: true,
        game: gameResponse,
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch next game:', error);

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch next game',
          message: 'An error occurred while fetching the next game',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /games/next
   * Fetch and sync the next Cleveland Cavaliers game from The Odds API
   * Requires authentication
   *
   * @returns The synced game data
   */
  @Post('next')
  @UseGuards(JwtAuthGuard)
  async syncNextGame(): Promise<GameApiResponse> {
    try {
      this.logger.log('🔄 Syncing next Cavaliers game from Odds API...');

      // Fetch and store next game from Odds API
      const game = await this.gamesService.syncNextCavaliersGame();

      if (!game) {
        return {
          success: true,
          game: null,
          message: 'No upcoming Cavaliers games found on Odds API',
        };
      }

      // Map to response DTO
      const gameResponse: GameResponseDto = {
        id: game._id.toString(),
        gameId: game.gameId,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        startTime: game.startTime,
        spread: game.spread,
        status: game.status,
        createdAt: game['createdAt'],
        updatedAt: game['updatedAt'],
        isCavaliersHome: game.homeTeam === 'Cleveland Cavaliers',
        spreadExplanation:
          game.spread < 0
            ? `Cavaliers favored by ${Math.abs(game.spread)} points`
            : game.spread > 0
              ? `Cavaliers underdogs by ${game.spread} points`
              : 'Even spread (pick \'em)',
      };

      this.logger.log(
        `✅ Synced next game: ${gameResponse.awayTeam} @ ${gameResponse.homeTeam}`,
      );

      return {
        success: true,
        game: gameResponse,
        message: 'Next Cavaliers game synced successfully',
      };
    } catch (error) {
      this.logger.error('❌ Failed to sync next game:', error);

      // Handle specific error types
      if (error.response?.status === 401) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid Odds API key',
            message: 'Authentication with Odds API failed',
          },
          HttpStatus.BAD_GATEWAY,
        );
      }

      if (error.response?.status === 429) {
        throw new HttpException(
          {
            success: false,
            error: 'Odds API rate limit exceeded',
            message: 'Too many requests to Odds API',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to sync next game',
          message: 'An error occurred while syncing the next game',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
