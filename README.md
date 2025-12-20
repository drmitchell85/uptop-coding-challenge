# Uptop Coding Challenge - Play-to-Earn Cavaliers Betting

A full-stack monorepo application that lets authenticated users place bets on Cleveland Cavaliers game point spreads and earn points for correct predictions.

## Tech Stack

### Frontend
- Next.js 14.2.18 (TypeScript) - Compatible with Node.js 18+
- React 18
- Tailwind CSS 3.4
- next-auth for authentication

### Backend
- NestJS 11 (TypeScript)
- MongoDB with Mongoose
- @nestjs/config for environment management
- The Odds API integration

## Project Structure

```
uptop-coding-challenge/
├── frontend/          # Next.js application
├── backend/           # NestJS application
└── README.md
```

## Prerequisites

- Node.js v18+ (v20+ recommended)
- MongoDB (local installation or MongoDB Atlas)
- The Odds API key (get one at https://the-odds-api.com/)

## MongoDB Setup

### Option 1: Local MongoDB (Tested & Recommended for Development)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
# Should return: { ok: 1 }
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (free M0 tier)
3. Create a database user with username and password
4. Whitelist your IP address (or use 0.0.0.0/0 for testing)
5. Get your connection string (click "Connect" → "Connect your application")
6. Update `backend/.env` with your connection string:
   ```
   # Replace <USERNAME>, <PASSWORD>, and <CLUSTER> with your actual values
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/cavs-betting?retryWrites=true&w=majority
   ```

> 💡 **Note:** For detailed setup instructions including Docker option, see [SETUP.md](./SETUP.md)

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/cavs-betting
ODDS_API_KEY=your_odds_api_key_here
ADMIN_API_KEY=your_admin_secret_key
PORT=3001

# Mock Data (for testing when no real games are scheduled)
USE_MOCK_DATA=true
```

**Important - Mock Data Mode:**

The `USE_MOCK_DATA` environment variable enables automatic test data generation when no real Cavaliers games are scheduled. This is **essential for:**
- **Testing during NBA off-season** (April-October)
- **Demos and evaluation** - works anytime, regardless of game schedule
- **Development** - immediate testing without waiting for scheduled games

When enabled:
- Backend automatically creates 3 realistic mock games on startup if no real games exist
- Games include varied scenarios (favored, underdog, close spread)
- Full betting flow works exactly like real games
- Mock games can be settled using the admin endpoint

**Recommended:** Keep `USE_MOCK_DATA=true` in your `.env` file for development and evaluation.

### Frontend (.env.local)
```
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Quick Start

### Option 1: Using Makefile (Recommended)

```bash
# 1. Ensure MongoDB is running (see MongoDB Setup above)

# 2. Install dependencies
make install

# 3. Configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit .env files and add your MONGODB_URI and API keys

# 4. Start both frontend and backend
make dev

# To stop all services
make stop
```

### Option 2: Manual Setup

```bash
# 1. Ensure MongoDB is running (see MongoDB Setup above)

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env and add your MONGODB_URI and API keys
npm run start:dev

# 3. Frontend setup (in a new terminal)
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local and add your secrets
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Testing & Documentation

### End-to-End Testing
For comprehensive end-to-end testing documentation, see **[TESTING.md](./TESTING.md)**.

The testing documentation covers:
- Complete user flows (signup → bet → settlement)
- Admin settlement testing
- Edge cases and error handling
- Points calculation verification
- UI/UX testing across devices
- Session management and data integrity

### UI/UX Documentation
For detailed UI/UX design documentation, see **[UI_UX_DOCUMENTATION.md](./UI_UX_DOCUMENTATION.md)**.

The UI/UX documentation covers:
- Design system (colors, typography, spacing)
- Component-level visual features
- Responsive breakpoints and layouts
- Animations and transitions
- Accessibility features (WCAG AA compliance)
- Performance optimizations

### API Documentation
For comprehensive API reference documentation, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**.

The API documentation covers:
- All available endpoints (authentication, games, bets, admin)
- Request/response formats with examples
- Error handling and status codes
- Data models and schemas
- Complete betting flow examples
- Rate limiting and CORS configuration

### Known Issues & Limitations
For known issues, limitations, and future enhancements, see **[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)**.

The known issues documentation covers:
- Current bug status (none found ✅)
- Limitations by design (demo authentication, mock data, etc.)
- Technical limitations (API rate limits, browser compatibility)
- Security considerations for production
- Future enhancement ideas

### Code Quality & Cleanup
For code cleanup summary and quality metrics, see **[CODE_CLEANUP_SUMMARY.md](./CODE_CLEANUP_SUMMARY.md)**.

The code cleanup documentation covers:
- Console.log removal (debugging artifacts cleaned)
- Unused imports verification (TypeScript compiler check)
- Code comments coverage (65+ JSDoc blocks)
- Formatting consistency (Prettier/ESLint compliant)
- Final quality checks (build, lint, security, performance)
- Code quality metrics and statistics

### Quick Setup Verification

#### Verify MongoDB Connection
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Or check the process
pgrep mongod
```

### Verify Backend
```bash
# Backend should log: "✅ MongoDB connected successfully"
# Test the API
curl http://localhost:3001
# Should return: "Hello World!"
```

### Verify Frontend
```bash
# Open browser to http://localhost:3000
# You should see: "🏀 Cavaliers Betting" page
```

### Verify Mock Data (if USE_MOCK_DATA=true)
```bash
# Check backend logs for mock game creation
# You should see: "✅ Created 3 mock games for testing:"

# Verify games are in database
curl http://localhost:3001/games/next | python3 -m json.tool

# Expected response (if no real games exist):
{
  "success": true,
  "game": {
    "homeTeam": "Cleveland Cavaliers",
    "awayTeam": "Boston Celtics",
    "startTime": "2025-12-23T00:00:00.000Z",
    "spread": -4.5,
    "status": "upcoming",
    ...
  }
}
```

### Test Admin Game Settlement (Phase 7.1)

The admin interface allows settling games and awarding points to winners.

**1. Create an admin user:**
```bash
# Create test admin token
curl -X POST http://localhost:3001/auth/test-create-token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "name": "Admin User",
    "role": "admin"
  }' | python3 -m json.tool

# The response will include an access token
# Copy the token for the next steps
```

**2. Access the admin dashboard:**
- Sign in to the frontend (http://localhost:3000/signin) using the admin email
- Navigate to http://localhost:3000/admin
- You should see the Game Settlement interface

**3. Settle a game:**
- Select a game from the dropdown
- Enter final scores for home and away teams
- Click "Settle Game & Award Points"
- View settlement results showing:
  - Total bets settled
  - Number of bets won/lost/push
  - Points awarded to winners

**Example: Settle a game via API:**
```bash
# Get a game ID first
GAME_ID=$(curl -s http://localhost:3001/games/next | python3 -c "import sys, json; print(json.load(sys.stdin)['game']['id'])")

# Settle the game (requires admin token)
TOKEN="your_admin_token_here"
curl -X POST http://localhost:3001/games/$GAME_ID/settle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "finalHomeScore": 112,
    "finalAwayScore": 108
  }' | python3 -m json.tool
```

### Reset Your Bets and Games

The admin interface includes a **RESET ALL button** that performs a complete reset of your betting session. This is essential for testing the betting flow multiple times.

**What Gets Reset:**
1. **Your Bets** - All your bets are deleted (other users' bets remain intact)
2. **Your Points** - Points reset to starting balance (1000)
3. **All Games** - Settled games return to "upcoming" status (for all users)

**Using the UI:**
1. Sign in to the application
2. Navigate to `/admin` (available to all users)
3. Click the red "🔄 RESET ALL" button in the top-right
4. Confirm the deletion dialog
5. All bets, points, and games are reset

**Important:** This only deletes **YOUR bets** and resets **YOUR points**, but resets **ALL games** to upcoming status so you can test the full flow again.

**Example: Reset via API:**
```bash
# Reset your bets, points, and games (requires authentication)
TOKEN="your_token_here"
curl -X DELETE http://localhost:3001/bets \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Expected response:
{
  "success": true,
  "message": "Bets, points, and games reset successfully",
  "deletedCount": 3
}
```

### Test Odds API Integration (Phase 3)

Once the backend is running, you can test the Odds API integration:

```bash
# Test Odds API connection
curl http://localhost:3001/test-odds | python3 -m json.tool

# Fetch next Cavaliers game from API
curl http://localhost:3001/test-next-game | python3 -m json.tool

# Fetch all Cavaliers games from API
curl http://localhost:3001/test-all-games | python3 -m json.tool

# Sync next game to database
curl http://localhost:3001/sync-next-game | python3 -m json.tool

# Sync all games to database
curl http://localhost:3001/sync-all-games | python3 -m json.tool

# Get games from database
curl http://localhost:3001/get-games | python3 -m json.tool
```

**Example Response (test-next-game):**
```json
{
  "success": true,
  "nextGame": {
    "gameId": "5a11d709921a7ea69f44ff8926649124",
    "homeTeam": "Cleveland Cavaliers",
    "awayTeam": "Chicago Bulls",
    "startTime": "2025-12-20T00:40:00.000Z",
    "spread": -4.5,
    "status": "upcoming",
    "isCavaliersHome": true,
    "spreadExplanation": "Cavaliers favored by 4.5 points"
  }
}
```

## Implementation Status

### ✅ Completed (Phase 1-3)

**Phase 1: Infrastructure**
- **Backend Infrastructure**
  - NestJS application with modular architecture (Auth, Games, Bets, Database)
  - MongoDB connection with Mongoose
  - Environment configuration with @nestjs/config
  - CORS enabled for frontend communication
  - Error handling and connection logging

- **Frontend Infrastructure**
  - Next.js 14 application with App Router
  - TypeScript configuration
  - Tailwind CSS 3 styling
  - Responsive layout foundation
  - Inter font integration

- **Development Setup**
  - Monorepo structure
  - MongoDB local installation tested
  - Both applications running and verified
  - Comprehensive setup documentation
  - Makefile for easy development workflow

**Phase 2: Data Models**
- User, Game, and Bet schemas with Mongoose
- Database indexes for performance and uniqueness
- Comprehensive DTOs and interfaces
- Enum types for selections and statuses
- Timestamps on all models

**Phase 3: Odds API Integration**
- OddsApiService for fetching NBA odds from The Odds API
- Automatic filtering for Cleveland Cavaliers games
- Point spread extraction from bookmaker data
- Game data storage with upsert (no duplicates)
- Database retrieval methods for upcoming games
- API quota tracking and error handling

### 🚧 Planned Features (Phases 4-7)

- 🔐 User authentication with next-auth
- 💰 Place bets on point spreads
- 📊 View your betting history
- ⚡ Admin settlement of bets with automatic point awards
- 🎯 Win 100 points for each correct bet

## API Endpoints

### Available Test Endpoints (Phase 3)

These endpoints are currently available for testing the Odds API integration:

**Odds API Testing:**
- `GET /test-odds` - Test raw Odds API connection and fetch NBA games
- `GET /test-next-game` - Fetch next Cavaliers game from Odds API (not stored)
- `GET /test-all-games` - Fetch all upcoming Cavaliers games from Odds API

**Game Storage Testing:**
- `GET /sync-next-game` - Fetch and store next Cavaliers game to database
- `GET /sync-all-games` - Fetch and store all Cavaliers games to database
- `GET /get-games` - Retrieve all upcoming games from database

### Production API Endpoints (Phase 4 - Complete) ✅

**Swagger Documentation:**
- `GET /api` - Interactive Swagger UI documentation with JWT authentication

**Authentication:**
- `POST /auth/test-create-token` - Create test user and JWT token (dev/test only)
- `GET /auth/test-protected` - Test JWT authentication (dev/test only)
- `GET /auth/test-admin` - Test admin role guard (dev/test only)

**Games:**
- `GET /games/next` - Get the next Cavaliers game from database (public)
- `POST /games/next` - Fetch and store next game from Odds API (authenticated)
- `POST /games/:gameId/settle` - Settle game with final scores (admin only)

**Bets:**
- `POST /bets` - Place a bet on a game (authenticated, prevents duplicates)
- `GET /bets` - Get all user's bets with populated game data (authenticated)
- `DELETE /bets` - Delete your own bets (authenticated, for testing)

**Test Endpoints (Development):**
- `GET /test-odds` - Test Odds API connection
- `GET /test-next-game` - Fetch next Cavaliers game from Odds API
- `GET /test-all-games` - Fetch all Cavaliers games from Odds API
- `GET /sync-next-game` - Sync next game to database
- `GET /sync-all-games` - Sync all games to database
- `GET /get-games` - Get all upcoming games from database

---

## Data Models

### User
```typescript
{
  _id: ObjectId
  email: string
  name?: string
  points: number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

### Game
```typescript
{
  _id: ObjectId
  gameId: string (unique)
  homeTeam: string
  awayTeam: string
  startTime: Date
  spread: number
  status: 'upcoming' | 'finished'
  finalHomeScore?: number
  finalAwayScore?: number
  createdAt: Date
  updatedAt: Date
}
```

### Bet
```typescript
{
  _id: ObjectId
  userId: ObjectId (ref: User)
  gameId: ObjectId (ref: Game)
  selection: 'cavaliers' | 'opponent'
  status: 'pending' | 'won' | 'lost' | 'push'
  pointsAwarded: number (default: 0)
  createdAt: Date
  updatedAt: Date
}
```

## Betting Logic

### Point Spread Explanation
A point spread bet predicts whether a team will win by more or less than a specified margin. For example:
- **Cavaliers -4.5**: Cavaliers must win by 5+ points to cover
- **Opponent +4.5**: Opponent must lose by 4 or fewer points, or win outright

### Bet Economics
- **Starting Points**: 1000 points
- **Bet Cost**: 100 points per bet
- **Bet Payout**: 200 points for winning bets (100 point profit)
- **Push**: Bet cost refunded (100 points returned)
- **Lost Bet**: No refund

**Example:**
1. Start with 1000 points
2. Place bet → 900 points remaining
3. Win bet → 900 + 200 = 1100 points (net +100)
4. Lose bet → Still at 900 points (net -100)

### Settlement Logic
```
If user selected Cavaliers:
  - Won: (CavaliersScore - OpponentScore) > spread
  - Lost: (CavaliersScore - OpponentScore) < spread
  - Push: (CavaliersScore - OpponentScore) == spread (rare with .5 spreads)

If user selected Opponent:
  - Won: (OpponentScore - CavaliersScore) > abs(spread)
  - Lost: (OpponentScore - CavaliersScore) < abs(spread)
  - Push: (OpponentScore - CavaliersScore) == abs(spread)
```

## Technical Notes

### Node.js Version Compatibility

This project is configured for **Node.js 18+** compatibility:

- **Next.js 14.2.18** (LTS) - Works with Node 18+
- **React 18** - Stable version with broad compatibility
- **Tailwind CSS 3.4** - Standard PostCSS configuration
- **NestJS 11** - Requires Node 18+ (recommends Node 20+)

**If you have Node.js 20+**, you can optionally upgrade to:
- Next.js 15+ or 16+ for latest features
- React 19 for improved performance
- Tailwind CSS 4 for better PostCSS integration

### Troubleshooting

#### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongodb  # Linux
brew services list | grep mongodb  # macOS

# Check if port 27017 is in use
ss -tuln | grep 27017

# Test connection
mongosh --eval "db.runCommand({ ping: 1 })"
```

#### Port Already in Use
```bash
# Find and kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

#### Module Not Found Errors
```bash
# Clean install
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```

#### Next.js Version Warnings
The project uses Next.js 14 for Node 18 compatibility. Some security warnings may appear - these are acknowledged trade-offs for broader compatibility. For production use, consider upgrading to Node 20+ and Next.js 15+.

### Development Tips

- **Hot Reload**: Both applications support hot reload - changes will reflect automatically
- **TypeScript**: Strict mode is disabled for easier development; enable in tsconfig.json for production
- **MongoDB Database**: The database `cavs-betting` is created automatically on first connection
- **API Testing**: Use tools like Postman, Insomnia, or curl to test backend endpoints
- **Environment Variables**: Never commit .env files - always use .env.example as template

## Contributing

This is a take-home coding challenge. Follow the phases above and commit your work frequently to show your development process.

## License

This project is for educational and evaluation purposes.
