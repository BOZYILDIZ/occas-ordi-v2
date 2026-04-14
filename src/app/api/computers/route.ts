import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Augmenter la limite du body pour accepter les images base64
export const maxDuration = 30;
export const dynamic = "force-dynamic";

// GET /api/computers — liste le stock
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type      = searchParams.get("type")      ?? undefined;
  const condition = searchParams.get("condition") ?? undefined;
  const grade     = searchParams.get("grade")     ?? undefined;
  const maxPrice  = searchParams.get("maxPrice");
  const sortBy    = searchParams.get("sortBy")    ?? "recent";
  const page      = parseInt(searchParams.get("page") ?? "1");
  const limit     = parseInt(searchParams.get("limit") ?? "20");

  const where = {
    ...(type      && { type:      type as never }),
    ...(condition && { condition: condition as never }),
    ...(grade     && { grade:     grade as never }),
    ...(maxPrice  && { price: { lte: parseFloat(maxPrice) } }),
  };

  const orderBy =
    sortBy === "price_asc"  ? { price: "asc"  as const } :
    sortBy === "price_desc" ? { price: "desc" as const } :
                              { createdAt: "desc" as const };

  const computers = await prisma.computer.findMany({
    where,
    include: { label: true },
    orderBy,
    skip:  (page - 1) * limit,
    take:  limit,
  });

  const total = await prisma.computer.count({ where });

  return NextResponse.json({ computers, total, page, limit });
}

// POST /api/computers — ajoute un ordinateur
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();

  // Vérifie que le SKU n'existe pas déjà
  const existing = await prisma.computer.findUnique({ where: { sku: body.sku } });
  if (existing) {
    return NextResponse.json({ error: "Ce SKU existe déjà." }, { status: 409 });
  }

  const computer = await prisma.computer.create({
    data: {
      sku:         body.sku,
      type:        body.type,
      brand:       body.brand       || null,
      cpuBrand:    body.cpuBrand,
      cpuModel:    body.cpuModel,
      cpuGen:      body.cpuGen    || null,
      ramSize:     body.ramSize,
      ramType:     body.ramType,
      storageSize: body.storageSize,
      storageType: body.storageType,
      screenSize:  body.screenSize  || null,
      gpuModel:    body.gpuModel    || null,
      condition:   body.condition,
      grade:       body.grade,
      price:       body.price,
      priceOld:    body.priceOld ?? null,
      os:          body.os       || null,
      color:       body.color    || null,
      notes:       body.notes    || null,
      imageUrl:    body.imageUrl || null,
      userId:      session.user.id,
      // Crée automatiquement l'étiquette avec les positions par défaut
      label: { create: {} },
    },
  });

  return NextResponse.json({ id: computer.id }, { status: 201 });
}
