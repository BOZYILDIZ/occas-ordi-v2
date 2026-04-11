/**
 * LabelPreview — Étiquette magasin 200mm × 35mm
 * Design enrichi avec logos de marques CPU + icônes specs
 */

import React from "react";
import QRCode from "react-qr-code";

export type LabelData = {
  id?:         string;
  sku:         string;
  type:        string;
  cpuBrand:    string;
  cpuModel:    string;
  ramSize:     number;
  ramType:     string;
  storageSize: number;
  storageType: string;
  price:       number;
  priceOld?:   number | null;
  grade:       string;
  condition:   string;
  os?:         string | null;
  brand?:      string | null;
};

type LabelProps = {
  data: LabelData;
  scale?: number;
  baseUrl?: string;
};

const MM = 3.7795275591; // 1mm en px à 96 dpi
const W  = 200;          // largeur mm
const H  = 35;           // hauteur mm

// ── Couleurs grade ────────────────────────────────────────
const GRADE: Record<string, { bg: string; text: string; accent: string; label: string }> = {
  A_PLUS: { bg: "#059669", text: "#ffffff", accent: "#047857", label: "A+" },
  A:      { bg: "#16a34a", text: "#ffffff", accent: "#15803d", label: "A"  },
  B:      { bg: "#d97706", text: "#ffffff", accent: "#b45309", label: "B"  },
  C:      { bg: "#dc2626", text: "#ffffff", accent: "#b91c1c", label: "C"  },
};

// ── Couleurs & styles marques appareils ───────────────────
const BRAND_STYLE: Record<string, { bg: string; text: string; abbr: string }> = {
  Apple:     { bg: "#1d1d1f", text: "#f5f5f7", abbr: "APL" },
  HP:        { bg: "#0096d6", text: "#ffffff", abbr: "HP"  },
  Lenovo:    { bg: "#e2231a", text: "#ffffff", abbr: "LNV" },
  Dell:      { bg: "#007db8", text: "#ffffff", abbr: "DEL" },
  Acer:      { bg: "#83b81a", text: "#ffffff", abbr: "ACR" },
  Asus:      { bg: "#00539b", text: "#ffffff", abbr: "ASS" },
  MSI:       { bg: "#c8102e", text: "#ffffff", abbr: "MSI" },
  Samsung:   { bg: "#1428a0", text: "#ffffff", abbr: "SAM" },
  Microsoft: { bg: "#737373", text: "#ffffff", abbr: "MSF" },
  Toshiba:   { bg: "#cc0000", text: "#ffffff", abbr: "TOS" },
  Autre:     { bg: "#6b7280", text: "#ffffff", abbr: "PC"  },
};

const TYPE_LABEL: Record<string, string> = {
  DESKTOP:     "Desktop",
  LAPTOP:      "Laptop",
  ALL_IN_ONE:  "All-in-One",
  MINI_PC:     "Mini PC",
  WORKSTATION: "Station",
};

const STORAGE_SHORT: Record<string, string> = {
  HDD:      "HDD",
  SSD_SATA: "SSD",
  SSD_NVME: "NVMe",
  EMMC:     "eMMC",
};

const OS_SHORT: Record<string, string> = {
  WINDOWS_11:     "Win 11",
  WINDOWS_11_PRO: "Win 11 Pro",
  WINDOWS_10:     "Win 10",
  WINDOWS_10_PRO: "Win 10 Pro",
  MACOS:          "macOS",
  LINUX:          "Linux",
  SANS_OS:        "Sans OS",
};

// ── Logo CPU Intel ────────────────────────────────────────
function IntelLogo({ s }: { s: number }) {
  return (
    <svg width={s * 28} height={s * 13} viewBox="0 0 72 32">
      <rect width="72" height="32" rx="4" fill="#0068b5"/>
      <text x="36" y="22" textAnchor="middle" fill="white"
        fontFamily="Arial" fontWeight="700" fontSize="16" letterSpacing="1">
        intel
      </text>
    </svg>
  );
}

// ── Logo CPU AMD ──────────────────────────────────────────
function AmdLogo({ s }: { s: number }) {
  return (
    <svg width={s * 26} height={s * 13} viewBox="0 0 64 32">
      <rect width="64" height="32" rx="4" fill="#ED1C24"/>
      <text x="32" y="22" textAnchor="middle" fill="white"
        fontFamily="Arial" fontWeight="900" fontSize="17" letterSpacing="0.5">
        AMD
      </text>
    </svg>
  );
}

