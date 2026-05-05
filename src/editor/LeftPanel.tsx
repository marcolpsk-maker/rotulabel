import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Layout, BadgeCheck, Palette, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ALL_FONTS, COLOR_PALETTES, newId } from "./types";
import { generateBarcodeDataURL, randomEAN13 } from "./generators";

// ─── Gradient presets ─────────────────────────────────────────────────────────
const GRADIENTS = [
  { name: "Preto Fundo",    c1: "#0a0a14", c2: "#1a1f3a", css: "linear-gradient(135deg,#0a0a14,#1a1f3a)" },
  { name: "Verde Natura",   c1: "#0a3d2e", c2: "#1f7a4d", css: "linear-gradient(135deg,#0a3d2e,#1f7a4d)" },
  { name: "Termogênico",    c1: "#1a0e0e", c2: "#c2410c", css: "linear-gradient(135deg,#1a0e0e,#c2410c)" },
  { name: "Gold Premium",   c1: "#1c1009", c2: "#b45309", css: "linear-gradient(135deg,#1c1009,#b45309)" },
  { name: "Roxo Elite",     c1: "#1a0533", c2: "#7c3aed", css: "linear-gradient(135deg,#1a0533,#7c3aed)" },
  { name: "Ocean Blue",     c1: "#082f49", c2: "#0369a1", css: "linear-gradient(135deg,#082f49,#0369a1)" },
  { name: "Rosa Neon",      c1: "#4a0020", c2: "#be185d", css: "linear-gradient(135deg,#4a0020,#be185d)" },
  { name: "Prata Metal",    c1: "#1e293b", c2: "#475569", css: "linear-gradient(135deg,#1e293b,#475569)" },
  { name: "Branco Clean",   c1: "#f8fafc", c2: "#e2e8f0", css: "linear-gradient(135deg,#f8fafc,#e2e8f0)" },
  { name: "Amarelo Power",  c1: "#451a03", c2: "#d97706", css: "linear-gradient(135deg,#451a03,#d97706)" },
  { name: "Ciano Cyber",    c1: "#0c1a2e", c2: "#06b6d4", css: "linear-gradient(135deg,#0c1a2e,#06b6d4)" },
  { name: "Esmeralda",      c1: "#052e16", c2: "#16a34a", css: "linear-gradient(135deg,#052e16,#16a34a)" },
];

const SOLID_COLORS = [
  "#000000","#0f172a","#1e293b","#374151","#64748b","#ffffff",
  "#7c3aed","#6366f1","#2563eb","#0ea5e9","#06b6d4","#14b8a6",
  "#10b981","#84cc16","#f59e0b","#f97316","#ef4444","#ec4899",
];

// ─── Templates ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  { name: "Premium Dark",   bg: ["#0a0a14","#1a1f3a"], title: "PREMIUM",   sub: "SUPLEMENTO ALIMENTAR" },
  { name: "Verde Nutri",    bg: ["#0a3d2e","#1f7a4d"], title: "NATURAL",   sub: "SUPLEMENTO ALIMENTAR" },
  { name: "Thermogenic",    bg: ["#1a0e0e","#c2410c"], title: "THERMO",    sub: "ALTO DESEMPENHO" },
  { name: "Gold Power",     bg: ["#1c1009","#b45309"], title: "POWER",     sub: "SUPLEMENTO ALIMENTAR" },
  { name: "Roxo Elite",     bg: ["#1a0533","#7c3aed"], title: "ELITE",     sub: "FÓRMULA AVANÇADA" },
  { name: "Ocean Sport",    bg: ["#082f49","#0369a1"], title: "SPORT",     sub: "SUPLEMENTO ALIMENTAR" },
  { name: "Branco Clean",   bg: ["#f8fafc","#e2e8f0"], title: "CLEAN",     sub: "SUPLEMENTO ALIMENTAR" },
  { name: "Rosa Beauty",    bg: ["#4a0020","#be185d"], title: "BEAUTY",    sub: "SUPLEMENTO FEMININO" },
];

