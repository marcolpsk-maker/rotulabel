import { newId } from "./types";
import type { AnyEl } from "./types";

// ─── Barcode (EAN-13 / CODE128) ─────────────────────────────────────────────
export function randomEAN13(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  const check = (10 - ((digits.reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0)) % 10)) % 10;
  return [...digits, check].join("");
}

export function generateBarcodeDataURL(code: string, format: "EAN13" | "CODE128" = "EAN13"): string {
  const canvas = document.createElement("canvas");
  const W = 400; const H = 160;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#000";

  const bars = code.split("").flatMap((c, i) => {
    const v = parseInt(c);
    return [Math.max(1, v % 3 + 1), Math.max(1, (v + i) % 2 + 1)];
  });
  const total = bars.reduce((s, b) => s + b, 0);
  const scale = (W * 0.85) / total;
  let x = W * 0.075;
  bars.forEach((w, i) => {
    if (i % 2 === 0) ctx.fillRect(Math.round(x), 10, Math.max(1, Math.round(w * scale)), H - 40);
    x += w * scale;
  });

  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText(code, W / 2, H - 4);
  return canvas.toDataURL("image/png");
}

// ─── Nutrition Table SVG ────────────────────────────────────────────────────
export interface NutritionSVGOptions {
  productName: string;
  brand: string;
  servingSize: string;
  servingsPerPackage: string;
  nutrients: { name: string; perServing: string; vd: string }[];
  per100g?: boolean;
  tableStyle?: "standard" | "detailed";
}

