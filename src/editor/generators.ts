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

export function generateQRCodeDataURL(text: string): string {
  const canvas = document.createElement("canvas");
  const size = 300;
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  
  // Fundo Branco
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  
  // Padrão de QR Code (Simulado para Mockup Profissional)
  ctx.fillStyle = "#000";
  const padding = 30;
  const dotSize = 8;
  const effectiveSize = size - padding * 2;
  
  // 3 Quadrados de posicionamento
  const drawPosSquare = (x: number, y: number) => {
    ctx.fillRect(x, y, 56, 56);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 8, y + 8, 40, 40);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 16, y + 16, 24, 24);
  };
  
  drawPosSquare(padding, padding);
  drawPosSquare(size - padding - 56, padding);
  drawPosSquare(padding, size - padding - 56);
  
  // Dots aleatórios para parecer um QR real
  for (let i = 0; i < effectiveSize; i += dotSize) {
    for (let j = 0; j < effectiveSize; j += dotSize) {
      // Pular áreas dos quadrados de posicionamento
      if ((i < 64 && j < 64) || (i > effectiveSize - 64 && j < 64) || (i < 64 && j > effectiveSize - 64)) continue;
      if (Math.random() > 0.5) {
        ctx.fillRect(padding + i, padding + j, dotSize - 1, dotSize - 1);
      }
    }
  }
  
  return canvas.toDataURL("image/png");
}

// Reference values for VD calculation (Brazilian ANVISA)
const VD_REFERENCES: Record<string, number> = {
  "Energia": 2000, "Carboidratos": 300, "Açúcares": 50, "Proteínas": 50,
  "Gorduras Totais": 55, "Gorduras Saturadas": 22, "Fibra": 25, "Sódio": 2400,
  "Vitamina C": 45, "Vitamina D": 5, "Vitamina B12": 2.4, "Zinco": 7, "Cálcio": 1000,
};

export function calculateVD(name: string, valueStr: string): string {
  const val = parseFloat(valueStr.replace(/[^\d.,]/g, "").replace(",", "."));
  if (isNaN(val)) return "—";
  const ref = VD_REFERENCES[name] || VD_REFERENCES[Object.keys(VD_REFERENCES).find(k => name.includes(k)) || ""];
  if (!ref) return "—";
  return Math.round((val / ref) * 100) + "%";
}

export function generateNutritionTableSVG(
  data: any,
  opts: { tableStyle?: "standard" | "detailed" } = {}
): { src: string; width: number; height: number } {
  const w = 460;
  const ROW = 26;
  const headerH = 70;
  const colsH = 30;
  const footerH = 60;
  const nutrients = data.nutrients ?? [];
  const h = headerH + colsH + nutrients.length * ROW + footerH + 20;

  const col2 = opts.tableStyle === "detailed";
  const c1W = col2 ? 180 : 280;

  let rows = "";
  nutrients.forEach((n: any, i: number) => {
    const bg = i % 2 === 0 ? "#fff" : "#f8f8f8";
    const vdValue = calculateVD(n.name, n.perServing);
    rows += `
    <rect x="0" y="${headerH + colsH + i * ROW}" width="${w}" height="${ROW}" fill="${bg}"/>
    <text x="8" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" fill="#111" font-weight="${n.name.toUpperCase() === n.name ? 'bold' : 'normal'}">${n.name}</text>
    <text x="${c1W + 8}" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" text-anchor="middle" fill="#111">${n.perServing}</text>
    ${col2 ? `<text x="${c1W + 100}" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" text-anchor="middle" fill="#111">${n.per100g ?? "—"}</text>` : ""}
    <line x1="0" y1="${headerH + colsH + i * ROW}" x2="${w}" y2="${headerH + colsH + i * ROW}" stroke="#ddd" stroke-width="0.5"/>
    <text x="${w - 8}" y="${headerH + colsH + i * ROW + 18}" font-family="Arial" font-size="10" text-anchor="end" fill="#111" font-weight="bold">${vdValue}</text>`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="#fff" rx="0"/>
  <rect width="${w}" height="4" fill="#000"/>
  <text x="${w / 2}" y="26" font-family="Arial Black,Arial" font-size="16" font-weight="900" text-anchor="middle" fill="#000">TABELA NUTRICIONAL</text>
  <text x="8" y="44" font-family="Arial" font-size="10" fill="#000">Porções por embalagem: ${data.servingsPerPackage ?? "—"}</text>
  <text x="8" y="60" font-family="Arial" font-size="10" fill="#000">Porção: ${data.servingSize ?? "—"}</text>
  <rect x="0" y="${headerH}" width="${w}" height="${colsH}" fill="#000"/>
  <text x="8" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" fill="#fff">Informações por porção</text>
  <text x="${c1W + 8}" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" text-anchor="middle" fill="#fff">Qtd/Porção</text>
  ${col2 ? `<text x="${c1W + 100}" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" text-anchor="middle" fill="#fff">100g/mL</text>` : ""}
  <text x="${w - 8}" y="${headerH + 20}" font-family="Arial" font-size="9" font-weight="bold" text-anchor="end" fill="#fff">%VD*</text>
  ${rows}
  <rect x="0" y="${headerH + colsH + nutrients.length * ROW}" width="${w}" height="2" fill="#000"/>
  <text x="8" y="${headerH + colsH + nutrients.length * ROW + 18}" font-family="Arial" font-size="8" fill="#111" font-weight="bold">*Percentual de valores diários fornecidos pela porção.</text>
  <text x="8" y="${headerH + colsH + nutrients.length * ROW + 32}" font-family="Arial" font-size="8" fill="#555" font-style="italic">Baseado em uma dieta de 2000 kcal ou 8400 kJ.</text>
  <text x="8" y="${headerH + colsH + nutrients.length * ROW + 46}" font-family="Arial" font-size="8" fill="#555" font-style="italic">Seus valores diários podem ser maiores ou menores conforme suas necessidades.</text>
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
