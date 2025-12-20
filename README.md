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

## Testing the Setup

### Verify MongoDB Connection
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

## Development Roadmap

This project is broken into phases, with each phase containing multiple commits representing incremental progress.

### Phase 1: Project Setup & Infrastructure ✅

**Commit 1.1: Initialize monorepo structure** ✅
- [x] Create root directory structure
- [x] Add .gitignore for Node.js, TypeScript, and environment files
- [x] Create this README.md with project overview

**Commit 1.2: Initialize NestJS backend** ✅
- [x] Run `nest new backend` with TypeScript
- [x] Configure tsconfig.json
- [x] Setup basic project structure (modules, controllers, services)
- [x] Add backend-specific .gitignore

**Commit 1.3: Initialize Next.js frontend** ✅
- [x] Run `npx create-next-app@latest frontend` with TypeScript and Tailwind
- [x] Configure Tailwind CSS v3 (compatible with Node 18)
- [x] Setup basic project structure
- [x] Add frontend-specific .gitignore

**Commit 1.4: Setup MongoDB connection** ✅
- [x] Install @nestjs/mongoose and mongoose in backend
- [x] Create database module
- [x] Configure MongoDB connection with environment variables
- [x] Add connection error handling
- [x] Test MongoDB connection locally
- [x] Create SETUP.md with installation instructions

**Commit 1.5: Environment configuration & Testing** (Current)
- [x] Create .env.example files for both frontend and backend
- [x] Setup environment validation in backend
- [x] Add environment configuration to documentation
- [x] Test both frontend and backend applications
- [x] Update README with accurate version information

---

### Phase 2: Backend - Data Models & Database Schema

**Commit 2.1: Create User model** ✅
- [x] Define User schema with Mongoose
- [x] Create User interface/DTO
- [x] Add points field for tracking earnings
- [x] Setup User module with MongooseModule
- [x] Add comprehensive documentation

**Commit 2.2: Create Game model** ✅
- [x] Define Game schema (gameId, teams, startTime, spread, status, scores)
- [x] Create Game interface/DTO (CreateGameDto, SettleGameDto)
- [x] Add GameStatus enum and validation
- [x] Setup Games module with MongooseModule
- [x] Add comprehensive documentation with point spread examples

**Commit 2.3: Create Bet model** ✅
- [x] Define Bet schema (userId, gameId, selection, status)
- [x] Create Bet interface/DTO (CreateBetDto)
- [x] Add references to User and Game with ObjectId
- [x] Setup Bets module with MongooseModule
- [x] Add BetSelection and BetStatus enums
- [x] Add comprehensive documentation with settlement logic

**Commit 2.4: Add database indexes and validations** (Current)
- [x] Add unique indexes (email, gameId, userId+gameId compound)
- [x] Add indexes for query optimization (startTime, status)
- [x] Add enum validation for selections and statuses
- [x] Add timestamps to all models (createdAt, updatedAt)
- [ ] Test all models with MongoDB
- [ ] Verify unique constraints work correctly

---

### Phase 3: Backend - Odds API Integration ✅

**Commit 3.1: Setup Odds API service** ✅
- [x] Install axios for HTTP requests
- [x] Create OddsApiService with API client
- [x] Add API key configuration via @nestjs/config
- [x] Create OddsApiModule and export service
- [x] Add error handling (401, 429, network errors)
- [x] Implement API quota tracking via response headers
- [x] Add health check method for API validation
- [x] Create test endpoint for API verification
- [x] Add comprehensive documentation (README.md)

**Commit 3.2: Implement fetch next Cavaliers game** ✅
- [x] Create GamesService with OddsApiService integration
- [x] Implement fetchNbaOdds() in OddsApiService
- [x] Filter for Cleveland Cavaliers games (home or away)
- [x] Sort games by start time to find next game
- [x] Parse point spread data from bookmakers
- [x] Extract spread from Cavaliers' perspective
- [x] Map API response to Game schema format
- [x] Add fetchAllCavaliersGames() for multiple games
- [x] Create test endpoints (test-next-game, test-all-games)
- [x] Handle edge cases (no spreads, no games found)

**Commit 3.3: Implement game data storage** ✅
- [x] Create upsertGame() method using findOneAndUpdate
- [x] Implement syncNextCavaliersGame() to fetch and store
- [x] Implement syncAllCavaliersGames() for bulk storage
- [x] Add getUpcomingGames() to retrieve from database
- [x] Handle duplicate prevention with unique gameId constraint
- [x] Map Odds API response to Game schema
- [x] Add comprehensive logging for all operations
- [x] Create storage test endpoints (sync-next-game, sync-all-games, get-games)
- [x] Test upsert functionality (prevents duplicates)
- [x] Verify database queries and data retrieval

