// middleware.ts — Edge Runtime compatible
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    // Protège tout /admin/* SAUF la page login elle-même
    "/admin/((?!login).*)",
    "/api/computers/:path*",
    "/api/labels/:path*",
  ],
};
