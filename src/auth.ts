import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { createTransport } from "nodemailer";
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
    verifyRequest: "/signin/verify",
  },
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST ?? "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 15 * 60, // codes expire in 15 minutes
      generateVerificationToken() {
        return String(Math.floor(100000 + Math.random() * 900000));
      },
      async sendVerificationRequest({ identifier: to, token, provider }) {
        const transport = createTransport(provider.server);
        await transport.sendMail({
          from: provider.from,
          to,
          subject: "Your sign-in code for the 100 Cups Directory",
          text: `Your sign-in code is: ${token}\n\nThis code expires in 15 minutes. If you didn't request this, you can ignore this email.`,
          html: `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f5f1ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2c2c2c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ed;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5ddd3;border-radius:16px;padding:40px;">
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:1.2;color:#2c2c2c;">Your sign-in code.</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#2c2c2c;">Enter this code to sign in to the 100 Cups Mastermind Directory.</p>
                <p style="margin:0 0 28px;font-size:48px;font-weight:700;letter-spacing:0.15em;text-align:center;color:#2c2c2c;">${token}</p>
                <hr style="border:none;border-top:1px solid #e5ddd3;margin:32px 0;" />
                <p style="margin:0;font-size:12px;line-height:1.5;color:#7a7268;">This code expires in 15 minutes. Didn't request this? You can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: "member" | "admin" }).role ?? "member";
      return session;
    },
  },
});
