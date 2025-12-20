import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';

/**
 * Authentication service for user login and token generation
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticate user and generate JWT token
   * For this demo app, we'll use a simplified authentication:
   * - Email only (no password validation)
   * - Creates user if doesn't exist
   * - Returns JWT token for API access
   */
  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    // Find or create user (simplified for demo purposes)
    let user = await this.userModel.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await this.userModel.create({
        email,
        name: email.split('@')[0], // Use email prefix as name
        points: 1000, // Starting points for new users
      });
    }

    // Generate JWT token
    const payload = {
      email: user.email,
      sub: user._id.toString(),
    };

    const token = this.jwtService.sign(payload);

    // Return login response
    return {
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        points: user.points,
        role: user.role,
      },
    };
  }

  /**
   * Validate user credentials (placeholder for future implementation)
   * In a production app, this would validate password hash
   */
  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });

    // TODO: Add password validation in production
    // For demo purposes, we accept any password if user exists
    if (user) {
      return user;
    }

    return null;
  }
}
