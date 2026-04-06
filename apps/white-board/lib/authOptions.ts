import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import axios from "axios";
import GoogleProvider from "next-auth/providers/google";

// Extend NextAuth types so accessToken / id are recognized natively
declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    accessToken?: string;
  }

  interface Account {
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3002";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "text"     },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await axios.post(`${BACKEND_URL}/api/users/signin`, {
            email:    credentials.email,
            password: credentials.password,
          });
          const { token } = res.data;
          if (!token) return null;

          const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
          );
          return {
            id:          payload.userId,
            name:        payload.name,
            email:       payload.email,
            accessToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/users/oauth-signin`, {
            name:  user.name,
            email: user.email,
          });
          const { token } = res.data;
          if (!token) return false;

          // Stash the backend token so the jwt callback can read it
          account.backendToken = token;
        } catch (err) {
          console.error("[NextAuth] Google signIn failed:", (err as Error).message);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "google" && account.backendToken) {
        token.accessToken = account.backendToken;
        const payload = JSON.parse(
          Buffer.from(account.backendToken.split(".")[1], "base64").toString()
        );
        token.id = payload.userId;
      } else if (user) {
        token.accessToken = user.accessToken;
        token.id          = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};