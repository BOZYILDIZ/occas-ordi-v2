import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [total, neuf, occasion, recondi] = await Promise.all([
    prisma.computer.count(),
    prisma.computer.count({ where: { condition: "NEUF" } }),
    prisma.computer.count({ where: { condition: "OCCASION" } }),
    prisma.computer.count({ where: { condition: "RECONDITIONNE" } }),
  ]);
  const recent = await prisma.computer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, sku: true, cpuBrand: true, cpuModel: true, price: true, grade: true, condition: true },
  });
  return { total, neuf, occasion, recondi, recent };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <Link
          href="/admin/computers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
                     text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un PC
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total stock" value={stats.total} color="blue" />
        <StatCard label="Neufs" value={stats.neuf} color="green" />
        <StatCard label="Reconditionnés" value={stats.recondi} color="yellow" />
        <StatCard label="Occasions" value={stats.occasion} color="gray" />
      </div>

      {/* Derniers ajouts */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Derniers ajouts</h2>
          <Link href="/admin/computers" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Voir tout →
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left">SKU</th>
              <th className="px-6 py-3 text-left">Processeur</th>
              <th className="px-6 py-3 text-left">Grade</th>
              <th className="px-6 py-3 text-left">État</th>
              <th className="px-6 py-3 text-right">Prix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {stats.recent.map((c) => (
              <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-gray-300 font-mono text-sm">{c.sku}</td>
                <td className="px-6 py-4 text-white text-sm">{c.cpuBrand} {c.cpuModel}</td>
                <td className="px-6 py-4">
                  <GradeBadge grade={c.grade} />
                </td>
                <td className="px-6 py-4">
                  <ConditionBadge condition={c.condition} />
                </td>
                <td className="px-6 py-4 text-right text-white font-semibold">
                  {Number(c.price).toFixed(2)} €
                </td>
              </tr>
            ))}
            {stats.recent.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                  Aucun ordinateur enregistré pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue:   "text-blue-400",
    green:  "text-green-400",
    yellow: "text-yellow-400",
    gray:   "text-gray-400",
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A_PLUS: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
    A:      "bg-green-900/40 text-green-300 border-green-800",
    B:      "bg-yellow-900/40 text-yellow-300 border-yellow-800",
    C:      "bg-red-900/40 text-red-300 border-red-800",
  };
  const labels: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[grade] ?? ""}`}>
      {labels[grade] ?? grade}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const colors: Record<string, string> = {
    NEUF:          "bg-blue-900/40 text-blue-300 border-blue-800",
    RECONDITIONNE: "bg-purple-900/40 text-purple-300 border-purple-800",
    OCCASION:      "bg-gray-800 text-gray-300 border-gray-700",
  };
  const labels: Record<string, string> = {
    NEUF: "Neuf", RECONDITIONNE: "Reconditionné", OCCASION: "Occasion",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[condition] ?? ""}`}>
      {labels[condition] ?? condition}
    </span>
  );
}