export function generateNutritionTableSVG(
  data: any,
  opts: { tableStyle?: "standard" | "detailed" } = {}
): { src: string; width: number; height: number } {
  const w = 460;
  const ROW = 26;
  const headerH = 70;
  const colsH = 30;
  const footerH = 50;
  const nutrients = data.nutrients ?? [];
  const h = headerH + colsH + nutrients.length * ROW + footerH + 20;

  const col2 = opts.tableStyle === "detailed";
  const c1W = col2 ? 200 : 280;

  let rows = "";
  nutrients.forEach((n: any, i: number) => {
    const bg = i % 2 === 0 ? "#fff" : "#f8f8f8";
    rows += `
    <rect x="0" y="${headerH + colsH + i * ROW}" width="${w}" height="${ROW}" fill="${bg}"/>
    <text x="8" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" fill="#111">${n.name}</text>
    <text x="${c1W + 8}" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" text-anchor="middle" fill="#111">${n.perServing}</text>
    ${col2 ? `<text x="${c1W + 80}" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" text-anchor="middle" fill="#111">${n.per100g ?? "—"}</text>` : ""}
    <line x1="0" y1="${headerH + colsH + i * ROW}" x2="${w}" y2="${headerH + colsH + i * ROW}" stroke="#ddd" stroke-width="0.5"/>
    <text x="${w - 8}" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" text-anchor="end" fill="#111">${n.vd}</text>`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#fff" rx="0"/>
  <rect width="${w}" height="4" fill="#000"/>
  <text x="${w / 2}" y="26" font-family="Arial Black,Arial" font-size="16" font-weight="900" text-anchor="middle" fill="#000">INFORMAÇÃO NUTRICIONAL</text>
  <text x="8" y="44" font-family="Arial" font-size="10" fill="#000">Porções por embalagem: ${data.servingsPerPackage ?? "—"}</text>
  <text x="8" y="60" font-family="Arial" font-size="10" fill="#000">Porção: ${data.servingSize ?? "—"}</text>
  <rect x="0" y="${headerH}" width="${w}" height="${colsH}" fill="#000"/>
  <text x="8" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" fill="#fff">Informações por porção</text>
  <text x="${c1W + 8}" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" text-anchor="middle" fill="#fff">${data.servingSize ?? "Porção"}</text>
  ${col2 ? `<text x="${c1W + 80}" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" text-anchor="middle" fill="#fff">100g/mL</text>` : ""}
  <text x="${w - 8}" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" text-anchor="end" fill="#fff">%VD*</text>
  ${rows}
  <rect x="0" y="${headerH + colsH + nutrients.length * ROW}" width="${w}" height="1" fill="#000"/>
  <text x="8" y="${headerH + colsH + nutrients.length * ROW + 18}" font-family="Arial" font-size="8" fill="#555" font-style="italic">*Percentual de valores diários fornecidos pela porção.</text>
  <text x="8" y="${headerH + colsH + nutrients.length * ROW + 34}" font-family="Arial" font-size="8" fill="#555" font-style="italic">Não contém quantidade significativa de outros nutrientes.</text>
</svg>`;

  const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
  return { src: encoded, width: w, height: h };
}

// ─── Pre-built text block generators for label zones ────────────────────────

export function generateWarningsBlock(
  warnings: string[],
  x: number, y: number,
  options: { color?: string; fontSize?: number; width?: number; fontFamily?: string } = {}
): AnyEl {
  return {
    id: newId(),
    type: "text",
    x, y,
    width: options.width ?? 220,
    height: warnings.length * (options.fontSize ?? 8) * 1.8 + 20,
    text: warnings.join("\n"),
    fontSize: options.fontSize ?? 8,
    fontFamily: options.fontFamily ?? "Arial",
    fontStyle: "normal",
    align: "left",
    fill: options.color ?? "#000000",
    letterSpacing: 0,
    lineHeight: 1.4,
  } as any;
}

export function generateUsageSuggestionBlock(
  suggestion: string,
  x: number, y: number,
  options: { width?: number; fontSize?: number; fontFamily?: string; color?: string } = {}
): AnyEl {
  return {
    id: newId(),
    type: "text",
    x, y,
    width: options.width ?? 200,
    height: 80,
    text: suggestion,
    fontSize: options.fontSize ?? 9,
    fontFamily: options.fontFamily ?? "Arial",
    fontStyle: "normal",
    align: "left",
    fill: options.color ?? "#000000",
    letterSpacing: 0,
    lineHeight: 1.4,
  } as any;
}

export function generateIngredientsBlock(
  ingredients: string,
  x: number, y: number,
  options: { width?: number; fontSize?: number; fontFamily?: string; color?: string } = {}
): AnyEl {
  return {
    id: newId(),
    type: "text",
    x, y,
    width: options.width ?? 220,
    height: 100,
    text: `INGREDIENTES: ${ingredients}`,
    fontSize: options.fontSize ?? 8,
    fontFamily: options.fontFamily ?? "Arial",
    fontStyle: "normal",
    align: "left",
    fill: options.color ?? "#000000",
    letterSpacing: 0,
    lineHeight: 1.3,
  } as any;
}

export function generateCompanyFooterBlock(
  company: { fabricante?: string; distribuidor?: string; cnpj?: string; address?: string; sac?: string; website?: string; responsavel_tecnico?: string; crf?: string },
  x: number, y: number,
  options: { width?: number; fontSize?: number; color?: string } = {}
): AnyEl {
  const lines: string[] = [];
  if (company.fabricante) lines.push(`FABRICADO POR: ${company.fabricante}`);
  if (company.distribuidor) lines.push(`DISTRIBUÍDO POR: ${company.distribuidor}`);
  if (company.cnpj) lines.push(`CNPJ: ${company.cnpj}`);
  if (company.address) lines.push(company.address);
  if (company.sac) lines.push(`SAC: ${company.sac}`);
  if (company.website) lines.push(company.website);
  if (company.responsavel_tecnico && company.crf) lines.push(`${company.responsavel_tecnico} - CRF ${company.crf}`);

  return {
    id: newId(),
    type: "text",
    x, y,
    width: options.width ?? 200,
    height: lines.length * (options.fontSize ?? 7) * 1.6 + 10,
    text: lines.join("\n"),
    fontSize: options.fontSize ?? 7,
    fontFamily: "Arial",
    fontStyle: "normal",
    align: "left",
    fill: options.color ?? "#000000",
    letterSpacing: 0,
    lineHeight: 1.4,
  } as any;
}
