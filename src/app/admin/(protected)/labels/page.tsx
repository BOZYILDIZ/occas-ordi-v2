"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { LabelPreview, type LabelData } from "@/components/label/LabelPreview";
import { useReactToPrint } from "react-to-print";

type Computer = LabelData & { id: string; sku: string };

export default function LabelsPage() {
  const searchParams  = useSearchParams();
  const preselectedId = searchParams.get("computerId");

  const [computers, setComputers]       = useState<Computer[]>([]);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [loading, setLoading]           = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  // Charge la liste des ordinateurs
  useEffect(() => {
    fetch("/api/computers?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setComputers(d.computers);
        // Présélectionne l'ordinateur qui vient d'être créé
        if (preselectedId) {
          setSelected(new Set([preselectedId]));
        }
      })
      .finally(() => setLoading(false));
  }, [preselectedId]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll   = () => setSelected(new Set(computers.map((c) => c.id)));
  const clearAll    = () => setSelected(new Set());

  const selectedComputers = computers.filter((c) => selected.has(c.id));

  // ─── IMPRESSION ───────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Etiquettes_OccasOrdi",
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm 15mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
      }
    `,
  });

  const onPrint = useCallback(() => {
    handlePrint();
  }, [handlePrint]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Impression d&apos;étiquettes</h1>
          <p className="text-gray-400 text-sm mt-1">
            Format 20cm × 3.5cm • A4 paysage • 5 étiquettes par page
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{selected.size} sélectionné(s)</span>
          <button
            onClick={onPrint}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500
                       disabled:bg-gray-700 disabled:text-gray-500
                       text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Liste de sélection ── */}
        <div className="col-span-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-white text-sm font-medium">Sélectionner</span>
            <div className="flex gap-2">
              <button onClick={selectAll}  className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Tout</button>
              <span className="text-gray-600">|</span>
              <button onClick={clearAll}   className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Aucun</button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-800">
            {computers.map((c) => (
              <label
                key={c.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                  ${selected.has(c.id) ? "bg-blue-900/20" : "hover:bg-gray-800"}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500
                             focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {c.cpuBrand} {c.cpuModel}
                  </p>
                  <p className="text-gray-500 text-xs">{c.sku} · {Number(c.price).toFixed(2)} €</p>
                </div>
              </label>
            ))}
            {computers.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-12">Aucun ordinateur enregistré.</p>
            )}
          </div>
        </div>

        {/* ── Prévisualisation ── */}
        <div className="col-span-2">
          <h2 className="text-gray-400 text-sm font-medium mb-4">Prévisualisation (×1.5)</h2>
          {selectedComputers.length === 0 ? (
            <div className="flex items-center justify-center h-48 bg-gray-900/50 rounded-2xl border border-dashed border-gray-700">
              <p className="text-gray-600 text-sm">Sélectionne des ordinateurs à gauche</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {selectedComputers.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <LabelPreview
                    data={c}
                    scale={1.5}
                    baseUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Zone d'impression (cachée à l'écran) ── */}
      <div className="hidden">
        <PrintSheet ref={printRef} computers={selectedComputers} />
      </div>
    </div>
  );
}

// ─── Feuille d'impression : 5 étiquettes par ligne sur A4 paysage ─────────────

const PrintSheet = ({ computers, ref }: { computers: Computer[]; ref: React.RefObject<HTMLDivElement | null> }) => {
  // A4 paysage : 297mm × 210mm, marges 10mm × 15mm → zone utile ≈ 267mm × 190mm
  // Étiquette : 200mm × 35mm → on peut en placer 5 par page (5 × 35 + espaces = 175+20 = 195 ≤ 190? ajustons)
  // → On place 5 par page avec 3mm d'espace entre chaque
  const LABELS_PER_PAGE = 5;
  const pages: Computer[][] = [];

  for (let i = 0; i < computers.length; i += LABELS_PER_PAGE) {
    pages.push(computers.slice(i, i + LABELS_PER_PAGE));
  }

  return (
    <div ref={ref}>
      {pages.map((page, pi) => (
        <div
          key={pi}
          style={{
            width:         "267mm",
            minHeight:     "190mm",
            pageBreakAfter: pi < pages.length - 1 ? "always" : "auto",
            padding:       "0",
          }}
        >
          {page.map((c, li) => (
            <div key={c.id} style={{ marginBottom: li < page.length - 1 ? "3mm" : "0" }}>
              <LabelPreview
                data={c}
                scale={1}
                baseUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
