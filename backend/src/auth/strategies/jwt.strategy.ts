import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

/**
 * JWT Payload interface
 * This is what we encode in the JWT token
 */
export interface JwtPayload {
  email: string;
  sub: string; // User ID
}

/**
 * JWT Strategy for validating JWT tokens
 * This strategy is automatically used by the JwtAuthGuard
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  /**
   * Validate the JWT payload and return the user
   * This method is called automatically after the token is verified
   * @param payload - The decoded JWT payload
   * @returns The user document or throws UnauthorizedException
   */
  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user object which will be attached to request.user
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      points: user.points,
      role: user.role,
    };
  }
}
