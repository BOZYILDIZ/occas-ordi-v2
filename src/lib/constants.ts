// ─────────────────────────────────────────────
// CHOIX PRÉDÉFINIS DU FORMULAIRE
// Source unique de vérité — utilisé par le form ET l'API
// ─────────────────────────────────────────────

export const COMPUTER_TYPES = [
  { value: "DESKTOP",     label: "Tour / Desktop" },
  { value: "LAPTOP",      label: "Laptop / Portable" },
  { value: "ALL_IN_ONE",  label: "All-in-One" },
  { value: "MINI_PC",     label: "Mini PC" },
  { value: "WORKSTATION", label: "Workstation" },
] as const;

export const CPU_BRANDS = [
  { value: "INTEL", label: "Intel" },
  { value: "AMD",   label: "AMD" },
  { value: "APPLE", label: "Apple" },
] as const;

// Modèles CPU organisés par marque
export const CPU_MODELS: Record<string, { value: string; label: string }[]> = {
  INTEL: [
    { value: "Core i3-10100",  label: "Core i3-10100" },
    { value: "Core i5-8400",   label: "Core i5-8400" },
    { value: "Core i5-10400",  label: "Core i5-10400" },
    { value: "Core i5-12400",  label: "Core i5-12400" },
    { value: "Core i7-8700",   label: "Core i7-8700" },
    { value: "Core i7-10700",  label: "Core i7-10700" },
    { value: "Core i7-12700",  label: "Core i7-12700" },
    { value: "Core i9-12900",  label: "Core i9-12900" },
    { value: "Autre Intel",    label: "Autre Intel" },
  ],
  AMD: [
    { value: "Ryzen 3 3200G", label: "Ryzen 3 3200G" },
    { value: "Ryzen 5 3600",  label: "Ryzen 5 3600" },
    { value: "Ryzen 5 5600",  label: "Ryzen 5 5600" },
    { value: "Ryzen 7 3700X", label: "Ryzen 7 3700X" },
    { value: "Ryzen 7 5800X", label: "Ryzen 7 5800X" },
    { value: "Ryzen 9 5900X", label: "Ryzen 9 5900X" },
    { value: "Autre AMD",     label: "Autre AMD" },
  ],
  APPLE: [
    { value: "M1",      label: "Apple M1" },
    { value: "M1 Pro",  label: "Apple M1 Pro" },
    { value: "M1 Max",  label: "Apple M1 Max" },
    { value: "M2",      label: "Apple M2" },
    { value: "M2 Pro",  label: "Apple M2 Pro" },
    { value: "M3",      label: "Apple M3" },
    { value: "Autre Apple", label: "Autre Apple" },
  ],
};

export const RAM_SIZES = [
  { value: 4,   label: "4 Go" },
  { value: 8,   label: "8 Go" },
  { value: 16,  label: "16 Go" },
  { value: 32,  label: "32 Go" },
  { value: 64,  label: "64 Go" },
  { value: 128, label: "128 Go" },
] as const;

export const RAM_TYPES = [
  { value: "DDR3",    label: "DDR3" },
  { value: "DDR4",    label: "DDR4" },
  { value: "DDR5",    label: "DDR5" },
  { value: "LPDDR4",  label: "LPDDR4" },
  { value: "LPDDR5",  label: "LPDDR5" },
  { value: "UNIFIED", label: "Unifié (Apple)" },
] as const;

export const STORAGE_SIZES = [
  { value: 128,  label: "128 Go" },
  { value: 256,  label: "256 Go" },
  { value: 512,  label: "512 Go" },
  { value: 1000, label: "1 To" },
  { value: 2000, label: "2 To" },
  { value: 4000, label: "4 To" },
] as const;

export const STORAGE_TYPES = [
  { value: "HDD",      label: "HDD" },
  { value: "SSD_SATA", label: "SSD SATA" },
  { value: "SSD_NVME", label: "SSD NVMe" },
  { value: "EMMC",     label: "eMMC" },
] as const;

export const CONDITIONS = [
  { value: "NEUF",          label: "Neuf" },
  { value: "RECONDITIONNE", label: "Reconditionné" },
  { value: "OCCASION",      label: "Occasion" },
] as const;

export const GRADES = [
  { value: "A_PLUS", label: "A+ — Comme neuf, aucun défaut" },
  { value: "A",      label: "A  — Très bon état, traces légères" },
  { value: "B",      label: "B  — Bon état, quelques marques" },
  { value: "C",      label: "C  — Fonctionnel, marques visibles" },
] as const;

export const OS_TYPES = [
  { value: "WINDOWS_11",     label: "Windows 11 Home" },
  { value: "WINDOWS_11_PRO", label: "Windows 11 Pro" },
  { value: "WINDOWS_10",     label: "Windows 10 Home" },
  { value: "WINDOWS_10_PRO", label: "Windows 10 Pro" },
  { value: "MACOS",          label: "macOS" },
  { value: "LINUX",          label: "Linux" },
  { value: "SANS_OS",        label: "Sans OS" },
] as const;

// Marques d'appareils (pour filtres public)
export const DEVICE_BRANDS = [
  "Apple", "HP", "Lenovo", "Dell", "Acer", "Asus", "MSI",
  "Samsung", "Microsoft", "Toshiba", "Autre",
] as const;

// ─── LABEL — gabarit 200mm x 35mm ───────────
export const LABEL_DIMENSIONS = {
  widthMm:  200,
  heightMm: 35,
  // positions par défaut (mm depuis haut-gauche)
  zones: {
    sku:     { x: 5,   y: 4  },
    cpu:     { x: 5,   y: 14 },
    ram:     { x: 72,  y: 14 },
    storage: { x: 120, y: 14 },
    price:   { x: 155, y: 8  },
    grade:   { x: 5,   y: 26 },
  },
} as const;
