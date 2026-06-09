import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";
import LinkedIn from "next-auth/providers/linkedin";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  pages: {
    signIn: "/signin",
  },
  providers: [Google, MicrosoftEntraId, LinkedIn],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: "member" | "admin" }).role ?? "member";
      return session;
    },
  },
});
