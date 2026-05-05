import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bold, Italic, Palette, Move, Layers2, AlignCenterVertical, AlignCenterHorizontal,
  Sparkles, Filter, Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Settings, Database
} from "lucide-react";
import { AnyEl } from "./types";
import GradientPanel from "./GradientPanel";
import { ALL_GOOGLE_FONTS, useLoadFont } from "./useFonts";
import { cn } from "@/lib/utils";
import { generateBarcodeDataURL, generateQRCodeDataURL, generateNutritionTableSVG } from "./generators_v2";
import { Plus, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from "lucide-react";

// ─── Quick color swatches ─────────────────────────────────────────────────────
const QUICK_COLORS = [
  "#000000","#ffffff","#0f172a","#1e293b","#374151",
  "#7c3aed","#06b6d4","#10b981","#f59e0b","#ef4444",
  "#f97316","#ec4899","#6366f1","#14b8a6","#84cc16",
  "#0ea5e9","#a855f7","#f43f5e","#22d3ee","#4ade80",
];

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("rotulabel_color_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const addToHistory = (color: string) => {
    if (color === value) return;
    const newHistory = [color, ...history.filter(c => c !== color)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("rotulabel_color_history", JSON.stringify(newHistory));
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} 
          onChange={e => onChange(e.target.value)}
          onBlur={e => addToHistory(e.target.value)}
          className="w-9 h-9 rounded-lg border-2 border-border cursor-pointer shrink-0 p-0.5 bg-transparent" />
        <Input value={value || "#000000"} 
          onChange={e => onChange(e.target.value)}
          onBlur={e => addToHistory(e.target.value)}
          className="h-8 font-mono text-xs flex-1" placeholder="#000000" />
      </div>

      {history.length > 0 && (
        <div className="space-y-1">
          <p className="text-[8px] text-muted-foreground uppercase font-semibold">Recentes</p>
          <div className="flex flex-wrap gap-1">
            {history.map(c => (
              <button key={c} onClick={() => onChange(c)}
                className={cn("w-5 h-5 rounded border border-border/40 transition-transform hover:scale-110",
                  value === c && "ring-1 ring-primary")}
                style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-[8px] text-muted-foreground uppercase font-semibold">Padrão</p>
        <div className="grid grid-cols-5 gap-1">
          {QUICK_COLORS.map(c => (
            <button key={c} onClick={() => addToHistory(c)}
              className={cn("w-full aspect-square rounded-md border-2 transition-all hover:scale-110 hover:z-10",
                value === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-transparent")}
              style={{ background: c }} title={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-border/30 last:border-0 space-y-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{title}</p>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RightPanel({ el, onChange, onRemove, onDuplicate, onReorder, canvasW, canvasH }: {
  el: AnyEl | null;
  onChange: (patch: Partial<AnyEl>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onReorder: (dir: "front" | "back" | "forward" | "backward") => void;
  canvasW: number;
  canvasH: number;
}) {
  const [tab, setTab] = useState<"style" | "gradient" | "position" | "data" | "effects">("style");
  const loadFont = useLoadFont();

  // Load font when element is selected
  useEffect(() => {
    if (el?.type === "text" && (el as any).fontFamily) {
      loadFont((el as any).fontFamily);
    }
  }, [el?.id, (el as any)?.fontFamily]);

  if (!el) {
    return (
      <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center">
          <Palette className="w-6 h-6 text-muted-foreground/30" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Clique em um elemento no canvas para editar suas propriedades.
        </p>
      </aside>
    );
  }

  const t = el as any;
  const isText   = el.type === "text";
  const isShape  = el.type === "rect" || el.type === "circle";
  const isLine   = el.type === "line";
  const canGrad  = isShape; // only shapes support gradient
  const hasData  = ["nutrition", "barcode", "qrcode"].includes(el.type);

  const TYPE_COLOR: Record<string, string> = {
    text: "bg-blue-500", rect: "bg-violet-500", circle: "bg-pink-500",
    line: "bg-emerald-500", image: "bg-orange-500", barcode: "bg-gray-500", nutrition: "bg-teal-500",
    qrcode: "bg-black",
  };
  const TYPE_ICON: Record<string, string> = {
    text: "T", rect: "▭", circle: "◯", line: "—", image: "⊞", barcode: "▦", nutrition: "≡", qrcode: "▣",
  };

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40 bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black shrink-0",
            TYPE_COLOR[el.type] ?? "bg-gray-500")}>
            {TYPE_ICON[el.type] ?? "?"}
          </div>
          <span className="text-xs font-semibold">
            {el.type === "nutrition" ? "Tabela Nutr." : el.type === "barcode" ? "Código Barras" : el.type.charAt(0).toUpperCase() + el.type.slice(1)}
          </span>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onDuplicate} title="Duplicar (Ctrl+D)">
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={onRemove} title="Remover (Del)">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => setTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className={cn("mx-3 mt-2 h-7 bg-muted/40 gap-0.5 shrink-0 grid", 
          canGrad && hasData ? "grid-cols-5" : (canGrad || hasData ? "grid-cols-4" : "grid-cols-3"))}>
          <TabsTrigger value="style" className="flex-1 h-6 text-[10px] gap-1 px-1">
            <Palette className="w-3 h-3" />Estilo
          </TabsTrigger>
          {canGrad && (
            <TabsTrigger value="gradient" className="flex-1 h-6 text-[10px] gap-1 px-1">
              <Layers2 className="w-3 h-3" />Grad.
            </TabsTrigger>
          )}
          <TabsTrigger value="effects" className="flex-1 h-6 text-[10px] gap-1 px-1">
            <Sparkles className="w-3 h-3" />Efeitos
          </TabsTrigger>
          <TabsTrigger value="position" className="flex-1 h-6 text-[10px] gap-1 px-1">
            <Move className="w-3 h-3" />Pos.
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-3 pb-4">

          {/* ── STYLE TAB ── */}
          <TabsContent value="style" className="m-0 pt-2 space-y-0">

            {/* Text content */}
            {isText && (
              <Sec title="Conteúdo">
                <textarea
                  value={t.text ?? ""}
                  onChange={e => onChange({ text: e.target.value } as any)}
                  placeholder="Digite o texto…"
                  className="w-full rounded-lg border border-input bg-muted/20 px-3 py-2 text-sm min-h-[64px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </Sec>
            )}

            {/* Typography */}
            {isText && (
              <Sec title="Tipografia">
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase text-muted-foreground">Fonte</Label>
                  <Select value={t.fontFamily ?? "Inter"} onValueChange={v => {
                    loadFont(v);
                    onChange({ fontFamily: v } as any);
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {ALL_GOOGLE_FONTS.map(f => (
                        <SelectItem key={f} value={f}>
                          <span style={{ fontFamily: f }}>{f}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase text-muted-foreground">Tamanho</Label>
                    <Input type="number" value={Math.round(t.fontSize ?? 16)}
                      onChange={e => onChange({ fontSize: parseInt(e.target.value) || 16 } as any)}
                      className="h-8 text-xs text-center p-1" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase text-muted-foreground">Peso</Label>
                    <Select value={String(t.fontWeight ?? "normal")} onValueChange={v => onChange({ fontWeight: isNaN(+v) ? undefined : +v, fontStyle: isNaN(+v) ? v as any : t.fontStyle } as any)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["normal","bold","italic","bold italic"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase text-muted-foreground">Tamanho — slider</Label>
                  <Slider min={6} max={300} step={1} value={[t.fontSize ?? 16]}
                    onValueChange={([v]) => onChange({ fontSize: v } as any)} />
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { a: "left",   icon: <AlignLeft className="w-3.5 h-3.5" /> },
                    { a: "center", icon: <AlignCenter className="w-3.5 h-3.5" /> },
                    { a: "right",  icon: <AlignRight className="w-3.5 h-3.5" /> },
                  ].map(({ a, icon }) => (
                    <Button key={a} size="sm" variant={t.align === a ? "default" : "outline"}
                      className="h-8" onClick={() => onChange({ align: a } as any)}>
                      {icon}
                    </Button>
                  ))}
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Espaç. letras — {Math.round(t.letterSpacing ?? 0)}px</Label>
                  <Slider min={-10} max={80} step={0.5} value={[t.letterSpacing ?? 0]}
                    onValueChange={([v]) => onChange({ letterSpacing: v } as any)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Altura de linha — {((t.lineHeight ?? 1.2)).toFixed(1)}×</Label>
                  <Slider min={0.8} max={3} step={0.1} value={[t.lineHeight ?? 1.2]}
                    onValueChange={([v]) => onChange({ lineHeight: v } as any)} />
                </div>
              </Sec>
            )}

            {/* Fill color */}
            {(isText || isShape) && !el.gradient && (
              <Sec title="Cor de preenchimento">
                <ColorPicker label="Cor" value={el.fill ?? "#000000"} onChange={v => onChange({ fill: v })} />
              </Sec>
            )}

            {isShape && el.gradient && (
              <Sec title="Gradiente ativo">
                <div className="h-10 rounded-lg border border-border/40"
                  style={{ background: (() => {
                    const g = el.gradient!;
                    const stops = g.colorStops.map(s => `${s.color} ${Math.round(s.offset*100)}%`).join(", ");
                    return g.type === "radial" ? `radial-gradient(circle, ${stops})` : `linear-gradient(${g.angle??135}deg, ${stops})`;
                  })() }}/>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setTab("gradient")}>
                  Editar gradiente →
                </Button>
              </Sec>
            )}

            {/* Stroke */}
            {(isShape || isLine) && (
              <Sec title="Borda">
                <ColorPicker label="Cor da borda" value={el.stroke ?? "#000000"} onChange={v => onChange({ stroke: v })} />
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Espessura — {el.strokeWidth ?? 0}px</Label>
                  <Slider min={0} max={30} step={0.5} value={[el.strokeWidth ?? 0]}
                    onValueChange={([v]) => onChange({ strokeWidth: v })} />
                </div>
              </Sec>
            )}

            {/* Corner radius */}
            {el.type === "rect" && (
              <Sec title="Arredondamento">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Raio — {Math.round(t.cornerRadius ?? 0)}px</Label>
                  <Slider min={0} max={300} step={1} value={[t.cornerRadius ?? 0]}
                    onValueChange={([v]) => onChange({ cornerRadius: v } as any)} />
                </div>
              </Sec>
            )}

            {/* Shadow */}
            <Sec title="Sombra">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Cor</Label>
                  <input type="color" value={el.shadowColor ?? "#000000"}
                    onChange={e => onChange({ shadowColor: e.target.value })}
                    className="w-full h-8 rounded-lg border border-border cursor-pointer p-0.5 bg-transparent" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Blur — {el.shadowBlur ?? 0}px</Label>
                  <Slider min={0} max={40} step={1} value={[el.shadowBlur ?? 0]}
                    onValueChange={([v]) => onChange({ shadowBlur: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Offset X — {el.shadowOffsetX ?? 0}</Label>
                  <Slider min={-30} max={30} step={1} value={[el.shadowOffsetX ?? 0]}
                    onValueChange={([v]) => onChange({ shadowOffsetX: v })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Offset Y — {el.shadowOffsetY ?? 0}</Label>
                  <Slider min={-30} max={30} step={1} value={[el.shadowOffsetY ?? 0]}
                    onValueChange={([v]) => onChange({ shadowOffsetY: v })} />
                </div>
              </div>
            </Sec>

            {/* Opacity */}
            <Sec title="Opacidade">
              <div className="space-y-1">
                <Label className="text-[9px] uppercase text-muted-foreground">{Math.round((el.opacity ?? 1) * 100)}%</Label>
                <Slider min={0} max={1} step={0.01} value={[el.opacity ?? 1]}
                  onValueChange={([v]) => onChange({ opacity: v })} />
              </div>
            </Sec>
          </TabsContent>

          {/* ── EFFECTS TAB ── */}
          <TabsContent value="effects" className="m-0 pt-2 space-y-0">
            <Sec title="Filtros Visual">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Desfoque (Blur) — {el.filters?.blur ?? 0}px</Label>
                  <Slider min={0} max={20} step={1} value={[el.filters?.blur ?? 0]}
                    onValueChange={([v]) => onChange({ filters: { ...el.filters, blur: v } })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Brilho — {((el.filters?.brightness ?? 0) * 100).toFixed(0)}%</Label>
                  <Slider min={-1} max={1} step={0.05} value={[el.filters?.brightness ?? 0]}
                    onValueChange={([v]) => onChange({ filters: { ...el.filters, brightness: v } })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-muted-foreground">Contraste — {((el.filters?.contrast ?? 0)).toFixed(1)}</Label>
                  <Slider min={-100} max={100} step={1} value={[el.filters?.contrast ?? 0]}
                    onValueChange={([v]) => onChange({ filters: { ...el.filters, contrast: v } })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] uppercase text-muted-foreground">Inverter Cores</Label>
                  <Button variant={el.filters?.invert ? "default" : "outline"} size="sm" className="h-7 text-[10px]"
                    onClick={() => onChange({ filters: { ...el.filters, invert: !el.filters?.invert } })}>
                    {el.filters?.invert ? "Ativado" : "Desativado"}
                  </Button>
                </div>
              </div>
            </Sec>

            <Sec title="Modos de Mesclagem">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase text-muted-foreground">Blend Mode</Label>
                <Select value={el.blendMode ?? "source-over"} onValueChange={v => onChange({ blendMode: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="source-over">Normal</SelectItem>
                    <SelectItem value="multiply">Multiplicar</SelectItem>
                    <SelectItem value="screen">Tela (Screen)</SelectItem>
                    <SelectItem value="overlay">Sobrepor</SelectItem>
                    <SelectItem value="darken">Escurecer</SelectItem>
                    <SelectItem value="lighten">Clarear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Sec>
          </TabsContent>

          {/* ── GRADIENT TAB ── */}
          {canGrad && (
            <TabsContent value="gradient" className="m-0 pt-3">
              <GradientPanel
                value={el.gradient}
                onChange={g => onChange({ gradient: g, fill: g ? undefined : el.fill })}
                elementW={el.width}
                elementH={el.height}
              />
            </TabsContent>
          )}

          {/* ── POSITION TAB ── */}
          <TabsContent value="position" className="m-0 pt-2 space-y-0">
            <Sec title="Posição e Tamanho">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "X", key: "x" }, { label: "Y", key: "y" },
                  { label: "Largura", key: "width" }, { label: "Altura", key: "height" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[9px] uppercase text-muted-foreground">{label}</Label>
                    <Input type="number" value={Math.round((el as any)[key] ?? 0)}
                      onChange={e => onChange({ [key]: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-xs text-center" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[10px]"
                  onClick={() => onChange({ x: (canvasW - (el.width ?? 0)) / 2 })}>
                  <AlignCenterHorizontal className="w-3.5 h-3.5" /> Centrar H
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[10px]"
                  onClick={() => onChange({ y: (canvasH - (el.height ?? 0)) / 2 })}>
                  <AlignCenterVertical className="w-3.5 h-3.5" /> Centrar V
                </Button>
              </div>
            </Sec>

            <Sec title="Rotação">
              <div className="space-y-1">
                <Label className="text-[9px] uppercase text-muted-foreground">Ângulo — {Math.round(el.rotation ?? 0)}°</Label>
                <Slider min={-180} max={180} step={1} value={[el.rotation ?? 0]}
                  onValueChange={([v]) => onChange({ rotation: v })} />
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[0, 45, 90, -45].map(deg => (
                  <Button key={deg} size="sm" variant={Math.round(el.rotation ?? 0) === deg ? "default" : "outline"}
                    className="h-7 text-[10px]" onClick={() => onChange({ rotation: deg })}>
                    {deg}°
                  </Button>
                ))}
              </div>
            </Sec>

            <Sec title="Camadas">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => onReorder("front")}>
                  <ChevronsUp className="w-3.5 h-3.5" />Frente
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => onReorder("forward")}>
                  <ChevronUp className="w-3.5 h-3.5" />Avançar
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => onReorder("backward")}>
                  <ChevronDown className="w-3.5 h-3.5" />Recuar
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => onReorder("back")}>
                  <ChevronsDown className="w-3.5 h-3.5" />Fundo
                </Button>
              </div>
            </Sec>
          </TabsContent>

          {/* ── DATA TAB ── */}
          {hasData && (
            <TabsContent value="data" className="m-0 pt-2 space-y-4 px-3 overflow-y-auto max-h-[calc(100vh-140px)]">
              {el.type === "nutrition" && (
                <div className="space-y-4 pb-10">
                  <Sec title="Dados Gerais">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Porções por embalagem</Label>
                        <Input value={el.data?.servingsPerPackage} 
                          onChange={e => {
                            const newData = { ...el.data, servingsPerPackage: e.target.value };
                            const { src } = generateNutritionTableSVG(newData);
                            onChange({ data: newData, src });
                          }} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Tamanho da Porção</Label>
                        <Input value={el.data?.servingSize} 
                          onChange={e => {
                            const newData = { ...el.data, servingSize: e.target.value };
                            const { src } = generateNutritionTableSVG(newData);
                            onChange({ data: newData, src });
                          }} className="h-8 text-xs" />
                      </div>
                    </div>
                  </Sec>

                  <Sec title="Nutrientes">
                    <div className="space-y-2">
                      {el.data?.nutrients.map((n: any, idx: number) => (
                        <div key={idx} className="flex gap-1 items-end border-b border-border/40 pb-2 mb-2">
                          <div className="flex-1 space-y-1">
                            <Input value={n.name} placeholder="Nome (ex: Proteína)"
                              onChange={e => {
                                const nutrients = [...el.data.nutrients];
                                nutrients[idx] = { ...n, name: e.target.value };
                                const newData = { ...el.data, nutrients };
                                const { src } = generateNutritionTableSVG(newData);
                                onChange({ data: newData, src });
                              }} className="h-7 text-[10px] px-1.5" />
                            <Input value={n.perServing} placeholder="Qtd (ex: 20g)"
                              onChange={e => {
                                const nutrients = [...el.data.nutrients];
                                nutrients[idx] = { ...n, perServing: e.target.value };
                                const newData = { ...el.data, nutrients };
                                const { src } = generateNutritionTableSVG(newData);
                                onChange({ data: newData, src });
                              }} className="h-7 text-[10px] px-1.5" />
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const nutrients = el.data.nutrients.filter((_: any, i: number) => i !== idx);
                              const newData = { ...el.data, nutrients };
                              const { src } = generateNutritionTableSVG(newData);
                              onChange({ data: newData, src });
                            }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1 mt-2 border-dashed"
                        onClick={() => {
                          const nutrients = [...(el.data?.nutrients ?? []), { name: "Novo", perServing: "0g", vd: "0%" }];
                          const newData = { ...el.data, nutrients };
                          const { src } = generateNutritionTableSVG(newData);
                          onChange({ data: newData, src });
                        }}>
                        <Plus className="w-3 h-3" /> Adicionar Nutriente
                      </Button>
                    </div>
                  </Sec>
                </div>
              )}

              {(el.type === "barcode" || el.type === "qrcode") && (
                <Sec title="Configuração do Código">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Valor / Texto / URL</Label>
                      <Input value={el.code} 
                        onChange={e => {
                          const code = e.target.value;
                          const src = el.type === "barcode" ? generateBarcodeDataURL(code) : generateQRCodeDataURL(code);
                          onChange({ code, src });
                        }} className="h-8 text-xs" />
                    </div>
                    <div className="text-[9px] text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
                      <p className="font-bold text-primary mb-1">Dica Profissional:</p>
                      O código é gerado em alta resolução (300dpi) automaticamente ao ser exportado.
                    </div>
                  </div>
                </Sec>
              )}
            </TabsContent>
          )}

        </div>
      </Tabs>
    </aside>
  );
}
