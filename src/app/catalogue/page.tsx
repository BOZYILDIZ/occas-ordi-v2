"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
const gradeLabels: Record<string, string> = { A_PLUS: "A+", A: "A", B: "B", C: "C" };

// ── Composant animation scroll ──
function FadeInCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

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

  useEffect(() => { setPage(1); }, [filterType, filterCondition, filterGrade, filterMaxPrice, sortBy]);
  useEffect(() => { fetchComputers(); }, [fetchComputers]);

  const totalPages = Math.ceil(total / LIMIT);

  const handleFilterChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
    };

  const selectClass =
    "px-4 py-2 bg-white border border-[#d2d2d7] rounded-full text-[#1d1d1f] text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-colors " +
    "appearance-none cursor-pointer hover:border-[#86868b]";

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/60"
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#1d1d1f] font-semibold text-[17px] tracking-tight">
            Occas Ordi
          </Link>
          <span className="text-[#6e6e73] text-sm">Catalogue</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ── En-tête ── */}
        <div className="mb-10">
          <p className="text-[#6e6e73] text-sm font-medium tracking-widest uppercase mb-2">
            Stock disponible
          </p>
          <h1 className="text-[#1d1d1f] font-bold text-4xl tracking-tight">
            Catalogue{" "}
            <span className="text-[#86868b] font-normal text-2xl">
              ({total} appareil{total !== 1 ? "s" : ""})
            </span>
          </h1>
        </div>

        {/* ── Filtres ── */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-8 border-b border-[#d2d2d7]/60">
          <div className="relative">
            <select value={filterType} onChange={handleFilterChange(setFilterType)} className={selectClass}>
              <option value="">Tous les types</option>
              {COMPUTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select value={filterCondition} onChange={handleFilterChange(setFilterCondition)} className={selectClass}>
              <option value="">Tous les états</option>
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select value={filterGrade} onChange={handleFilterChange(setFilterGrade)} className={selectClass}>
              <option value="">Tous les grades</option>
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <input
            type="number"
            value={filterMaxPrice}
            onChange={handleFilterChange(setFilterMaxPrice)}
            placeholder="Prix max (€)"
            className={`${selectClass} w-36`}
          />

          <div className="ml-auto relative">
            <select value={sortBy} onChange={handleFilterChange(setSortBy)} className={selectClass}>
              <option value="recent">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* ── Grille ── */}
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#d2d2d7] border-t-[#1d1d1f] rounded-full animate-spin" />
          </div>
        ) : computers.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-[#86868b] text-lg">Aucun appareil ne correspond à ces critères.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {computers.map((c, i) => {
                const storageStr =
                  c.storageSize >= 1000
                    ? `${c.storageSize / 1000} To`
                    : `${c.storageSize} Go`;

                return (
                  <FadeInCard key={c.id} delay={(i % 4) * 50}>
                    <Link
                      href={`/catalogue/${c.id}`}
                      className="group block bg-[#f5f5f7] rounded-2xl overflow-hidden
                                 hover:shadow-xl hover:shadow-black/5 transition-all duration-300
                                 hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative w-full h-40 bg-white flex items-center justify-center">
                        {c.imageUrl ? (
                          <Image
                            src={c.imageUrl}
                            alt={`${c.brand ?? c.cpuBrand} ${c.cpuModel}`}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <svg className="w-12 h-12 text-[#d2d2d7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#6e6e73] text-xs font-medium">
                            Grade {gradeLabels[c.grade] ?? c.grade}
                          </span>
                          <span className="text-[#86868b] text-xs font-mono">{c.sku}</span>
                        </div>
                        <h3 className="text-[#1d1d1f] font-semibold text-sm leading-snug mb-1">
                          {c.brand ?? c.cpuBrand} {c.cpuModel}
                        </h3>
                        <p className="text-[#6e6e73] text-xs mb-3">
                          {c.ramSize} Go · {storageStr}
                        </p>
                        {c.os && (
                          <p className="text-[#86868b] text-xs mb-3">
                            {c.os.replace(/_/g, " ")}
                          </p>
                        )}
                        <div className="flex items-center justify-between border-t border-[#d2d2d7]/60 pt-3">
                          <span className="text-[#1d1d1f] font-bold text-lg">
                            {Number(c.price).toFixed(0)} €
                          </span>
                          {c.priceOld && (
                            <span className="text-[#86868b] text-xs line-through">
                              {Number(c.priceOld).toFixed(0)} €
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </FadeInCard>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-14 pt-8 border-t border-[#d2d2d7]/60">
                <span className="text-[#86868b] text-sm">
                  Page {page} sur {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="px-5 py-2 text-sm text-[#1d1d1f] border border-[#d2d2d7] rounded-full
                               hover:border-[#86868b] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Précédent
                  </button>

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
                          <span key={`e-${i}`} className="px-2 text-[#86868b] text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => { setPage(item as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={`w-9 h-9 text-sm rounded-full transition-colors ${
                              item === page
                                ? "bg-[#1d1d1f] text-white"
                                : "text-[#1d1d1f] border border-[#d2d2d7] hover:border-[#86868b]"
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
                    className="px-5 py-2 text-sm text-[#1d1d1f] border border-[#d2d2d7] rounded-full
                               hover:border-[#86868b] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-center text-[#86868b] text-xs mt-16">
          Occas Ordi — Haguenau · Informatique reconditionnée
        </p>
      </div>
    </div>
  );
}
