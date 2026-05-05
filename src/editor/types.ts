// Editor types & helpers
export type ElementType = "text" | "rect" | "circle" | "line" | "image" | "barcode" | "nutrition" | "qrcode";

export interface BaseEl {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // Gradient fill — multi-stop Konva-compatible
  gradient?: {
    type: "linear" | "radial";
    colorStops: { offset: number; color: string }[]; // offset: 0.0–1.0
    angle?: number; // degrees, for linear
  } | null;
  // Shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // Corner radius (for rects)
  cornerRadius?: number;
  // Zone hint (for layout guides only)
  zone?: "left" | "center" | "right" | "footer" | null;
  locked?: boolean;
}

export interface TextEl extends BaseEl {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle?: "normal" | "bold" | "italic" | "bold italic";
  fontWeight?: number; // 100 | 200 | ... | 900
  align?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  textDecoration?: "none" | "underline";
  upperCase?: boolean;
}

export interface RectEl extends BaseEl {
  type: "rect";
}

export interface CircleEl extends BaseEl {
  type: "circle";
}

export interface LineEl extends BaseEl {
  type: "line";
}

export interface ImageEl extends BaseEl {
  type: "image";
  src: string;
}

export interface BarcodeEl extends BaseEl {
  type: "barcode";
  code: string;
  src: string;
}

export interface NutritionEl extends BaseEl {
  type: "nutrition";
  data: NutritionData;
  src: string;
}

export interface NutritionData {
  productName: string;
  brand: string;
  quantity: string;
  servingSize: string;
  servingsPerPackage: string;
  ingredients: string;
  warnings: string[];
  nutrients: { name: string; perServing: string; vd: string }[];
  // Extra columns for 2-column nutrition tables
  per100g?: string;
}

export type AnyEl = TextEl | RectEl | CircleEl | LineEl | ImageEl | BarcodeEl | NutritionEl;

// Print constants
export const PX_PER_CM = 37.795; // ~96 dpi screen
export const PRINT_DPI = 300;
export const PRINT_PX_PER_CM = PRINT_DPI / 2.54;
export const SNAP_GRID = 5; // px snap-to-grid size

export const newId = () => Math.random().toString(36).slice(2, 10);

// Default gradient presets
export const GRADIENT_PRESETS: { name: string; gradient: NonNullable<import('./types').BaseEl['gradient']> }[] = [
  { name: "Roxo → Ciano",  gradient: { type: "linear", angle: 135, colorStops: [{ offset: 0, color: "#7c3aed" }, { offset: 1, color: "#06b6d4" }] } },
  { name: "Gold Premium",  gradient: { type: "linear", angle: 135, colorStops: [{ offset: 0, color: "#1c1009" }, { offset: 0.5, color: "#b45309" }, { offset: 1, color: "#fbbf24" }] } },
  { name: "Verde Natura",  gradient: { type: "linear", angle: 135, colorStops: [{ offset: 0, color: "#0a3d2e" }, { offset: 1, color: "#1f7a4d" }] } },
  { name: "Fogo Thermo",   gradient: { type: "linear", angle: 90,  colorStops: [{ offset: 0, color: "#7f1d1d" }, { offset: 0.5, color: "#dc2626" }, { offset: 1, color: "#f97316" }] } },
  { name: "Radial Dark",   gradient: { type: "radial",              colorStops: [{ offset: 0, color: "#1a1f3a" }, { offset: 1, color: "#0a0a14" }] } },
  { name: "Radial Gold",   gradient: { type: "radial",              colorStops: [{ offset: 0, color: "#fbbf24" }, { offset: 1, color: "#1c1009" }] } },
];

// Preset label sizes (cm)
export const LABEL_SIZES = [
  { label: "Pote/Frasco 15×5cm", width: 15, height: 5 },
  { label: "Caixa pequena 10×7cm", width: 10, height: 7 },
  { label: "Caixa média 20×7cm", width: 20, height: 7 },
  { label: "Sachê 8×12cm", width: 8, height: 12 },
  { label: "Frasco vertical 7×12cm", width: 7, height: 12 },
  { label: "Banner largo 30×10cm", width: 30, height: 10 },
  { label: "Custom", width: 0, height: 0 },
];

// Preset color palettes
export const COLOR_PALETTES = [
  { name: "Nutrit Dark", colors: ["#0a0a14", "#1a1f3a", "#7c3aed", "#06b6d4"] },
  { name: "Nature Green", colors: ["#0a3d2e", "#1f7a4d", "#a3e635", "#f0fdf4"] },
  { name: "Energy Red", colors: ["#1a0e0e", "#f97316", "#fbbf24", "#fef3c7"] },
  { name: "Premium Gold", colors: ["#1c1009", "#b45309", "#f59e0b", "#fef3c7"] },
  { name: "Clean White", colors: ["#ffffff", "#f1f5f9", "#0f172a", "#6366f1"] },
  { name: "Ocean Blue", colors: ["#082f49", "#0369a1", "#38bdf8", "#e0f2fe"] },
  { name: "Berry Purple", colors: ["#1a0533", "#7c3aed", "#c084fc", "#faf5ff"] },
  { name: "Fitness Black", colors: ["#000000", "#18181b", "#ef4444", "#ffffff"] },
];

// Mandatory warnings for Brazilian supplements (ANVISA RDC 240/2018)
export const MANDATORY_WARNINGS = [
  "ESTE PRODUTO NÃO É UM MEDICAMENTO.",
  "NÃO EXCEDER A RECOMENDAÇÃO DIÁRIA DE CONSUMO.",
  "MANTENHA FORA DO ALCANCE DE CRIANÇAS.",
  "ESTE PRODUTO NÃO DEVE SER CONSUMIDO POR GESTANTES, LACTANTES E CRIANÇAS.",
  "CONSERVAR EM LOCAL SECO, FRESCO E AO ABRIGO DA LUZ.",
  "DISPENSADO DE REGISTRO CONFORME RDC n° 240, DE 26 DE JULHO DE 2018.",
  "VALIDADE E LOTE VIDE O FRASCO.",
];

// Mandatory shelf-life and storage warnings
export const STORAGE_WARNINGS = [
  "INSTRUÇÕES DE CONSERVAÇÃO DO PRODUTO LACRADO E APÓS ABERTO: Conservar em temperatura ambiente (15 a 30°C). Proteger do calor e da umidade.",
  "Após aberto, consumir em até 30 dias.",
  "Após aberto, consumir em até 60 dias.",
  "Após aberto, consumir em até 90 dias.",
];

// Preset font pairs for labels
export const FONT_PAIRS = [
  { display: "Plus Jakarta + Inter", heading: "Plus Jakarta Sans", body: "Inter" },
  { display: "Bebas + Roboto", heading: "Bebas Neue", body: "Roboto" },
  { display: "Oswald + Poppins", heading: "Oswald", body: "Poppins" },
  { display: "Montserrat + Montserrat", heading: "Montserrat", body: "Montserrat" },
  { display: "Playfair + Lato", heading: "Playfair Display", body: "Lato" },
];

// All available fonts
export const ALL_FONTS = [
  "Inter", "Roboto", "Lato", "Poppins", "Open Sans",
  "Montserrat", "Oswald", "Raleway", "Nunito",
  "Plus Jakarta Sans", "Bebas Neue", "Playfair Display",
  "Orbitron", "Exo 2", "Barlow Condensed",
];
