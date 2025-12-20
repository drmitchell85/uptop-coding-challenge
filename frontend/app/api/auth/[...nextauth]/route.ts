import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth configuration for JWT-based authentication
 * Authenticates users against the NestJS backend API
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call backend API to authenticate user
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          // Return user object with JWT token from backend
          if (data.success && data.user && data.token) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              points: data.user.points,
              role: data.user.role,
              accessToken: data.token,
            };
          }

          return null;
        } catch (error) {
          // Authentication failed - return null to trigger error UI
          return null;
        }
      },
    }),
  ],

  // Configure JWT strategy for session handling
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // JWT configuration
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Callbacks for session and JWT handling
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.points = user.points;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }

      // Handle session updates (e.g., when points change)
      if (trigger === 'update' && session) {
        if (session.points !== undefined) {
          token.points = session.points;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data to session from token
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          points: token.points as number,
          role: token.role as string,
          accessToken: token.accessToken as string,
        };
      }
      return session;
    },
  },

  // Custom pages
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
