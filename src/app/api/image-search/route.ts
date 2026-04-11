import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET /api/image-search?q=HP+EliteBook+840
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ images: [] });

  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId  = process.env.GOOGLE_CSE_ID;

  if (!apiKey || apiKey === "VOTRE_CLE_ICI" || !cseId || cseId === "VOTRE_CSE_ID_ICI") {
    return NextResponse.json({ error: "GOOGLE_API_KEY et GOOGLE_CSE_ID manquants dans .env", images: [] }, { status: 503 });
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key",        apiKey);
  url.searchParams.set("cx",         cseId);
  url.searchParams.set("q",          q);
  url.searchParams.set("searchType", "image");
  url.searchParams.set("num",        "10");
  url.searchParams.set("safe",       "active");
  url.searchParams.set("imgType",    "photo");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json();
    // Log complet pour debug
    console.error("[image-search] Google error:", JSON.stringify(err, null, 2));
    const msg = err?.error?.message ?? "Erreur Google";
    const code = err?.error?.code ?? res.status;
    return NextResponse.json({ error: `[${code}] ${msg}`, details: err?.error, images: [] }, { status: res.status });
  }

  const data = await res.json();
  const images = (data.items ?? []).map((item: { link: string; image: { thumbnailLink: string }; title: string }) => ({
    url:       item.link,
    thumbnail: item.image?.thumbnailLink,
    title:     item.title,
  }));

  return NextResponse.json({ images });
}
