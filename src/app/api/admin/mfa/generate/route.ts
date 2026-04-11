import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Génère un nouveau secret TOTP
  const secret = generateSecret();

  // Génère l'URI TOTP (standard RFC 6238)
  const issuer = process.env.MFA_ISSUER ?? "OccasOrdi";
  const label  = session.user.email ?? "admin";
  const otpauth = generateURI({
    label,
    issuer,
    secret,
  });

  // Génère le QR code en Data URL
  const qrUrl = await QRCode.toDataURL(otpauth);

  return NextResponse.json({ secret, qrUrl });
}
