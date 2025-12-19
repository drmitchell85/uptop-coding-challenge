# Setup Instructions

Complete setup guide for the Cavaliers Betting application.

## Prerequisites

- Node.js v18+ (v20+ recommended for best compatibility)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## MongoDB Setup

### Option 1: Local MongoDB Installation (Ubuntu/Debian)

```bash
# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb

# Enable MongoDB to start on boot
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (M0 Free tier)
3. Create a database user with username and password
4. Add your IP address to the IP whitelist (or use `0.0.0.0/0` for testing)
5. Get your connection string: Click "Connect" → "Connect your application"
6. Copy the connection string (looks like `mongodb+srv://...`)

### Option 3: MongoDB with Docker

```bash
# Pull and run MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps | grep mongodb
```

## Project Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd uptop-coding-challenge
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

**Update these values in `backend/.env`:**

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/cavs-betting

# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cavs-betting

# Get your free API key from https://the-odds-api.com/
ODDS_API_KEY=your_actual_api_key_here

# Generate a random string for admin access
ADMIN_API_KEY=your_random_admin_key_here

# Generate a random string for JWT
JWT_SECRET=your_random_jwt_secret_here
```

**Start the backend:**

```bash
npm run start:dev
```

The backend should start on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local file
nano .env.local  # or use your preferred editor
```

**Update these values in `frontend/.env.local`:**

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here

NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Start the frontend:**

```bash
npm run dev
```

The frontend should start on `http://localhost:3000`

## Verification

### Check Backend

```bash
# In a new terminal
curl http://localhost:3001
```

You should see a response from the NestJS server.

### Check MongoDB Connection

Look for this message in the backend console:
```
✅ MongoDB connected successfully
```

If you see connection errors:
- Verify MongoDB is running: `sudo systemctl status mongodb` (or `docker ps` if using Docker)
- Check your `MONGODB_URI` in `backend/.env`
- For Atlas, ensure your IP is whitelisted

### Check Frontend

Open your browser to `http://localhost:3000` - you should see the Cavaliers Betting homepage.

## Getting API Keys

### The Odds API

1. Go to https://the-odds-api.com/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 500 requests per month
5. Add the key to `backend/.env` as `ODDS_API_KEY`

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
- Check if MongoDB is running: `sudo systemctl status mongodb`
- Start MongoDB: `sudo systemctl start mongodb`
- Verify connection string in `backend/.env`

### Port Already in Use

**Error:** `Port 3000 is already in use` or `Port 3001 is already in use`

**Solutions:**
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9  # for frontend
lsof -ti:3001 | xargs kill -9  # for backend
```

### Module Not Found Errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Node Version Issues

This project requires Node.js v20+. Check your version:
```bash
node --version
```

If you have an older version, install the latest:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

## Development Workflow

1. Start MongoDB (if local): `sudo systemctl start mongodb`
2. Start backend: `cd backend && npm run start:dev`
3. Start frontend (new terminal): `cd frontend && npm run dev`
4. Make changes and see hot-reload in action!

## Next Steps

Once everything is running:
1. Test the connection between frontend and backend
2. Get your Odds API key and test game fetching
3. Start implementing features according to the README roadmap

## Need Help?

- Check the main [README.md](./README.md) for project documentation
- Review individual module READMEs (e.g., `backend/src/database/README.md`)
- Check the Git commit history for implementation details
