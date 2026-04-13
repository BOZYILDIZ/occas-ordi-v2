import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";

const GRADE_LABEL: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };
const STORAGE_SHORT: Record<string, string> = {
  HDD: "HDD", SSD_SATA: "SSD SATA", SSD_NVME: "SSD NVMe", EMMC: "eMMC",
};
const OS_LABEL: Record<string, string> = {
  WINDOWS_11:     "Windows 11",
  WINDOWS_11_PRO: "Windows 11 Pro",
  WINDOWS_10:     "Windows 10",
  WINDOWS_10_PRO: "Windows 10 Pro",
  MACOS:          "macOS",
  LINUX:          "Linux",
  SANS_OS:        "Sans OS",
};
const TYPE_LABEL: Record<string, string> = {
  DESKTOP:     "Ordinateur de bureau",
  LAPTOP:      "Ordinateur portable",
  ALL_IN_ONE:  "All-in-One",
  MINI_PC:     "Mini PC",
  WORKSTATION: "Station de travail",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await prisma.computer.findUnique({ where: { id } });
  if (!c) return { title: "Appareil introuvable" };

  const storageStr = c.storageSize >= 1000 ? `${c.storageSize / 1000} To` : `${c.storageSize} Go`;
  const title = `${c.brand ?? c.cpuBrand} ${c.cpuModel} — ${Number(c.price).toFixed(0)} € | Occas Ordi`;
  const description = `${c.brand ?? c.cpuBrand} ${c.cpuModel}, ${c.ramSize} Go RAM, ${storageStr} — ${Number(c.price).toFixed(0)} €. Ordinateur reconditionné à Haguenau.`;

  return {
    title,
    description,
    openGraph: {
      title, description,
      images: c.imageUrl ? [{ url: c.imageUrl }] : [],
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function ComputerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const computer = await prisma.computer.findUnique({ where: { id } });
  if (!computer) notFound();

  const storageStr = computer.storageSize >= 1000
    ? `${computer.storageSize / 1000} To`
    : `${computer.storageSize} Go`;

  const conditionLabel =
    computer.condition === "RECONDITIONNE" ? "Reconditionné"
    : computer.condition === "NEUF" ? "Neuf" : "Occasion";

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/60"
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#1d1d1f] font-semibold text-[17px] tracking-tight">
            Occas Ordi
          </Link>
          <Link
            href="/catalogue"
            className="text-[#0071e3] text-sm hover:underline transition-all"
          >
            ← Retour au catalogue
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-14">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* ── Colonne gauche : image ── */}
          <FadeIn>
            <div className="sticky top-24">
              <div className="bg-[#f5f5f7] rounded-3xl overflow-hidden aspect-square flex items-center justify-center">
                {computer.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={computer.imageUrl}
                      alt={`${computer.brand ?? computer.cpuBrand} ${computer.cpuModel}`}
                      fill
                      className="object-contain p-10"
                      unoptimized
                    />
                  </div>
                ) : (
                  <svg className="w-20 h-20 text-[#d2d2d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
          </FadeIn>

          {/* ── Colonne droite : infos ── */}
          <div className="flex flex-col gap-6">

            {/* En-tête produit */}
            <FadeIn delay={80}>
              <div>
                <p className="text-[#6e6e73] text-sm font-medium tracking-widest uppercase mb-2">
                  {TYPE_LABEL[computer.type] ?? computer.type}
                </p>
                <h1 className="text-[#1d1d1f] font-bold text-4xl tracking-tight leading-tight mb-3">
                  {computer.brand ? `${computer.brand} ` : ""}{computer.cpuModel}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 bg-[#f5f5f7] rounded-full text-[#1d1d1f] text-sm font-medium">
                    Grade {GRADE_LABEL[computer.grade] ?? computer.grade}
                  </span>
                  <span className="text-[#86868b] text-sm font-mono">{computer.sku}</span>
                </div>
              </div>
            </FadeIn>

            {/* Prix */}
            <FadeIn delay={140}>
              <div className="border-t border-b border-[#d2d2d7]/60 py-6">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-[#1d1d1f] font-bold" style={{ fontSize: "48px", lineHeight: 1 }}>
                    {Number(computer.price).toFixed(0)} €
                  </span>
                  {computer.priceOld && (
                    <span className="text-[#86868b] text-xl line-through mb-1">
                      {Number(computer.priceOld).toFixed(0)} €
                    </span>
                  )}
                </div>
                <p className="text-[#6e6e73] text-sm">
                  Prix TTC · {conditionLabel} ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                    En stock
                  </span>
                </p>
              </div>
            </FadeIn>

            {/* Specs */}
            <FadeIn delay={200}>
              <div>
                <h2 className="text-[#1d1d1f] font-semibold text-lg mb-4">Caractéristiques</h2>
                <div className="divide-y divide-[#d2d2d7]/60">
                  <SpecRow label="Processeur"
                    value={`${computer.cpuBrand} ${computer.cpuModel}${computer.cpuGen ? ` (${computer.cpuGen})` : ""}`} />
                  <SpecRow label="Mémoire RAM"    value={`${computer.ramSize} Go ${computer.ramType}`} />
                  <SpecRow label="Stockage"       value={`${storageStr} ${STORAGE_SHORT[computer.storageType] ?? computer.storageType}`} />
                  {computer.os && (
                    <SpecRow label="Système"      value={OS_LABEL[computer.os] ?? computer.os} />
                  )}
                  {computer.gpuModel && (
                    <SpecRow label="Carte graphique" value={computer.gpuModel} />
                  )}
                  {computer.screenSize && (
                    <SpecRow label="Écran"
                      value={`${computer.screenSize}${computer.screenRes ? ` — ${computer.screenRes}` : ""}`} />
                  )}
                  {computer.color && (
                    <SpecRow label="Couleur"      value={computer.color} />
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Notes */}
            {computer.notes && (
              <FadeIn delay={260}>
                <div className="bg-[#f5f5f7] rounded-2xl p-5">
                  <h3 className="text-[#1d1d1f] font-semibold text-sm mb-2">Note</h3>
                  <p className="text-[#6e6e73] text-sm leading-relaxed">{computer.notes}</p>
                </div>
              </FadeIn>
            )}

          </div>
        </div>

        <p className="text-center text-[#86868b] text-xs mt-20">
          Occas Ordi — Haguenau · Informatique reconditionnée
        </p>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 gap-4">
      <span className="text-[#6e6e73] text-sm">{label}</span>
      <span className="text-[#1d1d1f] text-sm font-medium text-right">{value}</span>
    </div>
  );
}
