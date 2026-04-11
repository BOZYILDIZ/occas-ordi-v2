import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Occas Ordi — Informatique d'occasion à Haguenau",
  description:
    "Achetez des PC reconditionnés et d'occasion de qualité à Haguenau. " +
    "Laptops, desktops, all-in-one — tous testés et garantis.",
};

export const dynamic = "force-dynamic";

async function getFeatured() {
  return prisma.computer.findMany({
    orderBy: { createdAt: "desc" },
    take:    6,
  });
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Navbar ── */}
      <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-white font-bold">Occas Ordi</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/catalogue" className="text-gray-400 hover:text-white text-sm transition-colors">
              Catalogue
            </Link>
            <Link href="/admin/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          Informatique{" "}
          <span className="text-blue-500">reconditionnée</span>
          <br />à Haguenau
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Tous nos PC sont testés, nettoyés et garantis. Des prix honnêtes,
          une qualité vérifiée.
        </p>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500
                     text-white font-bold rounded-2xl transition-colors text-lg"
        >
          Voir le catalogue →
        </Link>
      </section>

      {/* ── Dernières arrivées ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-white mb-6">Dernières arrivées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((c) => (
              <ComputerCard key={c.id} computer={c} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/catalogue"
              className="inline-flex px-6 py-3 border border-gray-700 text-gray-400
                         hover:text-white hover:border-gray-500 rounded-xl transition-colors text-sm"
            >
              Voir tout le stock
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function ComputerCard({ computer }: {
  computer: {
    id: string; sku: string; type: string; cpuBrand: string; cpuModel: string;
    ramSize: number; ramType: string; storageSize: number; storageType: string;
    price: number | string | { toString(): string }; priceOld?: number | string | { toString(): string } | null; grade: string; condition: string;
  }
}) {
  const gradeColors: Record<string, string> = {
    A_PLUS: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
    A:      "text-green-400 bg-green-900/30 border-green-800",
    B:      "text-yellow-400 bg-yellow-900/30 border-yellow-800",
    C:      "text-red-400 bg-red-900/30 border-red-800",
  };
  const gradeLabels: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };

  const storageStr = computer.storageSize >= 1000
    ? `${computer.storageSize / 1000} To`
    : `${computer.storageSize} Go`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColors[computer.grade] ?? ""}`}>
          Grade {gradeLabels[computer.grade] ?? computer.grade}
        </span>
        <span className="text-gray-600 text-xs font-mono">{computer.sku}</span>
      </div>

      <h3 className="text-white font-semibold mb-1">
        {computer.cpuBrand} {computer.cpuModel}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {computer.ramSize} Go {computer.ramType} · {storageStr}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-black text-white">{Number(computer.price).toFixed(0)} €</span>
          {computer.priceOld && (
            <span className="ml-2 text-sm text-gray-600 line-through">
              {Number(computer.priceOld).toFixed(0)} €
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
