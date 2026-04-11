// auth.ts — Node.js runtime uniquement (prisma + bcryptjs + otplib)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verify as totpVerify } from "otplib";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",        type: "email" },
        password: { label: "Mot de passe", type: "password" },
        totp:     { label: "Code MFA",     type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        // Vérification mot de passe
        const passwordOk = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!passwordOk) return null;

        // Vérification MFA TOTP (si activé)
        if (user.mfaEnabled && user.mfaSecret) {
          const totpCode = credentials.totp as string;
          if (!totpCode) return null;
          const isValidTotp = await totpVerify({ token: totpCode, secret: user.mfaSecret });
          if (!isValidTotp) return null;
        }

        return {
          id:          user.id,
          email:       user.email,
          name:        user.name,
          role:        user.role,
          mfaVerified: user.mfaEnabled,
        };
      },
    }),
  ],
});
