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
```

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

## Implementation Status

### ✅ Completed (Phase 1)
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

### 🚧 Planned Features (Phases 2-7)

- 🔐 User authentication with next-auth
- 🏀 Fetch next Cleveland Cavaliers game odds from The Odds API
- 💰 Place bets on point spreads
- 📊 View your betting history
- ⚡ Admin settlement of bets with automatic point awards
- 🎯 Win 100 points for each correct bet

## Planned API Endpoints

### Games
- `GET /games/next` - Get the next Cavaliers game and odds
- `POST /games/next` - Fetch and store next game from Odds API (authenticated)

### Bets
- `POST /bets` - Place a bet (authenticated)
- `GET /bets` - Get user's bets (authenticated)

### Admin
- `POST /games/:gameId/settle` - Settle bets with final scores (admin only)

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

### Phase 3: Backend - Odds API Integration

**Commit 3.1: Setup Odds API service**
- [ ] Install axios or node-fetch
- [ ] Create OddsApiService
- [ ] Add API key configuration
- [ ] Create basic API client with error handling

**Commit 3.2: Implement fetch next Cavaliers game**
- [ ] Create method to fetch NBA odds from Odds API
- [ ] Filter for Cleveland Cavaliers games
- [ ] Find the next upcoming game
- [ ] Parse point spread data from API response

**Commit 3.3: Implement game data storage**
- [ ] Create method to upsert game data to MongoDB
- [ ] Map Odds API response to Game schema
- [ ] Handle duplicate game prevention
- [ ] Add logging for API calls

**Commit 3.4: Create scheduled game updates (optional)**
- [ ] Setup cron job to auto-fetch game data
- [ ] Add game data refresh logic
- [ ] Configure update intervals

---

### Phase 4: Backend - Authentication & Core API

**Commit 4.1: Setup authentication middleware**
- [ ] Install passport and JWT dependencies
- [ ] Create auth guard for protected routes
- [ ] Setup JWT validation
- [ ] Create admin role guard

**Commit 4.2: Implement Games endpoints**
- [ ] Create GamesController
- [ ] Implement GET /games/next endpoint
- [ ] Implement POST /games/next endpoint (authenticated)
- [ ] Add request/response DTOs
- [ ] Add error handling

**Commit 4.3: Implement Bets endpoints**
- [ ] Create BetsController
- [ ] Implement POST /bets endpoint (create bet)
- [ ] Implement GET /bets endpoint (get user bets)
- [ ] Add validation for bet placement rules
- [ ] Prevent duplicate bets per game per user

**Commit 4.4: Implement admin settlement endpoint**
- [ ] Create POST /games/:gameId/settle endpoint
- [ ] Add admin authentication check
- [ ] Implement bet result calculation logic
- [ ] Update bet statuses (won/lost/push)
- [ ] Award points to winners

**Commit 4.5: Add API documentation and error handling**
- [ ] Add Swagger/OpenAPI documentation (optional)
- [ ] Implement global exception filter
- [ ] Add validation pipes
- [ ] Create consistent error response format

---

### Phase 5: Frontend - Authentication Setup

**Commit 5.1: Install and configure next-auth**
- [ ] Install next-auth
- [ ] Create [...nextauth] API route
- [ ] Configure credentials provider
- [ ] Setup session handling

**Commit 5.2: Create authentication UI components**
- [ ] Create SignIn component
- [ ] Create SignOut button
- [ ] Add authentication state management
- [ ] Style components with Tailwind

**Commit 5.3: Setup API client**
- [ ] Create API client utility
- [ ] Add authentication token handling
- [ ] Create API hooks for data fetching
- [ ] Add error handling

**Commit 5.4: Create protected route wrapper**
- [ ] Create authentication context
- [ ] Add route protection logic
- [ ] Create loading states
- [ ] Handle unauthenticated redirects

---

### Phase 6: Frontend - Game Display & Betting Interface

**Commit 6.1: Create main page layout**
- [ ] Create home page component
- [ ] Add navigation/header with auth status
- [ ] Setup responsive layout with Tailwind
- [ ] Add loading and error states

**Commit 6.2: Implement game display**
- [ ] Create GameCard component
- [ ] Fetch and display next game data
- [ ] Show teams, start time, and point spread
- [ ] Format dates and odds properly

**Commit 6.3: Create betting interface**
- [ ] Create BetForm component
- [ ] Add team selection UI (Cavaliers vs Opponent)
- [ ] Implement bet submission
- [ ] Add success/error notifications
- [ ] Disable betting after user has placed bet

**Commit 6.4: Display user's bets**
- [ ] Create BetsList component
- [ ] Fetch and display user's betting history
- [ ] Show bet status (pending/won/lost/push)
- [ ] Display points earned
- [ ] Add real-time updates after bet placement

**Commit 6.5: Add user points display**
- [ ] Create PointsDisplay component
- [ ] Fetch and show total user points
- [ ] Add points animation on wins
- [ ] Display points history

---

### Phase 7: Testing, Polish & Documentation

**Commit 7.1: Create admin testing interface**
- [ ] Create admin page/component (can be simple form)
- [ ] Add game settlement form
- [ ] Input final scores
- [ ] Trigger settlement endpoint
- [ ] Display settlement results

**Commit 7.2: Add loading states and error handling**
- [ ] Add loading spinners throughout the app
- [ ] Implement error boundaries
- [ ] Add user-friendly error messages
- [ ] Add retry mechanisms

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

Points awarded: **100 points per winning bet**

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
