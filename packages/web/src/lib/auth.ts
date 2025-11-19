import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Attach user's tenant memberships
        const memberships = await prisma.tenantMembership.findMany({
          where: { userId: user.id },
          include: {
            tenant: {
              select: {
                id: true,
                slug: true,
                name: true,
                logo: true,
                brandColor: true,
              },
            },
          },
        });

        session.user.tenants = memberships.map(m => ({
          id: m.tenant.id,
          slug: m.tenant.slug,
          name: m.tenant.name,
          logo: m.tenant.logo,
          brandColor: m.tenant.brandColor,
          role: m.role,
        }));
      }

      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`🎉 New user signed up: ${user.email}`);
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
