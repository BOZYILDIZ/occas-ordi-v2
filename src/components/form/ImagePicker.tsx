"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  value: string;
  onChange: (url: string) => void;
  searchQuery?: string;
};

export default function ImagePicker({ value, onChange, searchQuery = "" }: Props) {
  const [query,       setQuery]       = useState(searchQuery);
  const [open,        setOpen]        = useState(false);
  const [pasteUrl,    setPasteUrl]    = useState("");
  const [processing,  setProcessing]  = useState(false);
  const [error,       setError]       = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const removeBackground = async (url: string) => {
    setProcessing(true);
    setError("");
    try {
      // Passer par le proxy pour éviter les erreurs CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Impossible de charger l'image");

      const blob = await response.blob();

      // Import dynamique — le modèle IA se charge une seule fois
      const { removeBackground } = await import("@imgly/background-removal");
      const resultBlob = await removeBackground(blob, {
        output: { format: "image/png", quality: 0.9 },
      });

      // Convertir en data URL pour stockage
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });

      onChange(dataUrl);
      setOpen(false);
      setPasteUrl("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du fond. Vérifie l'URL et réessaie.");
    } finally {
      setProcessing(false);
    }
  };

  const handleValidate = () => {
    const url = pasteUrl.trim();
    if (!url) return;
    removeBackground(url);
  };

  const clear = () => onChange("");

  return (
    <div className="space-y-3">

      {/* Aperçu */}
      {value ? (
        <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
          <Image
            src={value}
            alt="Photo produit"
            fill
            className="object-contain p-2"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                          flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setOpen(true); setPasteUrl(""); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={clear}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full h-28 border-2 border-dashed border-gray-700 hover:border-blue-500
                     rounded-xl flex flex-col items-center justify-center gap-2
                     text-gray-500 hover:text-blue-400 transition-colors"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                 m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">Ajouter une photo</span>
        </button>
      )}

      {/* Panneau d'ajout */}
      {open && (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-white text-sm font-medium">Ajouter une photo</span>
            <button type="button" onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white transition-colors text-lg leading-none">✕</button>
          </div>

          {/* Étape 1 — Ouvrir Google Images */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-400 text-xs mb-3">
              <span className="text-blue-400 font-semibold">Étape 1</span> — Ouvre Google Images,
              clique droit sur une image → <span className="text-white">"Copier l&apos;adresse de l&apos;image"</span>
            </p>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ex: HP EliteBook 840 G5"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
                           text-white text-sm placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(query || searchQuery)}&tbm=isch`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm
                           font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Google Images
              </a>
            </div>
          </div>

          {/* Étape 2 — Coller l'URL */}
          <div className="p-4">
            <p className="text-gray-400 text-xs mb-3">
              <span className="text-blue-400 font-semibold">Étape 2</span> — Colle l&apos;adresse ici,
              le fond sera supprimé automatiquement ✨
            </p>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                autoFocus
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleValidate(); } }}
                placeholder="https://exemple.com/image.jpg"
                disabled={processing}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
                           text-white text-sm placeholder-gray-500 disabled:opacity-50
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                disabled={!pasteUrl.trim() || processing}
                onClick={handleValidate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40
                           disabled:cursor-not-allowed text-white text-sm font-medium
                           rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {processing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Traitement…
                  </>
                ) : (
                  "Valider ✨"
                )}
              </button>
            </div>

            {/* Message de traitement */}
            {processing && (
              <p className="text-xs text-blue-400 mt-3 flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Suppression du fond en cours… (peut prendre 10-20 secondes la première fois)
              </p>
            )}

            {/* Erreur */}
            {error && (
              <p className="text-xs text-red-400 mt-3">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
