import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  Copy, Trash2, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Lock, Unlock
} from "lucide-react";
import { AnyEl, ALL_FONTS } from "./types";
import { cn } from "@/lib/utils";

// ─── Color swatches ──────────────────────────────────────────────────────────
const QUICK_COLORS = [
  "#000000", "#ffffff", "#1e1e2e", "#0a3d2e", "#1a0533",
  "#7c3aed", "#06b6d4", "#f59e0b", "#ef4444", "#10b981",
  "#f97316", "#ec4899", "#6366f1", "#14b8a6", "#8b5cf6",
];

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border-2 border-border cursor-pointer shrink-0 p-0.5 bg-transparent" />
        <Input value={value || "#000000"} onChange={e => onChange(e.target.value)}
          className="h-9 font-mono text-xs flex-1" />
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {QUICK_COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)}
            className={cn("w-full aspect-square rounded-md border-2 transition-all hover:scale-110",
              value === c ? "border-primary ring-2 ring-primary/30" : "border-transparent")}
            style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 py-3 border-b border-border/50 last:border-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">{title}</p>
      {children}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function RightPanel({ el, onChange, onRemove, onDuplicate, onReorder }: {
  el: AnyEl | null;
  onChange: (patch: Partial<AnyEl>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onReorder: (dir: "front" | "back" | "forward" | "backward") => void;
}) {
  const [tab, setTab] = useState<"style" | "position">("style");

  if (!el) {
    return (
      <aside className="w-72 border-l border-border bg-card flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-6-6m0 0l6-6m-6 6h12"/>
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">Clique em um elemento no canvas para editar.</p>
      </aside>
    );
  }

  const t = el as any;
  const isText = el.type === "text";
  const isShape = el.type === "rect" || el.type === "circle";
  const isLine = el.type === "line";
  const isImage = el.type === "image" || el.type === "barcode" || el.type === "nutrition";

  return (
    <aside className="w-72 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white",
            isText ? "bg-blue-500" : isShape ? "bg-purple-500" : isLine ? "bg-green-500" : "bg-orange-500")}>
            {isText ? "T" : isShape ? "◻" : isLine ? "—" : "⊞"}
          </div>
          <span className="text-xs font-semibold capitalize">{el.type === "nutrition" ? "Tabela Nutr." : el.type}</span>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicate} title="Duplicar">
            <Copy className="w-3.5 h-3.5"/>
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onRemove} title="Remover">
            <Trash2 className="w-3.5 h-3.5"/>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={v => setTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 h-8 bg-muted/40 gap-0.5">
          <TabsTrigger value="style" className="flex-1 h-7 text-xs">Estilo</TabsTrigger>
          <TabsTrigger value="position" className="flex-1 h-7 text-xs">Posição</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-4 pb-4">

          {/* ── STYLE TAB ── */}
          <TabsContent value="style" className="space-y-0 m-0 pt-3">

            {/* Text content editing */}
            {isText && (
              <Section title="Conteúdo">
                <textarea
                  value={t.text ?? ""}
                  onChange={e => onChange({ text: e.target.value } as any)}
                  placeholder="Digite o texto..."
                  className="w-full rounded-lg border border-input bg-muted/20 px-3 py-2 text-sm min-h-[72px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant={(t.upperCase) ? "default" : "outline"} className="text-xs flex-1 h-7"
                    onClick={() => onChange({ text: t.upperCase ? t.text?.toLowerCase() : t.text?.toUpperCase(), upperCase: !t.upperCase } as any)}>
                    AA
                  </Button>
                </div>
              </Section>
            )}

            {/* Typography */}
            {isText && (
              <Section title="Tipografia">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground">Fonte</Label>
                  <Select value={t.fontFamily ?? "Inter"} onValueChange={v => onChange({ fontFamily: v } as any)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_FONTS.map(f => (
                        <SelectItem key={f} value={f}>
                          <span style={{ fontFamily: f }}>{f}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Tamanho — {Math.round(t.fontSize ?? 16)}px</Label>
                  <div className="flex items-center gap-2">
                    <Slider min={6} max={200} step={1} value={[t.fontSize ?? 16]} onValueChange={([v]) => onChange({ fontSize: v } as any)} className="flex-1" />
                    <Input type="number" value={Math.round(t.fontSize ?? 16)} onChange={e => onChange({ fontSize: parseInt(e.target.value) || 16 } as any)}
                      className="w-14 h-7 text-xs text-center p-1" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { v: "normal", icon: <span className="text-xs">N</span> },
                    { v: "bold", icon: <Bold className="w-3.5 h-3.5" /> },
                    { v: "italic", icon: <Italic className="w-3.5 h-3.5" /> },
                    { v: "bold italic", icon: <span className="text-xs font-bold italic">BI</span> },
                  ] as const).map(({ v, icon }) => (
                    <Button key={v} size="sm" variant={t.fontStyle === v ? "default" : "outline"}
                      className="h-8 text-xs" onClick={() => onChange({ fontStyle: v } as any)}>
                      {icon}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { a: "left", icon: <AlignLeft className="w-3.5 h-3.5" /> },
                    { a: "center", icon: <AlignCenter className="w-3.5 h-3.5" /> },
                    { a: "right", icon: <AlignRight className="w-3.5 h-3.5" /> },
                  ] as const).map(({ a, icon }) => (
                    <Button key={a} size="sm" variant={t.align === a ? "default" : "outline"}
                      className="h-8" onClick={() => onChange({ align: a } as any)}>
                      {icon}
                    </Button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Espaçamento de letras — {Math.round((t.letterSpacing ?? 0))}px</Label>
                  <Slider min={-10} max={60} step={0.5} value={[t.letterSpacing ?? 0]} onValueChange={([v]) => onChange({ letterSpacing: v } as any)} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Altura de linha — {((t.lineHeight ?? 1.2)).toFixed(1)}×</Label>
                  <Slider min={0.8} max={3} step={0.1} value={[t.lineHeight ?? 1.2]} onValueChange={([v]) => onChange({ lineHeight: v } as any)} />
                </div>
              </Section>
            )}

            {/* Colors */}
            {(isText || isShape) && (
              <Section title="Cor do Preenchimento">
                <ColorRow label="Cor" value={el.fill ?? "#000000"} onChange={v => onChange({ fill: v })} />
              </Section>
            )}

            {/* Stroke */}
            {(isShape || isLine) && (
              <Section title="Borda">
                <ColorRow label="Cor da borda" value={el.stroke ?? "#000000"} onChange={v => onChange({ stroke: v })} />
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Espessura — {el.strokeWidth ?? 0}px</Label>
                  <Slider min={0} max={30} step={0.5} value={[el.strokeWidth ?? 0]} onValueChange={([v]) => onChange({ strokeWidth: v })} />
                </div>
              </Section>
            )}

            {/* Corner radius */}
            {el.type === "rect" && (
              <Section title="Forma">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Arredondamento — {Math.round(t.cornerRadius ?? 0)}px</Label>
                  <Slider min={0} max={200} step={1} value={[t.cornerRadius ?? 0]} onValueChange={([v]) => onChange({ cornerRadius: v } as any)} />
                </div>
              </Section>
            )}

            {/* Opacity & Rotation */}
            <Section title="Visibilidade">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-muted-foreground">Opacidade — {Math.round((el.opacity ?? 1) * 100)}%</Label>
                <Slider min={0} max={1} step={0.01} value={[el.opacity ?? 1]} onValueChange={([v]) => onChange({ opacity: v })} />
              </div>
            </Section>
          </TabsContent>

          {/* ── POSITION TAB ── */}
          <TabsContent value="position" className="space-y-0 m-0 pt-3">
            <Section title="Posição e Tamanho">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "X", key: "x" }, { label: "Y", key: "y" },
                  { label: "Largura", key: "width" }, { label: "Altura", key: "height" },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
                    <Input type="number" value={Math.round((el as any)[key] ?? 0)}
                      onChange={e => onChange({ [key]: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-xs text-center" />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Rotação">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-muted-foreground">Ângulo — {Math.round(el.rotation ?? 0)}°</Label>
                <Slider min={-180} max={180} step={1} value={[el.rotation ?? 0]} onValueChange={([v]) => onChange({ rotation: v })} />
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {([0, 45, 90, -45] as const).map(deg => (
                  <Button key={deg} size="sm" variant={Math.round(el.rotation ?? 0) === deg ? "default" : "outline"}
                    className="h-7 text-xs" onClick={() => onChange({ rotation: deg })}>
                    {deg}°
                  </Button>
                ))}
              </div>
            </Section>

            <Section title="Ordem das Camadas">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReorder("front")}>
                  <ChevronsUp className="w-3.5 h-3.5"/> Frente
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReorder("forward")}>
                  <ChevronUp className="w-3.5 h-3.5"/> Avançar
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReorder("backward")}>
                  <ChevronDown className="w-3.5 h-3.5"/> Recuar
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onReorder("back")}>
                  <ChevronsDown className="w-3.5 h-3.5"/> Fundo
                </Button>
              </div>
            </Section>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
