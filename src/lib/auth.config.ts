// auth.config.ts — Compatible Edge Runtime (pas de Node.js/prisma ici)
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth }) {
      // Le proxy ne tourne que sur les routes protégées (login exclu)
      // Si pas de session → NextAuth redirige vers pages.signIn
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.role        = (user as { role?: string }).role;
        token.mfaVerified = (user as { mfaVerified?: boolean }).mfaVerified;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { mfaVerified?: boolean }).mfaVerified = token.mfaVerified as boolean;
      }
      return session;
    },
  },
  providers: [],
};
