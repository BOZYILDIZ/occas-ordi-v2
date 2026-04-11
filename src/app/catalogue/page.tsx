"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { COMPUTER_TYPES, CONDITIONS, GRADES } from "@/lib/constants";

type Computer = {
  id: string; sku: string; type: string; cpuBrand: string; cpuModel: string;
  ramSize: number; ramType: string; storageSize: number; storageType: string;
  price: number; priceOld?: number; grade: string; condition: string; os?: string;
  imageUrl?: string; brand?: string;
};

const LIMIT = 12;

const gradeColors: Record<string, string> = {
  A_PLUS: "text-emerald-400 bg-emerald-900/30 border-emerald-800",
  A:      "text-green-400 bg-green-900/30 border-green-800",
  B:      "text-yellow-400 bg-yellow-900/30 border-yellow-800",
  C:      "text-red-400 bg-red-900/30 border-red-800",
};
const gradeLabels: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };

export default function CataloguePage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  const [filterType,      setFilterType]      = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterGrade,     setFilterGrade]     = useState("");
  const [filterMaxPrice,  setFilterMaxPrice]  = useState("");
  const [sortBy,          setSortBy]          = useState("recent");

  const fetchComputers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
    if (filterType)      params.set("type",      filterType);
    if (filterCondition) params.set("condition", filterCondition);
    if (filterGrade)     params.set("grade",     filterGrade);
    if (filterMaxPrice)  params.set("maxPrice",  filterMaxPrice);
    if (sortBy !== "recent") params.set("sortBy", sortBy);

    const res  = await fetch(`/api/computers?${params}`);
    const data = await res.json();
    setComputers(data.computers ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, filterType, filterCondition, filterGrade, filterMaxPrice, sortBy]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filterType, filterCondition, filterGrade, filterMaxPrice, sortBy]);

  useEffect(() => { fetchComputers(); }, [fetchComputers]);

  const totalPages = Math.ceil(total / LIMIT);

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
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
          <span className="text-gray-400 text-sm">Catalogue</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Catalogue{" "}
            <span className="text-gray-500 text-lg font-normal">({total} appareil{total > 1 ? "s" : ""})</span>
          </h1>
        </div>

        {/* ── Filtres ── */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <select value={filterType} onChange={handleFilterChange(setFilterType)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les types</option>
            {COMPUTER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select value={filterCondition} onChange={handleFilterChange(setFilterCondition)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les états</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select value={filterGrade} onChange={handleFilterChange(setFilterGrade)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les grades</option>
            {GRADES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>

          <input
            type="number"
            value={filterMaxPrice}
            onChange={handleFilterChange(setFilterMaxPrice)}
            placeholder="Prix max (€)"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm
                       w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select value={sortBy} onChange={handleFilterChange(setSortBy)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto">
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>

        {/* ── Grille ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : computers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Aucun appareil ne correspond à ces critères.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {computers.map((c) => {
                const storageStr = c.storageSize >= 1000
                  ? `${c.storageSize / 1000} To`
                  : `${c.storageSize} Go`;

                return (
                  <Link key={c.id} href={`/catalogue/${c.id}`}
                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden
                               hover:border-gray-600 transition-colors flex flex-col group">

                    {/* Image */}
                    <div className="relative w-full h-40 bg-gray-800 flex-shrink-0">
                      {c.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt={`${c.brand ?? c.cpuBrand} ${c.cpuModel}`}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColors[c.grade] ?? ""}`}>
                        Grade {gradeLabels[c.grade] ?? c.grade}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <h3 className="text-white font-semibold text-sm leading-snug">
                          {c.brand ?? c.cpuBrand} {c.cpuModel}
                        </h3>
                        <span className="text-gray-600 text-xs font-mono shrink-0">{c.sku}</span>
                      </div>
                      <p className="text-gray-400 text-xs mb-1">
                        {c.ramSize} Go {c.ramType} · {storageStr}
                      </p>
                      {c.os && (
                        <p className="text-gray-600 text-xs mb-2">
                          {c.os.replace(/_/g, " ")}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-800">
                        <div>
                          <span className="text-xl font-black text-white">{Number(c.price).toFixed(0)} €</span>
                          {c.priceOld && (
                            <span className="ml-2 text-xs text-gray-600 line-through">
                              {Number(c.priceOld).toFixed(0)} €
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {c.condition === "RECONDITIONNE" ? "Reconditionné" : c.condition === "NEUF" ? "Neuf" : "Occasion"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10">
                <span className="text-gray-500 text-sm">
                  Page {page} sur {totalPages} · {total} appareil{total > 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 bg-gray-900
                               border border-gray-800 hover:border-gray-600 hover:text-white rounded-xl
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                    </svg>
                    Précédent
                  </button>

                  {/* Numéros de page */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | "…")[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === "…" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => { setPage(item as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={`w-9 h-9 text-sm rounded-xl transition-colors ${
                              item === page
                                ? "bg-blue-600 text-white font-bold"
                                : "text-gray-400 bg-gray-900 border border-gray-800 hover:border-gray-600 hover:text-white"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 bg-gray-900
                               border border-gray-800 hover:border-gray-600 hover:text-white rounded-xl
                               disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-gray-700 text-xs mt-12">
          Occas Ordi — Haguenau · Informatique reconditionnée
        </p>
      </div>
    </div>
  );
}
