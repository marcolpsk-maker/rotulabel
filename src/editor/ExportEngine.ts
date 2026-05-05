/**
 * ExportEngine — Motor de exportação do Rotulabel
 * 
 * Suporte:
 *   - PNG 300 DPI (pixelRatio correto)
 *   - PDF com crop marks + bleed 3mm (para gráficas)
 *   - JPG
 * 
 * Usa Konva Stage diretamente para evitar html2canvas.
 */
import jsPDF from "jspdf";
import Konva from "konva";

const SCREEN_DPI = 72;
const PRINT_DPI  = 300;
const RATIO_300  = PRINT_DPI / SCREEN_DPI; // ≈ 4.167

export interface ExportOptions {
  format: "pdf" | "png" | "jpg";
  dpi?: number;            // default 300
  bleedMm?: number;        // default 3 (bleed em mm)
  cropMarks?: boolean;     // default true
  cmykHint?: boolean;      // aviso apenas, não converte
  quality?: number;        // 0-1, para JPG
}

/**
 * Exporta para PNG em alta resolução
 */
export async function exportToPNG(
  stage: Konva.Stage,
  options: { dpi?: number; quality?: number } = {}
): Promise<void> {
  const ratio = (options.dpi ?? PRINT_DPI) / SCREEN_DPI;
  const dataUrl = stage.toDataURL({ pixelRatio: ratio, mimeType: "image/png" });
  downloadDataURL(dataUrl, "rotulabel_300dpi.png");
}

/**
 * Exporta para JPG em alta resolução
 */
export async function exportToJPG(
  stage: Konva.Stage,
  options: { dpi?: number; quality?: number } = {}
): Promise<void> {
  const ratio = (options.dpi ?? PRINT_DPI) / SCREEN_DPI;
  const q = options.quality ?? 0.95;
  const dataUrl = stage.toDataURL({ pixelRatio: ratio, mimeType: "image/jpeg", quality: q });
  downloadDataURL(dataUrl, "rotulabel_300dpi.jpg");
}

/**
 * Exporta para PDF com crop marks e bleed para gráficas
 *
 * Convenção gráfica:
 *   - Bleed: 3mm extra em cada lado (imagem extrapolada)
 *   - Crop marks: linhas de 5mm além do bleed, gap de 3mm do bleed
 *   - Formato final do PDF = tamanho do rótulo + 2*bleed + margens de marca
 */
export async function exportToPDF(
  stage: Konva.Stage,
  canvasWidthPx: number,
  canvasHeightPx: number,
  options: ExportOptions = {}
): Promise<void> {
  const {
    dpi = PRINT_DPI,
    bleedMm = 3,
    cropMarks = true,
    quality = 0.98,
  } = options;

  const ratio = dpi / SCREEN_DPI;

  // 1. Capturar canvas em alta resolução
  const imgDataUrl = stage.toDataURL({ pixelRatio: ratio, mimeType: "image/jpeg", quality });

  // 2. Calcular dimensões em mm (px → mm, assumindo 96dpi de tela)
  // PX_PER_CM = 37.795, então 1px = 25.4/96 mm
  const pxToMm = (px: number) => (px * 25.4) / 96;

  const labelW_mm = pxToMm(canvasWidthPx);
  const labelH_mm = pxToMm(canvasHeightPx);
  const bleed = bleedMm;
  const markGap = bleed;       // gap entre fim do bleed e início da marca
  const markLen = 5;           // comprimento da marca de corte em mm

  // Área total do PDF
  const pdfW = labelW_mm + bleed * 2 + (cropMarks ? (markGap + markLen) * 2 : 0);
  const pdfH = labelH_mm + bleed * 2 + (cropMarks ? (markGap + markLen) * 2 : 0);

  // Offset: onde a imagem começa (inclui mark+gap + bleed)
  const imgOffsetX = cropMarks ? markLen + markGap : 0;
  const imgOffsetY = cropMarks ? markLen + markGap : 0;

  // 3. Criar PDF
  const pdf = new jsPDF({
    orientation: pdfW > pdfH ? "landscape" : "portrait",
    unit: "mm",
    format: [pdfW, pdfH],
    compress: true,
  });

  // 4. Inserir imagem (com bleed já embutido na imagem Konva)
  //    A imagem cobre labelW + bleed em cada lado
  const imgX = imgOffsetX;
  const imgY = imgOffsetY;
  const imgW = labelW_mm + bleed * 2;
  const imgH = labelH_mm + bleed * 2;

  pdf.addImage(imgDataUrl, "JPEG", imgX, imgY, imgW, imgH, undefined, "FAST");

  // 5. Crop marks
  if (cropMarks) {
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.25);

    // Posições das quinas do rótulo real (sem bleed)
    const left   = imgOffsetX + bleed;
    const right  = left + labelW_mm;
    const top    = imgOffsetY + bleed;
    const bottom = top + labelH_mm;

    // ── Marcas horizontais (superior esquerda)
    pdf.line(imgOffsetX - markGap - markLen, top, imgOffsetX - markGap, top);
    // superior direita
    pdf.line(right + markGap, top, right + markGap + markLen, top);
    // inferior esquerda
    pdf.line(imgOffsetX - markGap - markLen, bottom, imgOffsetX - markGap, bottom);
    // inferior direita
    pdf.line(right + markGap, bottom, right + markGap + markLen, bottom);

    // ── Marcas verticais (superior esquerda)
    pdf.line(left, imgOffsetY - markGap - markLen, left, imgOffsetY - markGap);
    // superior direita
    pdf.line(right, imgOffsetY - markGap - markLen, right, imgOffsetY - markGap);
    // inferior esquerda
    pdf.line(left, bottom + markGap, left, bottom + markGap + markLen);
    // inferior direita
    pdf.line(right, bottom + markGap, right, bottom + markGap + markLen);

    // Dimensões do rótulo (texto informativo)
    pdf.setFontSize(5);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `${labelW_mm.toFixed(1)} × ${labelH_mm.toFixed(1)} mm  |  Bleed: ${bleedMm}mm  |  ${dpi}dpi`,
      imgOffsetX, pdfH - 1.5
    );
  }

  // 6. Metadados do PDF
  pdf.setProperties({
    title: "Rotulabel Export",
    creator: "Rotulabel Studio",
    subject: `Rótulo ${labelW_mm.toFixed(0)}x${labelH_mm.toFixed(0)}mm`,
  });

  pdf.save("rotulabel_grafica.pdf");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/**
 * Gera thumbnail JPEG em baixa resolução para salvar como preview
 */
export function generateThumbnail(stage: Konva.Stage): string | undefined {
  try {
    return stage.toDataURL({ pixelRatio: 0.4, mimeType: "image/jpeg", quality: 0.75 });
  } catch {
    return undefined;
  }
}
