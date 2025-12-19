# Database Module

This module handles MongoDB connection using Mongoose.

## Configuration

The module uses environment variables for configuration:
- `MONGODB_URI`: MongoDB connection string

## Features

- ✅ Async configuration using ConfigService
- ✅ Connection state logging (connected, error, disconnected)
- ✅ Environment variable validation
- ✅ Retry writes enabled
- ✅ Write concern set to 'majority'

## Usage

The DatabaseModule is imported globally in AppModule. To use Mongoose in other modules:

```typescript
import { MongooseModule } from '@nestjs/mongoose';
import { YourSchema } from './schemas/your.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'YourModel', schema: YourSchema }]),
  ],
})
export class YourModule {}
```

## Connection Events

The module logs the following connection events:
- ✅ Connected: When MongoDB connection is established
- ❌ Error: When a connection error occurs
- ⚠️ Disconnected: When MongoDB disconnects

## Local Development

For local development, ensure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# https://docs.mongodb.com/manual/installation/
```
