import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verify as totpVerify } from "otplib";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { code, secret } = await request.json();

  if (!code || !secret) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  // Vérifie le code TOTP
  const isValid = await totpVerify({ token: code, secret });

  if (!isValid) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 400 });
  }

  // Active le MFA et sauvegarde le secret
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaEnabled:  true,
      mfaSecret:   secret,
      mfaVerified: true,
    },
  });

  return NextResponse.json({ success: true });
}
