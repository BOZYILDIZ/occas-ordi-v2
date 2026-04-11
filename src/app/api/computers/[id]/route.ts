import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/computers/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.computer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// PATCH /api/computers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const computer = await prisma.computer.update({
    where: { id },
    data: {
      brand:       body.brand       || null,
      type:        body.type,
      cpuBrand:    body.cpuBrand,
      cpuModel:    body.cpuModel,
      cpuGen:      body.cpuGen      || null,
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
      os:          body.os          || null,
      color:       body.color       || null,
      notes:       body.notes       || null,
      imageUrl:    body.imageUrl    || null,
    },
  });

  return NextResponse.json({ id: computer.id });
}

// GET /api/computers/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const computer = await prisma.computer.findUnique({
    where: { id },
    include: { label: true },
  });

  if (!computer) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  return NextResponse.json(computer);
}