// ── Logo Apple ─────────────────────────────────────────────
function AppleLogo({ s, color = "#1d1d1f" }: { s: number; color?: string }) {
  return (
    <svg width={s * 8} height={s * 9} viewBox="0 0 24 28">
      <path fill={color}
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ── Icône CPU générique ────────────────────────────────────
function CpuIcon({ s }: { s: number }) {
  return (
    <svg width={s * 16} height={s * 16} viewBox="0 0 24 24" fill="none">
      <rect x="7" y="7" width="10" height="10" rx="1" stroke="#6b7280" strokeWidth="1.5"/>
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Icône RAM ──────────────────────────────────────────────
function RamIcon({ s }: { s: number }) {
  return (
    <svg width={s * 18} height={s * 14} viewBox="0 0 24 18" fill="none">
      <rect x="1" y="4" width="22" height="10" rx="1.5" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M5 4V2M8 4V2M11 4V2M14 4V2M17 4V2M19 4V2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 14v2M8 14v2M11 14v2M14 14v2M17 14v2M19 14v2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Icône Stockage ─────────────────────────────────────────
function StorageIcon({ s, type }: { s: number; type: string }) {
  if (type === "HDD") return (
    <svg width={s * 18} height={s * 14} viewBox="0 0 24 18" fill="none">
      <rect x="1" y="3" width="22" height="12" rx="2" stroke="#8b5cf6" strokeWidth="1.5"/>
      <circle cx="18" cy="9" r="2" stroke="#8b5cf6" strokeWidth="1.5"/>
      <path d="M4 9h9" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width={s * 16} height={s * 16} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="#8b5cf6" strokeWidth="1.5"/>
      <path d="M7 9h10M7 13h7" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="17" cy="13" r="1.5" fill="#8b5cf6"/>
    </svg>
  );
}

// ── Icône OS ───────────────────────────────────────────────
function OsIcon({ s, os }: { s: number; os: string }) {
  if (os?.includes("MACOS")) return <AppleLogo s={s * 0.75} color="#6b7280" />;
  if (os?.includes("LINUX")) return (
    <svg width={s * 7} height={s * 8} viewBox="0 0 20 24" fill="none">
      <ellipse cx="10" cy="9" rx="5" ry="6" stroke="#6b7280" strokeWidth="1.5"/>
      <circle cx="8" cy="8" r="1" fill="#6b7280"/>
      <circle cx="12" cy="8" r="1" fill="#6b7280"/>
      <path d="M7 18s-3 1-3 3h12c0-2-3-3-3-3L11 14H9l-2 4z" stroke="#6b7280" strokeWidth="1.5" fill="none"/>
    </svg>
  );
  return (
    <svg width={s * 8} height={s * 8} viewBox="0 0 24 24">
      <path fill="#0078d4" d="M0 3.4L9.9 2v9.6H0zM11 1.8L24 0v11.5H11zM0 13H9.9V22.5L0 21zM11 13.1H24V24l-13-1.8z"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════
export const LabelPreview = React.forwardRef<HTMLDivElement, LabelProps>(
  ({ data, scale = 1, baseUrl = "" }, ref) => {
    const S = scale;
    const g = GRADE[data.grade] ?? GRADE.A;
    const brandKey = data.brand ?? "Autre";
    const brandStyle = BRAND_STYLE[brandKey] ?? BRAND_STYLE.Autre;
    const storageStr = data.storageSize >= 1000
      ? `${data.storageSize / 1000} To`
      : `${data.storageSize} Go`;

    const qrUrl = data.id ? `${baseUrl}/catalogue/${data.id}` : null;
    const storageVal  = data.storageSize >= 1000 ? `${data.storageSize / 1000}` : `${data.storageSize}`;
    const storageUnit = data.storageSize >= 1000 ? "To" : "Go";

    // Layout mm : Brand 0→26 | Specs 27→148 | Prix 149→175 | QR 176→200
    const BRAND_W = 26;
    const SPECS_L = 27;
    const PRICE_X = 149;
    const QR_X    = 176;

    // Séparateur vertical réutilisable
    const VSep = ({ x }: { x: number }) => (
      <div style={{
        position: "absolute", left: `${x * MM * S}px`,
        top: 0, bottom: 0, width: `${S}px`, background: "#e5e7eb",
      }} />
    );

    return (
      <div
        ref={ref}
        style={{
          width:      `${W * MM * S}px`,
          height:     `${H * MM * S}px`,
          position:   "relative",
          background: "#ffffff",
          border:     `${S}px solid #e5e7eb`,
          overflow:   "hidden",
          fontFamily: "'Arial', sans-serif",
          boxSizing:  "border-box",
          userSelect: "none",
        }}
      >

        {/* ══ BANDE MARQUE — 0→26mm ══ */}
        <div style={{
          position:      "absolute",
          left: 0, top: 0, bottom: 0,
          width:         `${BRAND_W * MM * S}px`,
          background:    brandStyle.bg,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          justifyContent: "center",
          gap:           `${1.5 * S}px`,
        }}>
          {/* Logo / Nom marque — plus grand */}
          {data.cpuBrand === "APPLE" || brandKey === "Apple" ? (
            <AppleLogo s={S * 2.4} color={brandStyle.text} />
          ) : (
            <div style={{
              fontSize:      `${18 * S}px`,
              fontWeight:    "900",
              color:         brandStyle.text,
              letterSpacing: "-0.03em",
              lineHeight:    "1",
              textAlign:     "center",
              padding:       `0 ${2 * S}px`,
            }}>
              {brandKey}
            </div>
          )}

          {/* Type — plus grand et plus visible */}
          <div style={{
            fontSize:      `${9 * S}px`,
            fontWeight:    "700",
            color:         brandStyle.text,
            opacity:       1,
            background:    "rgba(255,255,255,0.22)",
            padding:       `${1.5 * S}px ${3 * S}px`,
            borderRadius:  `${2 * S}px`,
            letterSpacing: "0.01em",
          }}>
            {TYPE_LABEL[data.type] ?? data.type}
          </div>

          {/* SKU — bien visible */}
          <div style={{
            fontSize:      `${7 * S}px`,
            fontWeight:    "700",
            color:         brandStyle.text,
            opacity:       0.9,
            fontFamily:    "monospace",
            letterSpacing: "0.04em",
          }}>
            {data.sku}
          </div>
        </div>

        <VSep x={BRAND_W} />

        {/* ══ ZONE SPECS — 27→149mm — 3 colonnes ══ */}
        <div style={{
          position:      "absolute",
          left:          `${SPECS_L * MM * S}px`,
          right:         `${(W - PRICE_X) * MM * S}px`,
          top: 0, bottom: 0,
          display:       "flex",
          flexDirection: "row",
          alignItems:    "center",
          justifyContent: "space-evenly",
          padding:       `${2 * S}px ${2 * S}px`,
        }}>

          {/* ─ Colonne CPU ─ */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            justifyContent: "center",
            gap:           `${2 * S}px`,
          }}>
            {data.cpuBrand === "INTEL" && <IntelLogo s={S} />}
            {data.cpuBrand === "AMD"   && <AmdLogo s={S} />}
            {data.cpuBrand === "APPLE" && (
              <div style={{
                background:   "#1d1d1f",
                borderRadius: `${2 * S}px`,
                padding:      `${1.5 * S}px ${3.5 * S}px`,
                display:      "flex",
                alignItems:   "center",
                gap:          `${1.5 * S}px`,
              }}>
                <AppleLogo s={S} color="#f5f5f7" />
                <span style={{ fontSize: `${7.5 * S}px`, color: "#f5f5f7", fontWeight: "700" }}>Silicon</span>
              </div>
            )}
            {!["INTEL","AMD","APPLE"].includes(data.cpuBrand) && <CpuIcon s={S} />}

            <div style={{
              fontSize:   `${12 * S}px`,
              fontWeight: "800",
              color:      "#111827",
              lineHeight: "1",
              whiteSpace: "nowrap",
              textAlign:  "center",
            }}>
              {data.cpuModel}
            </div>

            {data.os && (
              <div style={{ display: "flex", alignItems: "center", gap: `${1.5 * S}px` }}>
                <OsIcon s={S} os={data.os} />
                <span style={{ fontSize: `${6 * S}px`, color: "#6b7280" }}>
                  {OS_SHORT[data.os] ?? data.os}
                </span>
              </div>
            )}
          </div>

          {/* ─ Séparateur ─ */}
          <div style={{ width: `${S}px`, height: `${24 * MM * S}px`, background: "#e5e7eb", flexShrink: 0 }} />

          {/* ─ Colonne RAM ─ */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            justifyContent: "center",
            gap:           `${2.5 * S}px`,
          }}>
            <RamIcon s={S} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: `${15 * S}px`, fontWeight: "800", color: "#111827", lineHeight: "1" }}>
                {data.ramSize}
                <span style={{ fontSize: `${9 * S}px`, fontWeight: "600", color: "#6b7280" }}> Go</span>
              </div>
              <div style={{ fontSize: `${7 * S}px`, color: "#9ca3af", marginTop: `${1.5 * S}px` }}>
                {data.ramType}
              </div>
            </div>
          </div>

          {/* ─ Séparateur ─ */}
          <div style={{ width: `${S}px`, height: `${24 * MM * S}px`, background: "#e5e7eb", flexShrink: 0 }} />

          {/* ─ Colonne Stockage ─ */}
          <div style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            justifyContent: "center",
            gap:           `${2.5 * S}px`,
          }}>
            <StorageIcon s={S} type={data.storageType} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: `${15 * S}px`, fontWeight: "800", color: "#111827", lineHeight: "1" }}>
                {storageVal}
                <span style={{ fontSize: `${9 * S}px`, fontWeight: "600", color: "#6b7280" }}> {storageUnit}</span>
              </div>
              <div style={{ fontSize: `${7 * S}px`, color: "#9ca3af", marginTop: `${1.5 * S}px` }}>
                {STORAGE_SHORT[data.storageType] ?? data.storageType}
              </div>
            </div>
          </div>

        </div>

        <VSep x={PRICE_X} />

        {/* ══ ZONE PRIX — 149→176mm ══ */}
        <div style={{
          position:      "absolute",
          left:          `${PRICE_X * MM * S}px`,
          top: 0,
          width:         `${(QR_X - PRICE_X) * MM * S}px`,
          bottom:        0,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          justifyContent: "center",
          padding:       `${2 * S}px`,
          gap:           `${1.5 * S}px`,
          background:    "#f8fafc",
        }}>
          {data.priceOld && (
            <div style={{
              fontSize:       `${8 * S}px`,
              color:          "#9ca3af",
              textDecoration: "line-through",
              lineHeight:     "1",
            }}>
              {Number(data.priceOld).toFixed(0)} €
            </div>
          )}
          <div style={{
            fontSize:      `${20 * S}px`,
            fontWeight:    "900",
            color:         "#1d4ed8",
            lineHeight:    "1",
            letterSpacing: "-0.03em",
          }}>
            {Number(data.price).toFixed(0)}
            <span style={{ fontSize: `${12 * S}px`, fontWeight: "700" }}> €</span>
          </div>
          <div style={{ fontSize: `${5.5 * S}px`, color: "#9ca3af", letterSpacing: "0.08em" }}>
            TTC
          </div>
          <div style={{
            display:       "flex",
            alignItems:    "center",
            gap:           `${2 * S}px`,
            padding:       `${2 * S}px ${4 * S}px`,
            borderRadius:  `${3 * S}px`,
            background:    g.bg,
            color:         g.text,
            fontSize:      `${7.5 * S}px`,
            fontWeight:    "800",
            letterSpacing: "0.05em",
          }}>
            <span style={{
              width: `${7 * S}px`, height: `${7 * S}px`,
              borderRadius: "50%",
              background:   g.accent,
              display:      "inline-block",
              flexShrink:   0,
            }} />
            Grade {g.label}
          </div>
          <div style={{ fontSize: `${5.5 * S}px`, color: "#6b7280", fontWeight: "500" }}>
            {data.condition === "RECONDITIONNE" ? "Reconditionné"
             : data.condition === "NEUF" ? "Neuf" : "Occasion"}
          </div>
        </div>

        <VSep x={QR_X} />

        {/* ══ ZONE QR — 176→200mm ══ */}
        <div style={{
          position:      "absolute",
          left:          `${QR_X * MM * S}px`,
          top: 0, right: 0, bottom: 0,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          justifyContent: "center",
          background:    "#ffffff",
          padding:       `${3 * S}px`,
          gap:           `${1.5 * S}px`,
        }}>
          {qrUrl ? (
            <>
              <QRCode
                value={qrUrl}
                size={Math.round(20 * MM * S)}
                style={{ display: "block" }}
                bgColor="#ffffff"
                fgColor="#111827"
              />
              <div style={{
                fontSize:      `${4.5 * S}px`,
                color:         "#9ca3af",
                letterSpacing: "0.04em",
                textAlign:     "center",
              }}>
                Infos en ligne
              </div>
            </>
          ) : (
            <div style={{
              width:        `${20 * MM * S}px`,
              height:       `${20 * MM * S}px`,
              background:   "#f3f4f6",
              borderRadius: `${2 * S}px`,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: `${5 * S}px`, color: "#9ca3af" }}>QR</span>
            </div>
          )}
        </div>

      </div>
    );
  }
);

LabelPreview.displayName = "LabelPreview";
