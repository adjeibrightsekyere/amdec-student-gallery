import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePasswords } from "./authHelpers";
import { getDb } from "./mongodb";
import type { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        let user = null;

        // retry up to 3 times to handle cold start
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const db = await getDb();
            user = await db.collection("users").findOne({
              username: credentials.username.toLowerCase(),
            });
            break; // success, exit loop
          } catch (error) {
            console.error(`Login attempt ${attempt} failed:`, error);
            if (attempt === 3) throw new Error("Database connection failed");
            await new Promise((res) => setTimeout(res, 1000 * attempt)); // wait 1s, 2s
          }
        }

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as "admin" | "visitor";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};