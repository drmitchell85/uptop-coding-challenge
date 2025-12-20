import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Use this guard on routes that require authentication
 *
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected-route')
 * async protectedRoute(@Request() req) {
 *   // req.user will contain the user object from JwtStrategy.validate()
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