**Commit 3.4: Create Makefile for development** ✅
- [x] Add make dev command for parallel frontend/backend startup
- [x] Add make stop command to kill all services
- [x] Add make install and make clean commands
- [x] Update README Quick Start with Makefile usage

---

### Phase 4: Backend - Authentication & Core API ✅

**Commit 4.1: Setup authentication middleware** ✅
- [x] Install passport and JWT dependencies
- [x] Create auth guard for protected routes
- [x] Setup JWT validation
- [x] Create admin role guard
- [x] Add UserRole enum to User schema
- [x] Create JwtStrategy for token validation
- [x] Configure JwtModule with environment-based secrets
- [x] Create test endpoints for authentication
- [x] Test all guards (JWT auth and admin role)

**Commit 4.2: Implement Games endpoints** ✅
- [x] Create GamesController
- [x] Implement GET /games/next endpoint (public)
- [x] Implement POST /games/next endpoint (authenticated)
- [x] Add request/response DTOs (GameResponseDto)
- [x] Add error handling for API failures
- [x] Add spread explanation helper
- [x] Test both endpoints (public and authenticated)

**Commit 4.3: Implement Bets endpoints** ✅
- [x] Create BetsController
- [x] Create BetsService with business logic
- [x] Implement POST /bets endpoint (create bet)
- [x] Implement GET /bets endpoint (get user bets)
- [x] Add validation for bet placement rules (game exists, not started, status is upcoming)
- [x] Prevent duplicate bets per game per user (compound unique index)
- [x] Add bet response DTOs with populated game data
- [x] Test all endpoints (auth, duplicate prevention, retrieval)

**Commit 4.4: Implement admin settlement endpoint** ✅
- [x] Create POST /games/:gameId/settle endpoint
- [x] Add admin authentication check (JwtAuthGuard + AdminGuard)
- [x] Implement bet result calculation logic (spread coverage algorithm)
- [x] Update bet statuses (won/lost/push)
- [x] Award points to winners (100 points per win)
- [x] Add settlement method to GamesService
- [x] Create settlement DTOs
- [x] Resolve circular dependency between GamesModule and BetsModule
- [x] Test settlement endpoint with admin auth

**Commit 4.5: Add API documentation and error handling** ✅
- [x] Install Swagger/OpenAPI dependencies (@nestjs/swagger, swagger-ui-express)
- [x] Configure Swagger in main.ts with JWT bearer auth
- [x] Implement global exception filter for consistent error responses
- [x] Add global validation pipe (class-validator, class-transformer)
- [x] Create consistent error response format (statusCode, timestamp, path, error, message)
- [x] Enable automatic type transformation and validation
- [x] Deploy Swagger UI at /api endpoint
- [x] Test all endpoints with validation and error handling

---

### Phase 5: Frontend - Authentication Setup

**Commit 5.1: Install and configure next-auth** ✅
- [x] Install next-auth
- [x] Create [...nextauth] API route
- [x] Configure credentials provider
- [x] Setup session handling
- [x] Create backend /auth/login endpoint
- [x] Configure SessionProvider wrapper
- [x] Test authentication endpoints

**Commit 5.2: Create authentication UI components** ✅
- [x] Create SignIn component with email/password form
- [x] Create SignOut button component
- [x] Create UserInfo component for auth state display
- [x] Create Header component with navigation
- [x] Add authentication state management with useSession hook
- [x] Style components with Tailwind CSS
- [x] Update home page with authenticated/unauthenticated views
- [x] Test complete authentication flow

**Commit 5.3: Setup API client** ✅
- [x] Create API client utility with fetch wrapper
- [x] Add authentication token handling from session
- [x] Create custom hooks for games (useNextGame, useFetchNextGame)
- [x] Create custom hooks for bets (useBets, useCreateBet)
- [x] Add error handling with custom ApiError class
- [x] Create TypeScript types for all API responses
- [x] Test API client with backend endpoints

**Commit 5.4: Create protected route wrapper** ✅
- [x] Create ProtectedRoute wrapper component
- [x] Create withAuth HOC for page-level protection
- [x] Create withAdminAuth HOC for admin-only pages
- [x] Add loading states for auth verification
- [x] Implement automatic redirect logic for unauthenticated users
- [x] Create example protected pages (/profile, /test-api, /admin)
- [x] Test protection with both component and HOC patterns

