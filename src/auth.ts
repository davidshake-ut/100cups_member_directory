import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/db/schema";

function buildEmail(url: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Sign in to the 100 Cups Mastermind Directory";
  const text = `Click the link below to sign in to the 100 Cups Mastermind Directory.

${url}

This link expires in 24 hours. If you didn't ask for it, you can ignore this email.`;
  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f5f1ed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2c2c2c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1ed;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e5ddd3;border-radius:16px;padding:40px;">
            <tr>
              <td>
                <p style="margin:0 0 16px;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#b8845a;">Members only</p>
                <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;line-height:1.2;color:#2c2c2c;">Sign in to the directory.</h1>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#2c2c2c;">Click the button below to sign in to the 100 Cups Mastermind Directory. If this is your first time, you'll be added as a new member.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:9999px;background:#2c2c2c;">
                      <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:500;color:#f5f1ed;text-decoration:none;border-radius:9999px;">Sign in</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#7a7268;">Or paste this link into your browser:<br/><a href="${url}" style="color:#b8845a;word-break:break-all;">${url}</a></p>
                <hr style="border:none;border-top:1px solid #e5ddd3;margin:32px 0;" />
                <p style="margin:0;font-size:12px;line-height:1.5;color:#7a7268;">The link expires in 24 hours. Didn't request this? You can safely ignore this email — someone may have entered your address by mistake.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { subject, html, text };
}

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
      // apiKey + from are captured at module load by the default sendVerificationRequest;
      // our override below reads them from process.env at call time so editing
      // .env.local during dev doesn't require a server restart.
      apiKey: process.env.RESEND_API_KEY ?? "",
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      async sendVerificationRequest({ identifier: to, url }) {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
        if (!apiKey) {
          throw new Error("RESEND_API_KEY is not set");
        }
        const { subject, html, text } = buildEmail(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to, subject, html, text }),
        });
        if (!res.ok) {
          throw new Error(
            `Resend error (${res.status}): ${await res.text()}`,
          );
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: "member" | "admin" }).role
        ?? "member";
      return session;
    },
  },
});
