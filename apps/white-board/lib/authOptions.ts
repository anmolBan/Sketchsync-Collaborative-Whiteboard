import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import axios from "axios";
import GoogleProvider from "next-auth/providers/google";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3002";

export const authOptions: NextAuthOptions = {
  // Tell NextAuth to use your custom sign-in page instead of its default one
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

          // Decode the JWT payload to grab user fields
          const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
          );
          return {
            id:    payload.userId,
            name:  payload.name,
            email: payload.email,
            // Store raw token so we can forward it to the WS backend later
            accessToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],

  callbacks: {

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await axios.post(`${BACKEND_URL}/api/users/oauth-signin`, {
            name: user.name,
            email: user.email,
          });
          const { token } = res.data;
          if (!token) return false;
          // Stash the backend token on the account so the jwt callback can read it
          (account as typeof account & { backendToken: string }).backendToken = token;
        } catch {
          return false;
        }
      }
      return true;
    },

    // Persist accessToken inside the JWT
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // Read the backend token we stored during signIn
        const backendToken = (account as typeof account & { backendToken?: string }).backendToken;
        if (backendToken) {
          token.accessToken = backendToken;
          const payload = JSON.parse(
            Buffer.from(backendToken.split(".")[1], "base64").toString()
          );
          token.id = payload.userId;
        }
      } else if (user) {
        token.accessToken = (user as typeof user & { accessToken: string }).accessToken;
        token.id          = user.id;
      }
      return token;
    },

    // Expose accessToken + id on the client-side session
    async session({ session, token }) {
      (session as typeof session & { accessToken: string }).accessToken = token.accessToken as string;
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};