// ─── Shapes ──────────────────────────────────────────────────────────────────
const SHAPES = [
  { label: "Retângulo",  type: "rect",   icon: "▬", defaultProps: { width: 200, height: 80,  fill: "#7c3aed", cornerRadius: 0 } },
  { label: "Retâng. Arredondado", type: "rect", icon: "▣", defaultProps: { width: 200, height: 80, fill: "#7c3aed", cornerRadius: 16 } },
  { label: "Círculo",    type: "circle", icon: "●", defaultProps: { width: 100, height: 100, fill: "#06b6d4" } },
  { label: "Elipse",     type: "circle", icon: "⬭", defaultProps: { width: 200, height: 80,  fill: "#10b981" } },
  { label: "Linha H",    type: "line",   icon: "—", defaultProps: { width: 300, height: 2,   stroke: "#ffffff", strokeWidth: 2 } },
  { label: "Linha V",    type: "line",   icon: "│", defaultProps: { width: 2,   height: 200, stroke: "#ffffff", strokeWidth: 2 } },
  { label: "Linha Grossa", type: "line", icon: "━", defaultProps: { width: 300, height: 6,   stroke: "#7c3aed", strokeWidth: 6 } },
  { label: "Quadrado",   type: "rect",   icon: "■", defaultProps: { width: 100, height: 100, fill: "#f59e0b", cornerRadius: 0 } },
];

// ─── Text presets ─────────────────────────────────────────────────────────────
const TEXT_PRESETS = [
  { label: "TÍTULO PRINCIPAL",  fontSize: 0.28, font: "Bebas Neue",       ls: 6, style: "normal",    text: "PRODUTO" },
  { label: "Nome do Produto",   fontSize: 0.20, font: "Plus Jakarta Sans", ls: 2, style: "bold",     text: "Nome do Produto" },
  { label: "Subtítulo",         fontSize: 0.12, font: "Montserrat",        ls: 4, style: "bold",     text: "SUBTÍTULO" },
  { label: "Corpo de texto",    fontSize: 0.07, font: "Inter",             ls: 0, style: "normal",   text: "Texto de descrição" },
  { label: "Oswald Display",    fontSize: 0.22, font: "Oswald",            ls: 2, style: "bold",     text: "FORÇA" },
  { label: "Orbitron Tech",     fontSize: 0.16, font: "Orbitron",          ls: 3, style: "bold",     text: "TECH SPORT" },
  { label: "Barlow Condensed",  fontSize: 0.18, font: "Barlow Condensed",  ls: 2, style: "bold",     text: "PERFORMANCE" },
  { label: "Raleway Elegante",  fontSize: 0.14, font: "Raleway",           ls: 4, style: "bold",     text: "ELEGÂNCIA" },
  { label: "Playfair Premium",  fontSize: 0.14, font: "Playfair Display",  ls: 1, style: "normal",   text: "Premium Quality" },
  { label: "Exo 2 Futurista",   fontSize: 0.16, font: "Exo 2",            ls: 3, style: "bold",     text: "FUTURISTA" },
];

const BADGES = [
  "100% PURE","SEM GLÚTEN","ZERO AÇÚCAR","VEGANO",
  "NATURAL","ORGÂNICO","SEM LACTOSE","HIGH PROTEIN",
  "IMPORTADO","LAB TESTED","KETO FRIENDLY","GLUTEN FREE",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2">{children}</p>;
}

// Helper: set drag data for HTML5 drag-to-canvas
function setDragData(e: React.DragEvent, type: string, data: Record<string, any>) {
  e.dataTransfer.effectAllowed = "copy";
  e.dataTransfer.setData("el-type", type);
  e.dataTransfer.setData("el-data", JSON.stringify(data));
}

