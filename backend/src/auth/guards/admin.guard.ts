import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../schemas/user.schema';

/**
 * Admin Role Guard
 * Use this guard on routes that require admin privileges
 * Must be used together with JwtAuthGuard
 *
 * Usage:
 * @UseGuards(JwtAuthGuard, AdminGuard)
 * @Post('admin-only-route')
 * async adminRoute(@Request() req) {
 *   // Only admin users can access this route
 * }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
