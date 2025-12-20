# Odds API Module

This module integrates with [The Odds API](https://the-odds-api.com/) to fetch real-time sports betting odds for NBA games.

## Overview

The OddsApiService provides methods to:
- Fetch NBA game odds with point spreads
- Filter games by sport, region, and market
- Monitor API quota usage
- Perform health checks

## API Configuration

The service uses the following configuration from `.env`:

```bash
ODDS_API_KEY=your_odds_api_key_here
```

**API Details:**
- Base URL: `https://api.the-odds-api.com`
- Default Sport: `basketball_nba` (NBA)
- Default Region: `us` (United States bookmakers)
- Default Market: `spreads` (Point spreads/handicaps)

## Service Methods

### `fetchNbaOdds(sport?, regions?, markets?)`

Fetches NBA games with odds from The Odds API.

**Parameters:**
- `sport` (optional): Sport key, default: `'basketball_nba'`
- `regions` (optional): Comma-separated regions, default: `'us'`
- `markets` (optional): Comma-separated markets, default: `'spreads'`

**Returns:** `Promise<OddsApiGame[]>`

**Example:**
```typescript
const games = await this.oddsApiService.fetchNbaOdds();
// Returns all NBA games with point spreads from US bookmakers
```

**Response Structure:**
```typescript
{
  id: "bda33adca828c09dc3cac3a856aef176",
  sport_key: "basketball_nba",
  sport_title: "NBA",
  commence_time: "2025-12-20T00:00:00Z",
  home_team: "Cleveland Cavaliers",
  away_team: "Toronto Raptors",
  bookmakers: [
    {
      key: "fanduel",
      title: "FanDuel",
      last_update: "2025-12-19T12:00:00Z",
      markets: [
        {
          key: "spreads",
          outcomes: [
            {
              name: "Cleveland Cavaliers",
              price: -110,
              point: -4.5  // Cavaliers favored by 4.5 points
            },
            {
              name: "Toronto Raptors",
              price: -110,
              point: 4.5   // Raptors get 4.5 points
            }
          ]
        }
      ]
    }
  ]
}
```

### `healthCheck()`

Verifies that the API key is valid and the service can connect to The Odds API.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const isHealthy = await this.oddsApiService.healthCheck();
if (isHealthy) {
  console.log('✅ Odds API is working');
}
```

## Usage in Other Modules

To use the OddsApiService in another module:

```typescript
import { Module } from '@nestjs/common';
import { OddsApiModule } from '../odds-api/odds-api.module';
import { YourService } from './your.service';

@Module({
  imports: [OddsApiModule],
  providers: [YourService],
})
export class YourModule {}
```

Then inject the service:

```typescript
import { Injectable } from '@nestjs/common';
import { OddsApiService } from '../odds-api/odds-api.service';

@Injectable()
export class YourService {
  constructor(private readonly oddsApiService: OddsApiService) {}

  async getCavaliersGames() {
    const games = await this.oddsApiService.fetchNbaOdds();

    // Filter for Cavaliers games only
    return games.filter(
      (game) =>
        game.home_team === 'Cleveland Cavaliers' ||
        game.away_team === 'Cleveland Cavaliers',
    );
  }
}
```

## API Quota & Rate Limiting

The Odds API tracks usage through request headers:
- `x-requests-remaining`: Credits remaining until quota resets
- `x-requests-used`: Credits used since last reset
- `x-requests-last`: Cost of the last API call

**Quota Costs:**
- `/v4/sports` (list sports): **FREE** (doesn't count)
- `/v4/sports/{sport}/odds`: **1 credit** per region per market
  - Example: 1 market × 1 region = 1 credit
  - Example: 3 markets × 1 region = 3 credits

**Rate Limiting:**
- The service uses a 10-second timeout for requests
- If you receive a 429 error, you've exceeded the rate limit
- Space out requests or upgrade your API plan

## Error Handling

The service handles common errors:

**401 Unauthorized:**
```
❌ Invalid API key - check ODDS_API_KEY in .env
```

**429 Too Many Requests:**
```
❌ Rate limit exceeded - too many requests
```

**Network Errors:**
```
❌ Odds API error (500): Internal Server Error
```

All errors are logged and thrown as standard JavaScript errors.

## Finding the Next Cavaliers Game

To find the next upcoming Cleveland Cavaliers game:

```typescript
async findNextCavaliersGame() {
  const games = await this.oddsApiService.fetchNbaOdds();

  const cavaliersGames = games.filter(
    (game) =>
      game.home_team === 'Cleveland Cavaliers' ||
      game.away_team === 'Cleveland Cavaliers',
  );

  // Sort by commence_time to get the next game
  cavaliersGames.sort(
    (a, b) =>
      new Date(a.commence_time).getTime() -
      new Date(b.commence_time).getTime(),
  );

  return cavaliersGames[0]; // Next game
}
```

## Point Spread Explanation

A **point spread** (or handicap) is a betting market that predicts the margin of victory.

**Example:**
- **Cavaliers -4.5**: Cavaliers are favored to win by more than 4.5 points
- **Raptors +4.5**: Raptors can lose by up to 4 points and still "cover the spread"

**Selecting a Bookmaker:**

Each game returns odds from multiple bookmakers (FanDuel, DraftKings, etc.). You can:
1. Use the first bookmaker: `game.bookmakers[0]`
2. Filter by a specific bookmaker: `game.bookmakers.find(b => b.key === 'fanduel')`
3. Average across bookmakers for the most accurate spread

## Testing

To test the service manually:

```bash
# Start the backend
npm run start:dev

# The service will log on startup:
# ✅ Odds API Service initialized
```

Then call the health check or fetch odds from a controller/service.

## Resources

- [The Odds API Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- [Available Sports List](https://the-odds-api.com/sports-odds-data/sports-apis.html)
- [Pricing & Plans](https://the-odds-api.com/sports-odds-data/betting-odds-api-pricing.html)
