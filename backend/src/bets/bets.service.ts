import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bet, BetDocument, BetStatus } from './schemas/bet.schema';
import { Game, GameDocument, GameStatus } from '../games/schemas/game.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { CreateBetDto } from './dto/create-bet.dto';
import { BET_COST, BET_PAYOUT } from '../common/constants';

@Injectable()
export class BetsService {
  private readonly logger = new Logger(BetsService.name);

  constructor(
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new bet for a user
   * @param userId - The authenticated user's ID
   * @param createBetDto - Bet data (gameId, selection)
   * @returns The created bet and updated points balance
   */
  async createBet(
    userId: string,
    createBetDto: CreateBetDto,
  ): Promise<{ bet: BetDocument; updatedPoints: number }> {
    try {
      this.logger.log(
        `🎲 Creating bet for user ${userId} on game ${createBetDto.gameId}`,
      );

      // Validate gameId is a valid ObjectId
      if (!Types.ObjectId.isValid(createBetDto.gameId)) {
        throw new BadRequestException('Invalid game ID format');
      }

      // Find the user
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has enough points to place bet
      if (user.points < BET_COST) {
        this.logger.warn(
          `⚠️  User ${userId} has insufficient points: ${user.points} < ${BET_COST}`,
        );
        throw new BadRequestException(
          `Insufficient points. You need ${BET_COST} points to place a bet, but you only have ${user.points} points.`,
        );
      }

      // Find the game
      const game = await this.gameModel.findById(createBetDto.gameId);

      if (!game) {
        throw new NotFoundException(
          `Game with ID ${createBetDto.gameId} not found`,
        );
      }

      // Validate game is still upcoming (not started or finished)
      if (game.status !== GameStatus.UPCOMING) {
        throw new BadRequestException(
          `Cannot place bet on game with status: ${game.status}`,
        );
      }

      // Validate game hasn't started yet
      const now = new Date();
      if (game.startTime <= now) {
        throw new BadRequestException(
          'Cannot place bet on a game that has already started',
        );
      }

      // Deduct bet cost from user's points
      user.points -= BET_COST;
      await user.save();

      this.logger.log(
        `💰 Deducted ${BET_COST} points from user ${userId}. New balance: ${user.points}`,
      );

      // Create the bet
      const bet = new this.betModel({
        userId: new Types.ObjectId(userId),
        gameId: new Types.ObjectId(createBetDto.gameId),
        selection: createBetDto.selection,
        status: BetStatus.PENDING,
        pointsAwarded: 0,
      });

      await bet.save();

      this.logger.log(`✅ Bet created successfully: ${bet._id}`);

      return { bet, updatedPoints: user.points };
    } catch (error) {
      // Handle duplicate bet error (unique constraint violation)
      if (error.code === 11000) {
        this.logger.warn(
          `⚠️  User ${userId} already has a bet on game ${createBetDto.gameId}`,
        );
        throw new ConflictException(
          'You have already placed a bet on this game',
        );
      }

      // Re-throw known exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Log and throw unexpected errors
      this.logger.error('❌ Failed to create bet:', error);
      throw new BadRequestException('Failed to create bet');
    }
  }

  /**
   * Get all bets for a specific user
   * @param userId - The user's ID
   * @param populateGame - Whether to populate game details (default: true)
   * @returns Array of user's bets
   */
  async getUserBets(
    userId: string,
    populateGame: boolean = true,
  ): Promise<BetDocument[]> {
    try {
      this.logger.log(`📋 Fetching bets for user ${userId}`);

      const query = this.betModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 }); // Most recent first

      if (populateGame) {
        query.populate('gameId');
      }

      const bets = await query.exec();

      this.logger.log(`✅ Found ${bets.length} bet(s) for user ${userId}`);

      return bets;
    } catch (error) {
      this.logger.error('❌ Failed to fetch user bets:', error);
      throw new BadRequestException('Failed to fetch user bets');
    }
  }

  /**
   * Get a specific bet by ID
   * @param betId - The bet ID
   * @param userId - The user's ID (for authorization)
   * @returns The bet
   */
  async getBetById(betId: string, userId: string): Promise<BetDocument> {
    try {
      if (!Types.ObjectId.isValid(betId)) {
        throw new BadRequestException('Invalid bet ID format');
      }

      const bet = await this.betModel
        .findOne({
          _id: new Types.ObjectId(betId),
          userId: new Types.ObjectId(userId),
        })
        .populate('gameId');

      if (!bet) {
        throw new NotFoundException('Bet not found');
      }

      return bet;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error('❌ Failed to fetch bet:', error);
      throw new BadRequestException('Failed to fetch bet');
    }
  }

  /**
   * Delete user's own bets and reset points to starting balance (for testing/reset)
   * @param userId - The user's ID
   * @returns Number of bets deleted
   */
  async deleteMyBets(userId: string): Promise<number> {
    try {
      this.logger.log(`🗑️  Resetting bets and points for user ${userId}...`);

      // Delete all user's bets
      const result = await this.betModel.deleteMany({
        userId: new Types.ObjectId(userId)
      });

      // Reset user's points to starting balance (1000)
      await this.userModel.findByIdAndUpdate(userId, {
        points: 1000
      });

      this.logger.log(
        `✅ Deleted ${result.deletedCount} bet(s) and reset points to 1000 for user ${userId}`
      );

      return result.deletedCount;
    } catch (error) {
      this.logger.error('❌ Failed to reset user bets and points:', error);
      throw new BadRequestException('Failed to reset bets and points');
    }
  }
}
