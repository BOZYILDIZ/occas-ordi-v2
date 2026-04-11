"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type Computer = {
  id: string; sku: string; brand?: string; type: string;
  cpuBrand: string; cpuModel: string;
  ramSize: number; ramType: string;
  storageSize: number; storageType: string;
  condition: string; grade: string;
  price: number; os?: string;
  imageUrl?: string;
  createdAt: string;
};

const GRADE_COLORS: Record<string, string> = {
  A_PLUS: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
  A:      "text-green-400 bg-green-900/30 border-green-800",
  B:      "text-yellow-400 bg-yellow-900/30 border-yellow-800",
  C:      "text-red-400 bg-red-900/30 border-red-800",
};
const GRADE_LABELS: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };
const CONDITION_LABELS: Record<string, string> = {
  NEUF: "Neuf", RECONDITIONNE: "Reconditionné", OCCASION: "Occasion",
};
const STORAGE_SHORT: Record<string, string> = {
  HDD: "HDD", SSD_SATA: "SSD", SSD_NVME: "NVMe", EMMC: "eMMC",
};

export default function ComputersListPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [confirm,   setConfirm]   = useState<string | null>(null);
  const [page,      setPage]      = useState(1);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    const res  = await fetch(`/api/computers?${params}`);
    const data = await res.json();
    setComputers(data.computers ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/computers/${id}`, { method: "DELETE" });
    setConfirm(null);
    setDeleting(null);
    load();
  };

  const filtered = search.trim()
    ? computers.filter((c) =>
        `${c.brand} ${c.cpuBrand} ${c.cpuModel} ${c.sku}`.toLowerCase()
          .includes(search.toLowerCase())
      )
    : computers;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock</h1>
          <p className="text-gray-400 text-sm mt-1">{total} appareil{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/computers/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500
                     text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Ajouter un appareil
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par marque, modèle, SKU…"
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl
                     text-white text-sm placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          {search ? "Aucun résultat pour cette recherche." : "Aucun appareil enregistré."}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider w-16">Photo</th>
                <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Appareil</th>
                <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Config</th>
                <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">État</th>
                <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Prix</th>
                <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((c) => {
                const storageStr = c.storageSize >= 1000
                  ? `${c.storageSize / 1000} To`
                  : `${c.storageSize} Go`;

                return (
                  <tr key={c.id} className="hover:bg-gray-800/50 transition-colors group">
                    {/* Photo */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-10 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {c.imageUrl ? (
                          <Image src={c.imageUrl} alt="" fill className="object-contain p-1" unoptimized/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Appareil */}
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">
                        {c.brand ?? c.cpuBrand} {c.cpuModel}
                      </div>
                      <div className="text-gray-500 text-xs font-mono mt-0.5">{c.sku}</div>
                    </td>

                    {/* Config */}
                    <td className="px-4 py-3">
                      <div className="text-gray-300 text-sm">
                        {c.ramSize} Go · {storageStr} {STORAGE_SHORT[c.storageType] ?? ""}
                      </div>
                      {c.os && (
                        <div className="text-gray-600 text-xs mt-0.5">
                          {c.os.replace(/_/g, " ")}
                        </div>
                      )}
                    </td>

                    {/* État */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${GRADE_COLORS[c.grade] ?? ""}`}>
                        Grade {GRADE_LABELS[c.grade] ?? c.grade}
                      </span>
                      <div className="text-gray-500 text-xs mt-1">
                        {CONDITION_LABELS[c.condition] ?? c.condition}
                      </div>
                    </td>

                    {/* Prix */}
                    <td className="px-4 py-3">
                      <span className="text-white font-bold">{Number(c.price).toFixed(0)} €</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/computers/${c.id}`}
                          className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white
                                     bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/admin/computers/${c.id}/edit`}
                          className="px-2.5 py-1.5 text-xs text-amber-400 hover:text-amber-300
                                     bg-amber-900/20 hover:bg-amber-900/40 rounded-lg transition-colors"
                        >
                          Modifier
                        </Link>
                        <Link
                          href={`/admin/labels?computerId=${c.id}`}
                          className="px-2.5 py-1.5 text-xs text-blue-400 hover:text-blue-300
                                     bg-blue-900/20 hover:bg-blue-900/40 rounded-lg transition-colors"
                        >
                          Étiquette
                        </Link>
                        <button
                          onClick={() => setConfirm(c.id)}
                          className="px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300
                                     bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors"
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <span className="text-gray-500 text-sm">
                Page {page} sur {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700
                             disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700
                             disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Supprimer cet appareil ?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Cette action est irréversible. L&apos;appareil et son étiquette seront définitivement supprimés.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white
                           border border-gray-700 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirm)}
                disabled={!!deleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500
                           disabled:bg-red-900 rounded-xl transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
