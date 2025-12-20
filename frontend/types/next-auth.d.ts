import 'next-auth';
import 'next-auth/jwt';

/**
 * Extend next-auth types to include custom user properties
 */
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string;
    points: number;
    role: string;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      points: number;
      role: string;
      accessToken: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    points: number;
    role: string;
    accessToken: string;
  }
}
