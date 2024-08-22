import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github"
import LinkedinProvider from "next-auth/providers/linkedin"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user repo'
        }
      }
    }),
  ],
  // secret: process.env.JWT_SECRET,
  
  // callbacks: {
  //   async jwt({ token, account }) {
  //     if (account) {
  //       token.access_token = account.access_token as string;
  //     }
  //     return token;
  //   },
  //   async session({ session, token }) {
  //     if (token.access_token) {
  //       session.access_token = token.access_token;
  //     }
  //     return session;
  //   },
  // },
  
};
