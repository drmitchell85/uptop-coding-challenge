import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateBetDto } from './dto/create-bet.dto';
import {
  BetResponseDto,
  CreateBetApiResponse,
  GetBetsApiResponse,
} from './dto/bet-response.dto';

@Controller('bets')
@UseGuards(JwtAuthGuard) // All bet endpoints require authentication
export class BetsController {
  private readonly logger = new Logger(BetsController.name);

  constructor(private readonly betsService: BetsService) {}

  /**
   * POST /bets
   * Create a new bet for the authenticated user
   * Requires authentication
   *
   * @param req - Request with authenticated user
   * @param createBetDto - Bet data (gameId, selection)
   * @returns The created bet
   */
  @Post()
  async createBet(
    @Request() req,
    @Body() createBetDto: CreateBetDto,
  ): Promise<CreateBetApiResponse> {
    try {
      const userId = req.user.id;

      this.logger.log(
        `🎲 User ${userId} placing bet on game ${createBetDto.gameId}`,
      );

      // Create the bet
      const { bet, updatedPoints } = await this.betsService.createBet(userId, createBetDto);

      // Map to response DTO
      const betResponse: BetResponseDto = {
        id: bet._id.toString(),
        userId: bet.userId.toString(),
        gameId: bet.gameId.toString(),
        selection: bet.selection,
        status: bet.status,
        pointsAwarded: bet.pointsAwarded,
        createdAt: bet['createdAt'],
        updatedAt: bet['updatedAt'],
      };

      this.logger.log(`✅ Bet created: ${betResponse.id}`);

      return {
        success: true,
        bet: betResponse,
        updatedPoints,
        message: 'Bet placed successfully',
      };
    } catch (error) {
      this.logger.error('❌ Failed to create bet:', error);

      // Handle specific error types
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            success: false,
            error: error.message,
            message: 'Game not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.status === HttpStatus.CONFLICT) {
        throw new HttpException(
          {
            success: false,
            error: error.message,
            message: 'Duplicate bet',
          },
          HttpStatus.CONFLICT,
        );
      }

      if (error.status === HttpStatus.BAD_REQUEST) {
        throw new HttpException(
          {
            success: false,
            error: error.message,
            message: 'Invalid bet data',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to create bet',
          message: 'An error occurred while creating the bet',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /bets
   * Get all bets for the authenticated user
   * Requires authentication
   *
   * @param req - Request with authenticated user
   * @returns Array of user's bets with populated game data
   */
  @Get()
  async getUserBets(@Request() req): Promise<GetBetsApiResponse> {
    try {
      const userId = req.user.id;

      this.logger.log(`📋 Fetching bets for user ${userId}`);

      // Get user's bets with populated game data
      const bets = await this.betsService.getUserBets(userId, true);

      // Map to response DTOs
      const betsResponse: BetResponseDto[] = bets.map((bet) => {
        // Check if gameId is populated (object) or just an ObjectId
        const isPopulated =
          bet.gameId && typeof bet.gameId === 'object' && '_id' in bet.gameId;
        const gameIdString = isPopulated
          ? (bet.gameId as any)._id.toString()
          : bet.gameId.toString();

        const response: BetResponseDto = {
          id: bet._id.toString(),
          userId: bet.userId.toString(),
          gameId: gameIdString,
          selection: bet.selection,
          status: bet.status,
          pointsAwarded: bet.pointsAwarded,
          createdAt: bet['createdAt'],
          updatedAt: bet['updatedAt'],
        };

        // Add populated game data if available
        if (isPopulated) {
          const game = bet.gameId as any;
          response.game = {
            gameId: game.gameId,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            startTime: game.startTime,
            spread: game.spread,
            status: game.status,
          };
        }

        return response;
      });

      this.logger.log(`✅ Retrieved ${betsResponse.length} bet(s)`);

      return {
        success: true,
        bets: betsResponse,
        total: betsResponse.length,
      };
    } catch (error) {
      this.logger.error('❌ Failed to fetch user bets:', error);

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to fetch bets',
          message: 'An error occurred while fetching your bets',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * DELETE /bets
   * Delete user's own bets
   * Used for testing/resetting your own bets
   *
   * @returns Deletion confirmation
   */
  @Delete()
  async deleteMyBets(@Request() req): Promise<{ success: boolean; message: string; deletedCount: number }> {
    try {
      const userId = req.user.id;

      this.logger.log(`🗑️  User ${userId} deleting their bets...`);

      const deletedCount = await this.betsService.deleteMyBets(userId);

      this.logger.log(`✅ Deleted ${deletedCount} bet(s) for user ${userId}`);

      return {
        success: true,
        message: 'Your bets deleted successfully',
        deletedCount,
      };
    } catch (error) {
      this.logger.error('❌ Failed to delete bets:', error);

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Failed to delete bets',
          message: 'An error occurred while deleting bets',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
