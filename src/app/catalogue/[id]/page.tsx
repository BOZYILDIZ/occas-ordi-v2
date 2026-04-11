import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const GRADE_LABEL: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };
const GRADE_COLOR: Record<string, string> = {
  A_PLUS: "bg-emerald-900/40 text-emerald-400 border-emerald-700",
  A:      "bg-green-900/40 text-green-400 border-green-700",
  B:      "bg-yellow-900/40 text-yellow-400 border-yellow-700",
  C:      "bg-red-900/40 text-red-400 border-red-700",
};
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
  DESKTOP: "Ordinateur de bureau", LAPTOP: "Ordinateur portable",
  ALL_IN_ONE: "All-in-One", MINI_PC: "Mini PC", WORKSTATION: "Station de travail",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await prisma.computer.findUnique({ where: { id } });
  if (!c) return { title: "Appareil introuvable" };

  const title = `${c.brand ?? c.cpuBrand} ${c.cpuModel} — ${Number(c.price).toFixed(0)} € | Occas Ordi Haguenau`;
  const storageStr = c.storageSize >= 1000 ? `${c.storageSize / 1000} To` : `${c.storageSize} Go`;
  const description = `${c.brand ?? c.cpuBrand} ${c.cpuModel}, ${c.ramSize} Go RAM, ${storageStr} — ${Number(c.price).toFixed(0)} €. Ordinateur reconditionné à Haguenau. Grade ${c.grade.replace("_", "")}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-bold">Occas Ordi</span>
          </Link>
          <Link href="/catalogue" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Retour au catalogue
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Photo */}
        {computer.imageUrl && (
          <div className="relative w-full h-64 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
            <Image
              src={computer.imageUrl}
              alt={`${computer.brand ?? computer.cpuBrand} ${computer.cpuModel}`}
              fill
              className="object-contain p-6"
              unoptimized
            />
          </div>
        )}

        {/* En-tête */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-500 text-sm mb-1 font-mono">{computer.sku}</p>
            <h1 className="text-3xl font-black text-white leading-tight">
              {computer.brand ? `${computer.brand} ` : ""}{computer.cpuModel}
            </h1>
            <p className="text-gray-400 mt-1">{TYPE_LABEL[computer.type] ?? computer.type}</p>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-lg font-black
            ${GRADE_COLOR[computer.grade] ?? ""}`}>
            Grade {GRADE_LABEL[computer.grade] ?? computer.grade}
          </div>
        </div>

        {/* Prix */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center justify-between">
          <div>
            <div className="text-5xl font-black text-white">
              {Number(computer.price).toFixed(0)}&nbsp;€
            </div>
            {computer.priceOld && (
              <div className="text-gray-500 line-through mt-1 text-lg">
                {Number(computer.priceOld).toFixed(0)} €
              </div>
            )}
            <div className="text-gray-500 text-sm mt-2">Prix TTC • {conditionLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm">En stock</div>
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 ml-auto" />
          </div>
        </div>

        {/* Specs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Caractéristiques</h2>
          </div>
          <div className="divide-y divide-gray-800">
            <SpecRow label="Processeur" value={`${computer.cpuBrand} ${computer.cpuModel}${computer.cpuGen ? ` (${computer.cpuGen})` : ""}`} />
            <SpecRow label="Mémoire RAM" value={`${computer.ramSize} Go ${computer.ramType}`} />
            <SpecRow label="Stockage" value={`${storageStr} ${STORAGE_SHORT[computer.storageType] ?? computer.storageType}`} />
            {computer.os && <SpecRow label="Système d'exploitation" value={OS_LABEL[computer.os] ?? computer.os} />}
            {computer.gpuModel && <SpecRow label="Carte graphique" value={computer.gpuModel} />}
            {computer.screenSize && <SpecRow label="Écran" value={`${computer.screenSize}${computer.screenRes ? ` — ${computer.screenRes}` : ""}`} />}
            {computer.color && <SpecRow label="Couleur" value={computer.color} />}
          </div>
        </div>

        {/* Notes */}
        {computer.notes && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-3">Notes</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{computer.notes}</p>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-8">
          Occas Ordi — Haguenau · Informatique reconditionnée
        </p>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 gap-4">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-white text-sm font-medium text-right">{value}</span>
    </div>
  );
}
