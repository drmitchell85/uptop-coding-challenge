# Games Module

This module handles NBA game data, odds, and game status management.

## Game Model

The Game schema represents Cleveland Cavaliers games with their point spreads and results.

### Schema Definition

```typescript
{
  gameId: string;              // Required, unique - Unique identifier from Odds API
  homeTeam: string;            // Required - Home team name
  awayTeam: string;            // Required - Away team name
  startTime: Date;             // Required - Game start time
  spread: number;              // Required - Point spread (e.g., -4.5 for Cavs)
  status: GameStatus;          // Required - 'upcoming' | 'finished'
  finalHomeScore?: number;     // Optional - Final home team score
  finalAwayScore?: number;     // Optional - Final away team score
  createdAt: Date;             // Auto-generated timestamp
  updatedAt: Date;             // Auto-updated timestamp
}
```

### Game Status Enum

```typescript
enum GameStatus {
  UPCOMING = 'upcoming',
  FINISHED = 'finished',
}
```

### Indexes

- `gameId`: Unique index for fast lookups and preventing duplicates
- `startTime`: Index for querying games by date
- `status`: Index for filtering by game status

### Usage

To use the Game model in other modules:

```typescript
import { Module } from '@nestjs/common';
import { GamesModule } from './games/games.module';

@Module({
  imports: [GamesModule],
})
export class YourModule {}
```

Then inject the model in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../games/schemas/game.schema';

@Injectable()
export class YourService {
  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
  ) {}

  async findNextGame(): Promise<GameDocument | null> {
    return this.gameModel
      .findOne({ status: 'upcoming' })
      .sort({ startTime: 1 })
      .exec();
  }
}
```

## DTOs

### CreateGameDto

Used when fetching and storing a new game from the Odds API:

```typescript
{
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  spread: number;
  status?: GameStatus;  // Defaults to 'upcoming'
}
```

### SettleGameDto

Used when an admin settles a finished game:

```typescript
{
  finalHomeScore: number;
  finalAwayScore: number;
}
```

## Point Spread Explanation

A point spread represents the expected margin of victory:

- **Negative spread (e.g., Cavaliers -4.5)**: Team is favored to win by more than 4.5 points
- **Positive spread (e.g., Raptors +4.5)**: Team is expected to lose by less than 4.5 points or win

### Examples

```typescript
// Cavaliers are favored by 4.5 points
{
  homeTeam: "Cleveland Cavaliers",
  awayTeam: "Toronto Raptors",
  spread: -4.5,  // Negative = Cavs favored
}

// Cavaliers are underdogs by 3.5 points
{
  homeTeam: "Cleveland Cavaliers",
  awayTeam: "Boston Celtics",
  spread: 3.5,  // Positive = Cavs underdogs
}
```

## Future Enhancements

- Add other odds types (moneyline, over/under)
- Support multiple sportsbooks
- Add team IDs for better data normalization
- Add venue information
- Add quarter-by-quarter scores
- Add game highlights or notes
