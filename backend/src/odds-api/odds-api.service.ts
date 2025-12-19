import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Interface for The Odds API response
 * Represents a single game with odds from multiple bookmakers
 */
export interface OddsApiGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiMarket {
  key: string; // 'spreads' for point spreads
  outcomes: OddsApiOutcome[];
}

export interface OddsApiOutcome {
  name: string; // Team name
  price: number; // Odds in American format
  point?: number; // Point spread value (e.g., -4.5)
}

@Injectable()
export class OddsApiService {
  private readonly logger = new Logger(OddsApiService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.the-odds-api.com';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ODDS_API_KEY');

    if (!apiKey) {
      throw new Error('ODDS_API_KEY environment variable is not defined');
    }

    this.apiKey = apiKey;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
      },
    });

    this.logger.log('✅ Odds API Service initialized');
  }

  /**
   * Fetch NBA games with odds from The Odds API
   * @param sport - The sport key (default: 'basketball_nba')
   * @param regions - Comma-separated regions (default: 'us')
   * @param markets - Comma-separated markets (default: 'spreads')
   * @returns Array of games with odds
   */
  async fetchNbaOdds(
    sport: string = 'basketball_nba',
    regions: string = 'us',
    markets: string = 'spreads',
  ): Promise<OddsApiGame[]> {
    try {
      const url = `/v4/sports/${sport}/odds`;

      this.logger.log(`Fetching odds from The Odds API: ${url}`);

      const response = await this.axiosInstance.get<OddsApiGame[]>(url, {
        params: {
          apiKey: this.apiKey,
          regions,
          markets,
          oddsFormat: 'american', // Use American odds format for clarity
        },
      });

      // Log quota usage from response headers
      const requestsRemaining = response.headers['x-requests-remaining'];
      const requestsUsed = response.headers['x-requests-used'];

      this.logger.log(
        `📊 API Quota - Used: ${requestsUsed}, Remaining: ${requestsRemaining}`,
      );

      this.logger.log(
        `✅ Successfully fetched ${response.data.length} games from The Odds API`,
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          this.logger.error('❌ Invalid API key - check ODDS_API_KEY in .env');
        } else if (status === 429) {
          this.logger.error('❌ Rate limit exceeded - too many requests');
        } else {
          this.logger.error(`❌ Odds API error (${status}): ${message}`);
        }

        throw new Error(
          `Failed to fetch odds from The Odds API: ${message}`,
        );
      }

      this.logger.error('❌ Unexpected error fetching odds:', error);
      throw error;
    }
  }

  /**
   * Health check - verify API key is valid
   * @returns true if API connection is working
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Call the /sports endpoint which doesn't count against quota
      const response = await this.axiosInstance.get('/v4/sports', {
        params: {
          apiKey: this.apiKey,
        },
      });

      this.logger.log('✅ Odds API health check passed');
      return response.status === 200;
    } catch (error) {
      this.logger.error('❌ Odds API health check failed:', error);
      return false;
    }
  }
}
