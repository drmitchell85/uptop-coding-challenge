# Auth Module

This module handles user authentication and user data management.

## User Model

The User schema represents authenticated users in the system.

### Schema Definition

```typescript
{
  email: string;        // Required, unique - User's email address
  name?: string;        // Optional - User's display name
  points: number;       // Default: 0 - Points earned from winning bets
  createdAt: Date;      // Auto-generated timestamp
  updatedAt: Date;      // Auto-updated timestamp
}
```

### Indexes

- `email`: Unique index for fast lookups and enforcing uniqueness

### Usage

To use the User model in other modules:

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class YourModule {}
```

Then inject the model in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class YourService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
```

## DTOs

### CreateUserDto

Used when creating a new user:

```typescript
{
  email: string;
  name?: string;
}
```

## Future Enhancements

- Integrate with next-auth for authentication
- Add user roles (admin, user)
- Add user profile management
- Add user statistics and leaderboards
