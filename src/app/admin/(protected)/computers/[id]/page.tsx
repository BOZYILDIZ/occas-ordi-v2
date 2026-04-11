import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

const GRADE_COLORS: Record<string, string> = {
  A_PLUS: "bg-emerald-900/40 text-emerald-400 border-emerald-700",
  A:      "bg-green-900/40 text-green-400 border-green-700",
  B:      "bg-yellow-900/40 text-yellow-400 border-yellow-700",
  C:      "bg-red-900/40 text-red-400 border-red-700",
};
const GRADE_LABELS: Record<string, string>     = { A_PLUS: "A+", A: "A", B: "B", C: "C" };
const CONDITION_LABELS: Record<string, string> = { NEUF: "Neuf", RECONDITIONNE: "Reconditionné", OCCASION: "Occasion" };
const STORAGE_SHORT: Record<string, string>    = { HDD: "HDD", SSD_SATA: "SSD SATA", SSD_NVME: "SSD NVMe", EMMC: "eMMC" };
const OS_LABELS: Record<string, string>        = {
  WINDOWS_11: "Windows 11", WINDOWS_11_PRO: "Windows 11 Pro",
  WINDOWS_10: "Windows 10", WINDOWS_10_PRO: "Windows 10 Pro",
  MACOS: "macOS", LINUX: "Linux", SANS_OS: "Sans OS",
};
const TYPE_LABELS: Record<string, string> = {
  DESKTOP: "Desktop", LAPTOP: "Laptop", ALL_IN_ONE: "All-in-One",
  MINI_PC: "Mini PC", WORKSTATION: "Workstation",
};

export default async function ComputerDetailAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const computer = await prisma.computer.findUnique({ where: { id }, include: { label: true } });
  if (!computer) notFound();

  const storageStr = computer.storageSize >= 1000
    ? `${computer.storageSize / 1000} To`
    : `${computer.storageSize} Go`;

  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/computers" className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            {computer.brand ?? computer.cpuBrand} {computer.cpuModel}
          </h1>
          <p className="text-gray-500 text-sm font-mono">{computer.sku}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/computers/${computer.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700
                       text-white text-sm rounded-xl transition-colors border border-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Modifier
          </Link>
          <Link
            href={`/admin/labels?computerId=${computer.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700
                       text-white text-sm rounded-xl transition-colors border border-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Étiquette
          </Link>
          <Link
            href={`/catalogue/${computer.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
                       text-white text-sm rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Page publique
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Colonne gauche — Photo + Prix */}
        <div className="space-y-4">
          {/* Photo */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="relative w-full h-48 bg-gray-800">
              {computer.imageUrl ? (
                <Image
                  src={computer.imageUrl}
                  alt={`${computer.brand ?? computer.cpuBrand} ${computer.cpuModel}`}
                  fill className="object-contain p-4" unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-gray-600 text-xs">Pas de photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Prix & Grade */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
            <div>
              <div className="text-3xl font-black text-white">{Number(computer.price).toFixed(0)} €</div>
              {computer.priceOld && (
                <div className="text-gray-500 line-through text-sm mt-0.5">
                  {Number(computer.priceOld).toFixed(0)} €
                </div>
              )}
              <div className="text-gray-500 text-xs mt-1">Prix TTC</div>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold
              ${GRADE_COLORS[computer.grade] ?? ""}`}>
              Grade {GRADE_LABELS[computer.grade] ?? computer.grade}
            </div>
            <div className="text-gray-400 text-sm">
              {CONDITION_LABELS[computer.condition] ?? computer.condition}
            </div>
          </div>

          {/* Infos impression */}
          {computer.label && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Étiquette</h3>
              <div className="space-y-1.5 text-sm">
                <Row label="Imprimée" value={computer.label.printed ? "Oui" : "Non"} />
                <Row label="Nb impressions" value={String(computer.label.printCount)} />
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite — Specs */}
        <div className="col-span-2 space-y-4">
          {/* Identification */}
          <Card title="Identification">
            <Row label="SKU" value={computer.sku} mono />
            <Row label="Type" value={TYPE_LABELS[computer.type] ?? computer.type} />
            {computer.brand && <Row label="Marque" value={computer.brand} />}
            <Row label="Ajouté le" value={new Date(computer.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
            })} />
          </Card>

          {/* Processeur */}
          <Card title="Processeur">
            <Row label="Marque CPU" value={computer.cpuBrand} />
            <Row label="Modèle" value={computer.cpuModel} />
            {computer.cpuGen && <Row label="Génération" value={computer.cpuGen} />}
          </Card>

          {/* Mémoire & Stockage */}
          <Card title="Mémoire & Stockage">
            <Row label="RAM" value={`${computer.ramSize} Go ${computer.ramType}`} />
            <Row label="Stockage" value={`${storageStr} ${STORAGE_SHORT[computer.storageType] ?? computer.storageType}`} />
          </Card>

          {/* Optionnel */}
          {(computer.os || computer.gpuModel || computer.screenSize || computer.color || computer.notes) && (
            <Card title="Informations complémentaires">
              {computer.os        && <Row label="OS" value={OS_LABELS[computer.os] ?? computer.os} />}
              {computer.gpuModel  && <Row label="GPU" value={computer.gpuModel} />}
              {computer.screenSize && <Row label="Écran" value={`${computer.screenSize}${computer.screenRes ? ` — ${computer.screenRes}` : ""}`} />}
              {computer.color     && <Row label="Couleur" value={computer.color} />}
              {computer.notes     && (
                <div className="pt-2 border-t border-gray-800 mt-2">
                  <p className="text-gray-500 text-xs mb-1">Notes</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{computer.notes}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h2>
      </div>
      <div className="divide-y divide-gray-800">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-4">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={`text-sm font-medium text-right ${mono ? "font-mono text-gray-300" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
