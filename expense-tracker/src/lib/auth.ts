/**
 * Shared NextAuth configuration
 */

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        },
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token, user }: any) => {
      const userId = token?.sub || token?.uid || user?.id || (session?.user as any)?.id;
      if (session?.user && userId) {
        (session.user as any).id = userId;
      }
      if (token?.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
    jwt: async ({ user, token, account, profile }: any) => {
      if (user) {
        token.uid = user.id;
        token.sub = user.id;
      } else if (profile) {
        const profileId = (profile as any)?.sub || (profile as any)?.id;
        if (profileId) {
          token.uid = profileId;
          token.sub = profileId;
        }
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