---

### Phase 6: Frontend - Game Display & Betting Interface

**Commit 6.1: Create main page layout** ✅
- [x] Create home page component
- [x] Add navigation/header with auth status
- [x] Setup responsive layout with Tailwind
- [x] Add loading and error states
- [x] Create 3-column grid layout (game display, betting form, bet history)
- [x] Add quick stats section for user metrics
- [x] Implement responsive design for mobile/tablet/desktop

**Commit 6.2: Implement game display** ✅
- [x] Create GameCard component
- [x] Fetch and display next game data using useNextGame hook
- [x] Show teams, start time, and point spread
- [x] Format dates and odds properly with date-fns
- [x] Add Cavaliers branding colors (wine and gold) to Tailwind config
- [x] Implement loading, error, and empty states
- [x] Display spread explanation and visual indicators
- [x] Highlight Cavaliers team with team colors

**Commit 6.3: Create betting interface** ✅
- [x] Create BetForm component
- [x] Add team selection UI (Cavaliers vs Opponent)
- [x] Implement bet submission using useCreateBet hook
- [x] Add success/error notifications with animations
- [x] Disable betting after user has placed bet
- [x] Show existing bet details if user already bet on game
- [x] Add visual feedback with custom radio buttons
- [x] Display spread information for each team option
- [x] Include unauthenticated state handling

**Commit 6.4: Display user's bets** ✅
- [x] Create BetsList component
- [x] Fetch and display user's betting history using useBets hook
- [x] Show bet status with color-coded badges (pending/won/lost/push)
- [x] Display points earned for winning bets
- [x] Add real-time updates after bet placement
- [x] Show game details (teams, date/time, spread)
- [x] Display final scores for finished games
- [x] Implement scrollable list with max height
- [x] Add loading, error, and empty states
- [x] Update quick stats with real data (total bets, wins, win rate)

**Commit 6.5: Add user points display** ✅
- [x] Create PointsDisplay component with two variants (compact/full)
- [x] Fetch and show total user points from session
- [x] Add points animation on wins using CSS transitions
- [x] Display points history (recent transactions)
- [x] Show transaction details (game, date/time, points earned)
- [x] Add compact variant for prominent display on home page
- [x] Add full variant with transaction history in sidebar
- [x] Include empty state for no transactions
- [x] Calculate and display total points earned
- [x] Style with gold gradient matching Cavaliers branding

---

### Phase 7: Testing, Polish & Documentation

**Commit 7.1: Create admin testing interface** ✅
- [x] Create admin page/component with GameSettlement component
- [x] Add game selection dropdown for upcoming games
- [x] Add score input form for home/away teams
- [x] Implement settlement API call with useSettleGame hook
- [x] Display settlement results with bet statistics
- [x] Show settled games history
- [x] Add useAllGames and useSettleGame admin hooks
- [x] Update settlement types to match backend response
- [x] Add bet cost system (BET_COST = 100, BET_PAYOUT = 200)
- [x] Add RESET button functionality for testing

**Commit 7.2: Bug fixes and UI polish** ✅
- [x] Fix session updates not reflecting after placing bets (NextAuth JWT callback)
- [x] Fix RESET button to reset points to 1000 and games to upcoming status
- [x] Fix white/unreadable text in form inputs (signin page, admin dropdown)
- [x] Fix dark mode gray overlay blocking interaction (Tailwind config)
- [x] Fix away/home team text colors in GameCard component
- [x] Add explicit text-gray-900 classes throughout for readability
- [x] Disable automatic dark mode detection (darkMode: 'class')
- [x] Update RESET button messaging and confirmation dialog

**Commit 7.3: End-to-end testing**
- [ ] Test complete user flow (signup → view game → place bet)
- [ ] Test admin settlement flow
- [ ] Test edge cases (no upcoming games, duplicate bets)
- [ ] Verify points are awarded correctly

**Commit 7.4: UI polish and responsive design**
- [ ] Refine Tailwind styling
- [ ] Ensure mobile responsiveness
- [ ] Add transitions and animations
- [ ] Improve accessibility

**Commit 7.5: Final documentation**
- [ ] Update README with complete setup instructions
- [ ] Add API documentation
- [ ] Include example environment variables
- [ ] Add screenshots (optional)
- [ ] Document known issues/limitations

**Commit 7.6: Code cleanup**
- [ ] Remove console.logs
- [ ] Remove unused imports
- [ ] Add code comments where needed
- [ ] Format code consistently
- [ ] Final commit before submission

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
