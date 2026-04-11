"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMPUTER_TYPES, CPU_BRANDS, CPU_MODELS, RAM_SIZES, RAM_TYPES,
  STORAGE_SIZES, STORAGE_TYPES, CONDITIONS, GRADES, OS_TYPES, DEVICE_BRANDS,
} from "@/lib/constants";
import ImagePicker from "@/components/form/ImagePicker";

type FormData = {
  sku: string;
  brand: string;
  brandOther: string;
  imageUrl: string;
  type: string;
  cpuBrand: string;
  cpuModel: string;
  cpuModelOther: string;
  cpuGen: string;
  ramSize: string;
  ramType: string;
  storageSize: string;
  storageType: string;
  screenSize: string;
  gpuModel: string;
  condition: string;
  grade: string;
  price: string;
  priceOld: string;
  os: string;
  color: string;
  notes: string;
};

const INITIAL: FormData = {
  sku: "", brand: "", brandOther: "", imageUrl: "", type: "", cpuBrand: "",
  cpuModel: "", cpuModelOther: "", cpuGen: "",
  ramSize: "", ramType: "", storageSize: "", storageType: "",
  screenSize: "", gpuModel: "", condition: "", grade: "",
  price: "", priceOld: "", os: "", color: "", notes: "",
};

export default function NewComputerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Résoudre les champs "Autre"
    const resolvedBrand     = form.brand === "Autre" ? form.brandOther : form.brand;
    const resolvedCpuModel  = form.cpuModel.startsWith("Autre") ? form.cpuModelOther : form.cpuModel;
    const resolvedGrade     = form.condition === "NEUF" ? "A_PLUS" : form.grade;

    const res = await fetch("/api/computers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        brand:       resolvedBrand,
        cpuModel:    resolvedCpuModel,
        grade:       resolvedGrade,
        ramSize:     parseInt(form.ramSize),
        storageSize: parseInt(form.storageSize),
        price:       parseFloat(form.price),
        priceOld:    form.priceOld ? parseFloat(form.priceOld) : null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de l'enregistrement.");
      return;
    }

    const { id } = await res.json();
    router.push(`/admin/labels?computerId=${id}`);
  };

  // Modèles CPU filtrés selon la marque choisie
  const cpuModels = form.cpuBrand ? CPU_MODELS[form.cpuBrand] ?? [] : [];

  const isNeuf         = form.condition === "NEUF";
  const isBrandAutre   = form.brand === "Autre";
  const isCpuAutre     = form.cpuModel.startsWith("Autre");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Enregistrer un ordinateur</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section Identification ── */}
        <Section title="Identification">
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU / Référence *">
              <input
                required
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className={inputCls}
                placeholder="ex: 2024-0042"
              />
            </Field>
            <Field label="Type *">
              <Select
                required
                value={form.type}
                onChange={(v) => set("type", v)}
                options={COMPUTER_TYPES}
                placeholder="Sélectionner…"
              />
            </Field>
            <Field label="Marque *">
              <Select
                required
                value={form.brand}
                onChange={(v) => { set("brand", v); set("brandOther", ""); }}
                options={DEVICE_BRANDS.map((b) => ({ value: b, label: b }))}
                placeholder="Sélectionner…"
              />
              {isBrandAutre && (
                <input
                  required
                  autoFocus
                  value={form.brandOther ?? ""}
                  onChange={(e) => set("brandOther", e.target.value)}
                  className={`${inputCls} mt-2`}
                  placeholder="Préciser la marque…"
                />
              )}
            </Field>
          </div>
        </Section>

        {/* ── Section CPU ── */}
        <Section title="Processeur">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Marque CPU *">
              <Select
                required
                value={form.cpuBrand}
                onChange={(v) => { set("cpuBrand", v); set("cpuModel", ""); }}
                options={CPU_BRANDS}
                placeholder="Sélectionner…"
              />
            </Field>
            <Field label="Modèle CPU *">
              <Select
                required
                value={form.cpuModel}
                onChange={(v) => { set("cpuModel", v); set("cpuModelOther", ""); }}
                options={cpuModels}
                placeholder={form.cpuBrand ? "Sélectionner…" : "Choisir une marque d'abord"}
                disabled={!form.cpuBrand}
              />
              {isCpuAutre && (
                <input
                  required
                  autoFocus
                  value={form.cpuModelOther ?? ""}
                  onChange={(e) => set("cpuModelOther", e.target.value)}
                  className={`${inputCls} mt-2`}
                  placeholder="Préciser le modèle CPU…"
                />
              )}
            </Field>
            <Field label="Génération">
              <input
                value={form.cpuGen}
                onChange={(e) => set("cpuGen", e.target.value)}
                className={inputCls}
                placeholder="ex: 8ème Gen"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section RAM ── */}
        <Section title="Mémoire RAM">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacité RAM *">
              <Select
                required
                value={form.ramSize}
                onChange={(v) => set("ramSize", v)}
                options={RAM_SIZES.map((r) => ({ value: String(r.value), label: r.label }))}
                placeholder="Sélectionner…"
              />
            </Field>
            <Field label="Type RAM *">
              <Select
                required
                value={form.ramType}
                onChange={(v) => set("ramType", v)}
                options={RAM_TYPES}
                placeholder="Sélectionner…"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section Stockage ── */}
        <Section title="Stockage">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacité *">
              <Select
                required
                value={form.storageSize}
                onChange={(v) => set("storageSize", v)}
                options={STORAGE_SIZES.map((s) => ({ value: String(s.value), label: s.label }))}
                placeholder="Sélectionner…"
              />
            </Field>
            <Field label="Type *">
              <Select
                required
                value={form.storageType}
                onChange={(v) => set("storageType", v)}
                options={STORAGE_TYPES}
                placeholder="Sélectionner…"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section État & Prix ── */}
        <Section title="État & Prix">
          <div className="grid grid-cols-2 gap-4">
            <Field label="État *">
              <Select
                required
                value={form.condition}
                onChange={(v) => set("condition", v)}
                options={CONDITIONS}
                placeholder="Sélectionner…"
              />
            </Field>
            {isNeuf ? (
              <div key="grade-neuf" className="flex items-center gap-2 px-3 py-2 bg-emerald-900/20 border border-emerald-800 rounded-lg col-span-1">
                <span className="text-emerald-400 text-sm font-medium">Grade A+</span>
                <span className="text-emerald-600 text-xs">— attribué automatiquement (article neuf)</span>
              </div>
            ) : (
              <Field key="grade-select" label="Grade *">
                <Select
                  required
                  value={form.grade ?? ""}
                  onChange={(v) => set("grade", v)}
                  options={GRADES}
                  placeholder="Sélectionner…"
                />
              </Field>
            )}
            <Field label="Prix de vente (€) *">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputCls}
                placeholder="249.99"
              />
            </Field>
            <Field label="Ancien prix (€) — barré">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceOld}
                onChange={(e) => set("priceOld", e.target.value)}
                className={inputCls}
                placeholder="299.99"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section Photo ── */}
        <Section title="Photo du produit">
          <ImagePicker
            value={form.imageUrl}
            onChange={(url) => set("imageUrl", url)}
            searchQuery={[form.brand || form.cpuBrand, form.cpuModel].filter(Boolean).join(" ")}
          />
        </Section>

        {/* ── Section Optionnel ── */}
        <Section title="Informations optionnelles">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Système d'exploitation">
              <Select
                value={form.os}
                onChange={(v) => set("os", v)}
                options={OS_TYPES}
                placeholder="Sélectionner…"
              />
            </Field>
            <Field label="GPU dédié">
              <input
                value={form.gpuModel}
                onChange={(e) => set("gpuModel", e.target.value)}
                className={inputCls}
                placeholder="ex: GTX 1650, RTX 3060"
              />
            </Field>
            <Field label="Taille écran">
              <input
                value={form.screenSize}
                onChange={(e) => set("screenSize", e.target.value)}
                className={inputCls}
                placeholder='ex: 15.6"'
              />
            </Field>
            <Field label="Couleur">
              <input
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className={inputCls}
                placeholder="ex: Noir, Argent"
              />
            </Field>
          </div>
          <Field label="Notes / Défauts visibles">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputCls} h-20 resize-none`}
              placeholder="Remarques sur l'état, accessoires inclus, etc."
            />
          </Field>
        </Section>

        {/* Erreur */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Bouton */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-700 text-gray-400 hover:text-white
                       rounded-xl transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900
                       text-white font-semibold rounded-xl transition-colors text-sm
                       flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enregistrement…
              </>
            ) : (
              "Enregistrer et créer l'étiquette →"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers UI ────────────────────────────────

const inputCls = `w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm
  placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value, onChange, options, placeholder, required, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[] | { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <select
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