export default function LeftPanel({ onAdd, onLoadTemplate, canvasW, canvasH }: {
  onAdd: (el: any) => void;
  onLoadTemplate: (els: any[]) => void;
  canvasW: number;
  canvasH: number;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (f: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from("label-assets").upload(path, f);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("label-assets").getPublicUrl(path);
    onAdd({ type: "image", src: data.publicUrl, id: newId(), x: 40, y: 40, width: 200, height: 200 });
    setUploading(false);
    toast.success("Imagem adicionada!");
  };

  const loadTemplate = (tpl: typeof TEMPLATES[0]) => {
    const w = canvasW, h = canvasH;
    const isDark = tpl.bg[0] !== "#f8fafc";
    const tc = isDark ? "#ffffff" : "#0f172a";
    onLoadTemplate([
      { id: newId(), type: "rect",   x: 0,       y: 0,       width: w,         height: h,         fill: tpl.bg[0], cornerRadius: 0 },
      { id: newId(), type: "circle", x: w*0.45,  y: -h*0.25, width: h*1.5,     height: h*1.5,     fill: tpl.bg[1], opacity: 0.65 },
      { id: newId(), type: "line",   x: w*0.285, y: h*0.04,  width: 2,         height: h*0.92,    fill: undefined, stroke: tc, strokeWidth: 1, opacity: 0.25 },
      { id: newId(), type: "line",   x: w*0.705, y: h*0.04,  width: 2,         height: h*0.92,    fill: undefined, stroke: tc, strokeWidth: 1, opacity: 0.25 },
      { id: newId(), type: "text",   x: w*0.30,  y: h*0.22,  width: w*0.40,    height: h*0.55,    text: tpl.title, fontSize: Math.round(h*0.32), fontFamily: "Bebas Neue", fontStyle: "normal", fill: tc, letterSpacing: 6, lineHeight: 1 },
      { id: newId(), type: "text",   x: w*0.30,  y: h*0.65,  width: w*0.40,    height: h*0.20,    text: tpl.sub,   fontSize: Math.round(h*0.075), fontFamily: "Montserrat", fontStyle: "bold", fill: tc, letterSpacing: 3, align: "center", opacity: 0.85 },
    ]);
  };

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col overflow-hidden">
      <Tabs defaultValue="templates" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 m-2 h-auto gap-0.5 p-1 bg-muted/50 shrink-0">
          <TabsTrigger value="templates" className="flex-col py-1.5 text-[9px] gap-0.5 h-auto data-[state=active]:bg-card">
            <Layout className="w-3.5 h-3.5"/>Layouts
          </TabsTrigger>
          <TabsTrigger value="elementos" className="flex-col py-1.5 text-[9px] gap-0.5 h-auto data-[state=active]:bg-card">
            <BadgeCheck className="w-3.5 h-3.5"/>Elementos
          </TabsTrigger>
          <TabsTrigger value="fundos" className="flex-col py-1.5 text-[9px] gap-0.5 h-auto data-[state=active]:bg-card">
            <Palette className="w-3.5 h-3.5"/>Fundos
          </TabsTrigger>
          <TabsTrigger value="imagens" className="flex-col py-1.5 text-[9px] gap-0.5 h-auto data-[state=active]:bg-card">
            <ImageIcon className="w-3.5 h-3.5"/>Imagens
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">

          {/* ── LAYOUTS / TEMPLATES ── */}
          <TabsContent value="templates" className="m-0 mt-3 space-y-5">
            <div>
              <SectionTitle>Modelos prontos</SectionTitle>
              <div className="space-y-2">
                {TEMPLATES.map(tpl => (
                  <button key={tpl.name} onClick={() => loadTemplate(tpl)}
                    className="group w-full h-14 rounded-xl overflow-hidden relative border border-border/40 hover:border-primary hover:ring-2 ring-primary/20 transition-all"
                    style={{ background: `linear-gradient(135deg,${tpl.bg[0]},${tpl.bg[1]})` }}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors"/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                      <span className="text-sm font-black text-white drop-shadow tracking-wider"
                        style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: 3 }}>
                        {tpl.title}
                      </span>
                      <span className="text-[8px] text-white/70 tracking-widest">{tpl.sub}</span>
                    </div>
                    <span className="absolute top-1.5 left-2.5 text-[9px] font-semibold text-white/60">{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>Ferramentas rápidas</SectionTitle>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => {
                  const code = randomEAN13();
                  const src = generateBarcodeDataURL(code);
                  onAdd({ id: newId(), type: "barcode", code, src, x: canvasW * 0.72, y: canvasH * 0.65, width: 200, height: 90 });
                }}>
                  <span className="text-base">▦</span>Gerar Código de Barras EAN-13
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── ELEMENTOS ── */}
          <TabsContent value="elementos" className="m-0 mt-3 space-y-5">

            {/* Typography */}
            <div>
              <SectionTitle>Tipografia — clique ou arraste para o canvas</SectionTitle>
              <div className="space-y-1.5">
                {TEXT_PRESETS.map(p => {
                  const elData = {
                    type: "text", x: canvasW * 0.29, y: canvasH * 0.3,
                    width: canvasW * 0.40, height: Math.round(canvasH * p.fontSize) * 1.8,
                    text: p.text, fontSize: Math.round(canvasH * p.fontSize),
                    fontFamily: p.font, fontStyle: p.style,
                    fill: "#ffffff", letterSpacing: p.ls, lineHeight: 1.2, align: "center",
                  };
                  return (
                    <button key={p.label}
                      draggable
                      onDragStart={e => setDragData(e, "text", elData)}
                      onClick={() => onAdd({ ...elData, id: newId() })}
                      className="w-full text-left px-3 py-2 rounded-lg border border-border/40 hover:border-primary hover:bg-primary/5 transition-all group cursor-grab active:cursor-grabbing">
                      <span className="text-[9px] text-muted-foreground group-hover:text-primary transition-colors block">{p.label}</span>
                      <span className="leading-tight text-foreground" style={{ fontFamily: p.font, fontSize: Math.max(11, Math.round(canvasH * p.fontSize * 0.55)) }}>
                        {p.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div>
              <SectionTitle>Selos e badges</SectionTitle>
              <div className="grid grid-cols-2 gap-1.5">
                {BADGES.map(b => {
                  const elData = { type: "text", text: b, x: 20, y: 20, width: 130, height: 28, fontSize: 10, fontFamily: "Montserrat", fontStyle: "bold", fill: "#ffffff", letterSpacing: 1, align: "center" };
                  return (
                    <button key={b}
                      draggable
                      onDragStart={e => setDragData(e, "text", elData)}
                      onClick={() => onAdd({ ...elData, id: newId() })}
                      className="px-2 py-2 text-[9px] font-black rounded-full bg-gradient-canva text-white hover:scale-105 active:scale-95 transition-transform tracking-wide truncate cursor-grab">
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shapes */}
            <div>
              <SectionTitle>Formas geométricas</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {SHAPES.map(s => {
                  const elData = { type: s.type, x: 40, y: 40, ...s.defaultProps };
                  return (
                    <button key={s.label}
                      draggable
                      onDragStart={e => setDragData(e, s.type, elData)}
                      onClick={() => onAdd({ ...elData, id: newId() })}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/40 hover:border-primary hover:bg-primary/5 transition-all group cursor-grab active:cursor-grabbing">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{s.icon}</span>
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font preview */}
            <div>
              <SectionTitle>Todas as fontes disponíveis</SectionTitle>
              <div className="space-y-1">
                {ALL_FONTS.map(f => (
                  <button key={f} onClick={() => onAdd({
                    id: newId(), type: "text", text: f,
                    x: canvasW * 0.29, y: canvasH * 0.4,
                    width: canvasW * 0.40, height: 60,
                    fontSize: Math.round(canvasH * 0.12), fontFamily: f, fontStyle: "normal",
                    fill: "#ffffff", letterSpacing: 1, lineHeight: 1.2, align: "center",
                  })}
                    className="w-full text-left px-3 py-1.5 rounded-lg border border-border/30 hover:border-primary/60 hover:bg-primary/5 transition-all">
                    <span style={{ fontFamily: f }} className="text-sm text-foreground">{f}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── FUNDOS ── */}
          <TabsContent value="fundos" className="m-0 mt-3 space-y-5">

            {/* Gradients */}
            <div>
              <SectionTitle>Gradientes profissionais</SectionTitle>
              <div className="space-y-2">
                {GRADIENTS.map(g => (
                  <button key={g.name} onClick={() => onAdd({
                    id: newId(), type: "rect", x: 0, y: 0,
                    width: canvasW, height: canvasH, fill: g.c1, cornerRadius: 0,
                  })}
                    className="group w-full h-11 rounded-xl border border-border/30 hover:border-primary hover:ring-2 ring-primary/20 transition-all relative overflow-hidden"
                    style={{ background: g.css }}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"/>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solid colors */}
            <div>
              <SectionTitle>Cores sólidas</SectionTitle>
              <div className="grid grid-cols-6 gap-1.5">
                {SOLID_COLORS.map(c => (
                  <button key={c} onClick={() => onAdd({
                    id: newId(), type: "rect", x: 0, y: 0,
                    width: canvasW, height: canvasH, fill: c, cornerRadius: 0,
                  })}
                    className="aspect-square rounded-lg border-2 border-border/30 hover:border-primary hover:scale-110 transition-all"
                    style={{ background: c }} title={c}/>
                ))}
              </div>
            </div>

            {/* Palettes */}
            <div>
              <SectionTitle>Paletas de cores</SectionTitle>
              {COLOR_PALETTES.map(p => (
                <div key={p.name} className="mb-3">
                  <p className="text-[9px] text-muted-foreground mb-1.5 font-medium">{p.name}</p>
                  <div className="flex gap-1 h-7">
                    {p.colors.map(c => (
                      <button key={c} onClick={() => onAdd({
                        id: newId(), type: "rect", x: 0, y: 0,
                        width: canvasW, height: canvasH, fill: c, cornerRadius: 0,
                      })}
                        className="flex-1 rounded-md border border-border/20 hover:scale-y-110 hover:border-primary/60 transition-transform"
                        style={{ background: c }} title={c}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── IMAGENS / LOGOS ── */}
          <TabsContent value="imagens" className="m-0 mt-3 space-y-5">
            <div>
              <SectionTitle>Upload de logo ou imagem</SectionTitle>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}/>
              <Button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full bg-gradient-canva shadow-glow h-12 gap-2 font-semibold">
                <Upload className="w-4 h-4"/>{uploading ? "Enviando…" : "Enviar Imagem ou Logo"}
              </Button>
              <div className="mt-3 p-3 rounded-xl border border-dashed border-border/50 bg-muted/20 text-center">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  💡 Use <strong>PNG com fundo transparente</strong> para logos.<br/>
                  Formatos aceitos: PNG, JPG, SVG, WEBP.<br/>
                  Imagem será redimensionada automaticamente.
                </p>
              </div>
            </div>

            <div>
              <SectionTitle>Dicas de composição</SectionTitle>
              <div className="space-y-2">
                {[
                  "🎨 Use fundos escuros com textos brancos para impacto visual",
                  "🖼️ Coloque o logo na zona esquerda do rótulo",
                  "📊 Reserve a zona direita para a tabela nutricional",
                  "✨ Use gradientes suaves para transmitir premium",
                  "🔤 Combine Bebas Neue (título) + Inter (corpo)",
                  "📐 Ative 'Guias' na barra para ver as 3 zonas do rótulo",
                ].map((tip, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground leading-snug px-2 py-1.5 rounded-lg bg-muted/20">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </aside>
  );
}
