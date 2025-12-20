import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument, GameStatus } from './schemas/game.schema';
import { OddsApiService, OddsApiGame } from '../odds-api/odds-api.service';

/**
 * Interface for the mapped game data ready to be stored
 */
export interface NextGameData {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;
  status: GameStatus;
}

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private readonly oddsApiService: OddsApiService,
  ) {}

  /**
   * Fetch the next upcoming Cleveland Cavaliers game from The Odds API
   * @returns Next Cavaliers game data with point spread
   */
  async fetchNextCavaliersGame(): Promise<NextGameData | null> {
    try {
      this.logger.log('🔍 Fetching next Cavaliers game...');

      // Fetch all NBA games with spreads
      const games = await this.oddsApiService.fetchNbaOdds();

      // Filter for Cavaliers games
      const cavaliersGames = games.filter(
        (game) =>
          game.home_team === 'Cleveland Cavaliers' ||
          game.away_team === 'Cleveland Cavaliers',
      );

      if (cavaliersGames.length === 0) {
        this.logger.warn('⚠️  No upcoming Cavaliers games found');
        return null;
      }

      this.logger.log(`Found ${cavaliersGames.length} Cavaliers game(s)`);

      // Sort by commence time to get the next game
      cavaliersGames.sort(
        (a, b) =>
          new Date(a.commence_time).getTime() -
          new Date(b.commence_time).getTime(),
      );

      const nextGame = cavaliersGames[0];

      // Map the API response to our Game schema format
      const gameData = this.mapOddsApiToGameSchema(nextGame);

      this.logger.log(
        `✅ Next Cavaliers game: ${gameData.awayTeam} @ ${gameData.homeTeam} on ${gameData.startTime}`,
      );

      return gameData;
    } catch (error) {
      this.logger.error('❌ Failed to fetch next Cavaliers game:', error);
      throw error;
    }
  }

  /**
   * Map Odds API response to our Game schema format
   * Extracts point spread from the first available bookmaker
   */
  private mapOddsApiToGameSchema(apiGame: OddsApiGame): NextGameData {
    // Find the first bookmaker with spreads market
    const bookmaker = apiGame.bookmakers.find((b) =>
      b.markets.some((m) => m.key === 'spreads'),
    );

    if (!bookmaker) {
      throw new Error(
        `No spreads market found for game ${apiGame.id}`,
      );
    }

    // Get the spreads market
    const spreadsMarket = bookmaker.markets.find((m) => m.key === 'spreads');

    if (!spreadsMarket || spreadsMarket.outcomes.length < 2) {
      throw new Error(
        `Invalid spreads data for game ${apiGame.id}`,
      );
    }

    // Determine which team is the Cavaliers and get their spread
    const isCavaliersHome = apiGame.home_team === 'Cleveland Cavaliers';
    const cavaliersOutcome = spreadsMarket.outcomes.find(
      (o) => o.name === 'Cleveland Cavaliers',
    );

    if (!cavaliersOutcome || cavaliersOutcome.point === undefined) {
      throw new Error(
        `Could not find Cavaliers spread for game ${apiGame.id}`,
      );
    }

    // The spread is from the Cavaliers' perspective
    // Negative spread means Cavaliers are favored (e.g., -6.5)
    // Positive spread means Cavaliers are underdogs (e.g., +3.5)
    const spread = cavaliersOutcome.point;

    return {
      gameId: apiGame.id,
      homeTeam: apiGame.home_team,
      awayTeam: apiGame.away_team,
      startTime: new Date(apiGame.commence_time),
      spread: spread,
      status: GameStatus.UPCOMING,
    };
  }

  /**
   * Get all Cavaliers games from the Odds API (not just the next one)
   * Useful for testing and displaying multiple games
   */
  async fetchAllCavaliersGames(): Promise<NextGameData[]> {
    try {
      this.logger.log('🔍 Fetching all Cavaliers games...');

      const games = await this.oddsApiService.fetchNbaOdds();

      const cavaliersGames = games.filter(
        (game) =>
          game.home_team === 'Cleveland Cavaliers' ||
          game.away_team === 'Cleveland Cavaliers',
      );

      if (cavaliersGames.length === 0) {
        this.logger.warn('⚠️  No upcoming Cavaliers games found');
        return [];
      }

      // Sort by commence time
      cavaliersGames.sort(
        (a, b) =>
          new Date(a.commence_time).getTime() -
          new Date(b.commence_time).getTime(),
      );

      // Map all games
      const mappedGames = cavaliersGames.map((game) =>
        this.mapOddsApiToGameSchema(game),
      );

      this.logger.log(`✅ Found ${mappedGames.length} Cavaliers game(s)`);

      return mappedGames;
    } catch (error) {
      this.logger.error('❌ Failed to fetch Cavaliers games:', error);
      throw error;
    }
  }

  /**
   * Upsert a game to the database
   * Uses gameId as the unique identifier to prevent duplicates
   * @param gameData Game data to store
   * @returns The stored/updated game document
   */
  async upsertGame(gameData: NextGameData): Promise<GameDocument> {
    try {
      const game = await this.gameModel.findOneAndUpdate(
        { gameId: gameData.gameId },
        {
          $set: {
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            startTime: gameData.startTime,
            spread: gameData.spread,
            status: gameData.status,
          },
        },
        { upsert: true, new: true },
      );

      this.logger.log(`💾 Upserted game: ${gameData.gameId}`);
      return game;
    } catch (error) {
      this.logger.error(`❌ Failed to upsert game ${gameData.gameId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch and store the next Cavaliers game
   * @returns The stored game document or null if no game found
   */
  async syncNextCavaliersGame(): Promise<GameDocument | null> {
    try {
      this.logger.log('🔄 Syncing next Cavaliers game to database...');

      const nextGame = await this.fetchNextCavaliersGame();

      if (!nextGame) {
        this.logger.warn('⚠️  No upcoming Cavaliers game to sync');
        return null;
      }

      const storedGame = await this.upsertGame(nextGame);

      this.logger.log(
        `✅ Synced next game: ${storedGame.awayTeam} @ ${storedGame.homeTeam}`,
      );

      return storedGame;
    } catch (error) {
      this.logger.error('❌ Failed to sync next Cavaliers game:', error);
      throw error;
    }
  }

  /**
   * Fetch and store all upcoming Cavaliers games
   * @returns Array of stored game documents
   */
  async syncAllCavaliersGames(): Promise<GameDocument[]> {
    try {
      this.logger.log('🔄 Syncing all Cavaliers games to database...');

      const games = await this.fetchAllCavaliersGames();

      if (games.length === 0) {
        this.logger.warn('⚠️  No Cavaliers games to sync');
        return [];
      }

      // Upsert all games
      const storedGames = await Promise.all(
        games.map((game) => this.upsertGame(game)),
      );

      this.logger.log(`✅ Synced ${storedGames.length} Cavaliers game(s)`);

      return storedGames;
    } catch (error) {
      this.logger.error('❌ Failed to sync Cavaliers games:', error);
      throw error;
    }
  }

  /**
   * Get upcoming games from the database
   * @param limit Maximum number of games to return (optional)
   * @returns Array of upcoming games sorted by start time
   */
  async getUpcomingGames(limit?: number): Promise<GameDocument[]> {
    try {
      const query = this.gameModel
        .find({ status: GameStatus.UPCOMING })
        .sort({ startTime: 1 });

      if (limit) {
        query.limit(limit);
      }

      const games = await query.exec();

      this.logger.log(`📋 Retrieved ${games.length} upcoming game(s) from database`);

      return games;
    } catch (error) {
      this.logger.error('❌ Failed to retrieve upcoming games:', error);
      throw error;
    }
  }
}
