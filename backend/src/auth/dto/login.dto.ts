import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO for user login request
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

/**
 * DTO for login response
 */
export class LoginResponseDto {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    points: number;
    role: string;
  };
}
