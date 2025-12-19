# Bets Module

This module handles user bets on NBA games and bet settlement logic.

## Bet Model

The Bet schema represents a user's bet on a game's point spread.

### Schema Definition

```typescript
{
  userId: ObjectId;           // Required, ref: User - Who placed the bet
  gameId: ObjectId;           // Required, ref: Game - Which game
  selection: BetSelection;    // Required - 'cavaliers' | 'opponent'
  status: BetStatus;          // Required - 'pending' | 'won' | 'lost' | 'push'
  pointsAwarded: number;      // Default: 0 - Points earned (100 for wins)
  createdAt: Date;            // Auto-generated timestamp
  updatedAt: Date;            // Auto-updated timestamp
}
```

### Enums

#### BetSelection

```typescript
enum BetSelection {
  CAVALIERS = 'cavaliers',
  OPPONENT = 'opponent',
}
```

#### BetStatus

```typescript
enum BetStatus {
  PENDING = 'pending',  // Game hasn't finished yet
  WON = 'won',          // User won the bet (100 points)
  LOST = 'lost',        // User lost the bet
  PUSH = 'push',        // Tie (rare with .5 spreads, points refunded)
}
```

### Indexes

- `userId`: Index for querying bets by user
- `gameId`: Index for querying bets by game
- `status`: Index for filtering by bet status
- **Compound unique index on `(userId, gameId)`**: Prevents duplicate bets per user per game

### Usage

To use the Bet model in other modules:

```typescript
import { Module } from '@nestjs/common';
import { BetsModule } from './bets/bets.module';

@Module({
  imports: [BetsModule],
})
export class YourModule {}
```

Then inject the model in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bet, BetDocument } from '../bets/schemas/bet.schema';

@Injectable()
export class YourService {
  constructor(
    @InjectModel(Bet.name) private betModel: Model<BetDocument>,
  ) {}

  async findUserBets(userId: string): Promise<BetDocument[]> {
    return this.betModel
      .find({ userId })
      .populate('gameId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
```

## DTOs

### CreateBetDto

Used when a user places a bet:

```typescript
{
  gameId: string;
  selection: BetSelection;  // 'cavaliers' | 'opponent'
}
```

Note: The `userId` is extracted from the authenticated user session.

## Betting Rules

### One Bet Per Game

The compound unique index `{ userId: 1, gameId: 1 }` enforces that:
- Each user can only place **one bet** per game
- Attempting to bet again on the same game will fail

### Bet Settlement Logic

When a game is settled, the backend calculates the result:

#### If User Selected Cavaliers

Assuming Cavaliers are the home team with spread `-4.5`:

```typescript
const margin = finalHomeScore - finalAwayScore;

if (margin > Math.abs(spread)) {
  status = 'won';        // Cavaliers won by more than 4.5
  pointsAwarded = 100;
} else if (margin < Math.abs(spread)) {
  status = 'lost';       // Cavaliers won by less than 4.5 or lost
  pointsAwarded = 0;
} else {
  status = 'push';       // Exactly 4.5 (rare)
  pointsAwarded = 0;
}
```

#### If User Selected Opponent

```typescript
const margin = finalAwayScore - finalHomeScore;

if (margin > Math.abs(spread)) {
  status = 'won';        // Opponent beat the spread
  pointsAwarded = 100;
} else if (margin < Math.abs(spread)) {
  status = 'lost';       // Opponent didn't beat the spread
  pointsAwarded = 0;
} else {
  status = 'push';       // Exactly tied (rare)
  pointsAwarded = 0;
}
```

### Points Award

- **Win**: 100 points
- **Loss**: 0 points
- **Push**: 0 points (but bet doesn't count against user)

## Examples

### Example 1: Cavaliers Favored

```typescript
Game: {
  homeTeam: "Cleveland Cavaliers",
  awayTeam: "Toronto Raptors",
  spread: -4.5,
  finalHomeScore: 105,
  finalAwayScore: 98
}

Bet 1: {
  selection: 'cavaliers',
  // Result: WON (105-98=7, which is > 4.5)
  status: 'won',
  pointsAwarded: 100
}

Bet 2: {
  selection: 'opponent',
  // Result: LOST (Raptors didn't beat the spread)
  status: 'lost',
  pointsAwarded: 0
}
```

### Example 2: Close Game

```typescript
Game: {
  homeTeam: "Cleveland Cavaliers",
  awayTeam: "Boston Celtics",
  spread: -2.5,
  finalHomeScore: 100,
  finalAwayScore: 99
}

Bet: {
  selection: 'cavaliers',
  // Result: LOST (100-99=1, which is < 2.5)
  status: 'lost',
  pointsAwarded: 0
}
```

## Database Relationships

### Populate Example

```typescript
// Get bet with full game and user details
const bet = await this.betModel
  .findById(betId)
  .populate('userId')
  .populate('gameId')
  .exec();

// Returns:
{
  _id: '...',
  userId: {
    email: 'user@example.com',
    name: 'John Doe',
    points: 500
  },
  gameId: {
    homeTeam: 'Cleveland Cavaliers',
    awayTeam: 'Toronto Raptors',
    spread: -4.5,
    startTime: '2024-01-15T19:00:00.000Z'
  },
  selection: 'cavaliers',
  status: 'won',
  pointsAwarded: 100
}
```

## Future Enhancements

- Add bet amount (for variable stakes)
- Add parlays (multiple games in one bet)
- Add different bet types (moneyline, over/under)
- Add bet cancellation (before game starts)
- Add bet history analytics
- Add leaderboards
