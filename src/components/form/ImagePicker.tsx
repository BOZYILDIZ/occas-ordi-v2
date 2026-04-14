"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  value: string;
  onChange: (url: string) => void;
  searchQuery?: string;
};

// ── Suppression du fond par flood fill depuis les 4 coins ──────────────────
function removeBackground(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);

  const idx = (x: number, y: number) => (y * width + x) * 4;

  // Récupère la couleur d'un pixel
  const getColor = (x: number, y: number) => {
    const i = idx(x, y);
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
  };

  // Distance colorimétrique entre deux pixels
  const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) =>
    Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);

  // Flood fill depuis un point de départ avec une tolérance
  const floodFill = (startX: number, startY: number, tolerance: number) => {
    const { r: sr, g: sg, b: sb } = getColor(startX, startY);
    const stack: [number, number][] = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const pIdx = y * width + x;
      if (visited[pIdx]) continue;

      const { r, g, b, a } = getColor(x, y);
      if (a === 0) { visited[pIdx] = 1; continue; }
      if (colorDist(r, g, b, sr, sg, sb) > tolerance) continue;

      visited[pIdx] = 1;

      // Rendre transparent
      const i = idx(x, y);
      data[i + 3] = 0;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  };

  const tolerance = 35;

  // Flood fill depuis les 4 coins
  floodFill(0, 0, tolerance);
  floodFill(width - 1, 0, tolerance);
  floodFill(0, height - 1, tolerance);
  floodFill(width - 1, height - 1, tolerance);

  // Lissage des bords : rendre semi-transparents les pixels adjacents au fond
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y);
      if (data[i + 3] === 255) {
        const neighbors = [
          [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        ];
        const hasTransparentNeighbor = neighbors.some(([nx, ny]) => {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) return false;
          return data[idx(nx, ny) + 3] === 0;
        });
        if (hasTransparentNeighbor) data[i + 3] = 180;
      }
    }
  }

  return imageData;
}

// ── Traitement principal ────────────────────────────────────────────────────
async function processImage(url: string): Promise<string> {
  // Passer par le proxy pour éviter les erreurs CORS
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error("Impossible de charger l'image");

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      // Redimensionner à max 900px pour limiter la taille du fichier final
      const MAX = 900;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const processed = removeBackground(imageData);
      ctx.putImageData(processed, 0, 0);

      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL("image/png", 0.9));
    };
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error("Erreur chargement image")); };
    img.src = blobUrl;
  });
}

// ── Composant ───────────────────────────────────────────────────────────────
export default function ImagePicker({ value, onChange, searchQuery = "" }: Props) {
  const [query,      setQuery]      = useState(searchQuery);
  const [open,       setOpen]       = useState(false);
  const [pasteUrl,   setPasteUrl]   = useState("");
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleValidate = async () => {
    const url = pasteUrl.trim();
    if (!url) return;
    setProcessing(true);
    setError("");
    try {
      const result = await processImage(url);
      onChange(result);
      setOpen(false);
      setPasteUrl("");
    } catch (err) {
      console.error(err);
      setError("Impossible de traiter cette image. Vérifie l'URL et réessaie.");
    } finally {
      setProcessing(false);
    }
  };

  const clear = () => onChange("");

  return (
    <div className="space-y-3">

      {/* Aperçu */}
      {value ? (
        <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
          <Image src={value} alt="Photo produit" fill className="object-contain p-2" unoptimized />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                          flex items-center justify-center gap-3">
            <button type="button" onClick={() => { setOpen(true); setPasteUrl(""); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors">
              Changer
            </button>
            <button type="button" onClick={clear}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="w-full h-28 border-2 border-dashed border-gray-700 hover:border-blue-500
                     rounded-xl flex flex-col items-center justify-center gap-2
                     text-gray-500 hover:text-blue-400 transition-colors">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                 m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Ajouter une photo</span>
        </button>
      )}

      {/* Panneau */}
      {open && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-white text-sm font-medium">Ajouter une photo</span>
            <button type="button" onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white transition-colors text-lg leading-none">✕</button>
          </div>

          {/* Étape 1 */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-400 text-xs mb-3">
              <span className="text-blue-400 font-semibold">Étape 1</span> — Ouvre Google Images,
              clique droit sur une image → <span className="text-white">"Copier l&apos;adresse de l&apos;image"</span>
            </p>
            <div className="flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="ex: HP EliteBook 840 G5"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
                           text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <a href={`https://www.google.com/search?q=${encodeURIComponent(query || searchQuery)}&tbm=isch`}
                target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium
                           rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Google Images
              </a>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="p-4">
            <p className="text-gray-400 text-xs mb-3">
              <span className="text-blue-400 font-semibold">Étape 2</span> — Colle l&apos;adresse ici,
              le fond blanc sera supprimé automatiquement ✨
            </p>
            <div className="flex gap-2">
              <input ref={inputRef} autoFocus value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleValidate(); } }}
                placeholder="https://exemple.com/image.jpg"
                disabled={processing}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
                           text-white text-sm placeholder-gray-500 disabled:opacity-50
                           focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" disabled={!pasteUrl.trim() || processing} onClick={handleValidate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40
                           disabled:cursor-not-allowed text-white text-sm font-medium
                           rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                {processing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Traitement…
                  </>
                ) : "Valider ✨"}
              </button>
            </div>

            {processing && (
              <p className="text-xs text-blue-400 mt-3 flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Suppression du fond en cours…
              </p>
            )}
            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
