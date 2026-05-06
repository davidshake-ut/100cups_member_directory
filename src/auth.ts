import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  accounts,
  invites,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

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
  providers: [
    Resend({
      apiKey: resendApiKey,
      from: emailFrom,
    }),
  ],
  callbacks: {
    async signIn({ user, email }) {
      if (!user.email) return false;
      const normalized = user.email.toLowerCase();
      const invite = await db.query.invites.findFirst({
        where: and(eq(invites.email, normalized), isNull(invites.revokedAt)),
      });
      if (!invite) return false;

      const isVerifyClick = !email?.verificationRequest;
      if (isVerifyClick && !invite.usedAt) {
        await db
          .update(invites)
          .set({ usedAt: new Date() })
          .where(eq(invites.id, invite.id));
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: "member" | "admin" }).role
        ?? "member";
      return session;
    },
  },
});
