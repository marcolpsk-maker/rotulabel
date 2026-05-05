import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { BaseEl, GRADIENT_PRESETS } from "./types";

type GradientDef = NonNullable<BaseEl["gradient"]>;
type ColorStop = GradientDef["colorStops"][0];

interface Props {
  value: GradientDef | null | undefined;
  onChange: (g: GradientDef | null) => void;
  elementW?: number;
  elementH?: number;
}

function gradientCss(g: GradientDef, w = 200, h = 80): string {
  const stops = g.colorStops.map(s => `${s.color} ${Math.round(s.offset * 100)}%`).join(", ");
  if (g.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(${g.angle ?? 135}deg, ${stops})`;
}

export default function GradientPanel({ value, onChange, elementW = 200, elementH = 80 }: Props) {
  const [localG, setLocalG] = useState<GradientDef>(
    value ?? {
      type: "linear",
      angle: 135,
      colorStops: [
        { offset: 0, color: "#7c3aed" },
        { offset: 1, color: "#06b6d4" },
      ],
    }
  );
  const [selectedStop, setSelectedStop] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<GradientDef>) => {
    const next = { ...localG, ...patch } as GradientDef;
    setLocalG(next);
    onChange(next);
  };

  const updateStop = (i: number, patch: Partial<ColorStop>) => {
    const stops = [...localG.colorStops];
    stops[i] = { ...stops[i], ...patch };
    stops.sort((a, b) => a.offset - b.offset);
    update({ colorStops: stops });
    setSelectedStop(stops.findIndex(s => s.offset === (patch.offset ?? localG.colorStops[i].offset)));
  };

  const addStop = () => {
    const newStop: ColorStop = { offset: 0.5, color: "#ffffff" };
    const stops = [...localG.colorStops, newStop].sort((a, b) => a.offset - b.offset);
    update({ colorStops: stops });
    setSelectedStop(stops.findIndex(s => s.offset === 0.5));
  };

  const removeStop = (i: number) => {
    if (localG.colorStops.length <= 2) return;
    const stops = localG.colorStops.filter((_, j) => j !== i);
    update({ colorStops: stops });
    setSelectedStop(Math.min(i, stops.length - 1));
  };

  // Click on bar to pick stop position
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const offset = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateStop(selectedStop, { offset: +offset.toFixed(2) });
  };

  const css = gradientCss(localG, elementW, elementH);

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="w-full h-16 rounded-xl border border-border/40 shadow-inner"
        style={{ background: css }}
      />

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-1.5">
        {(["linear", "radial"] as const).map(t => (
          <Button key={t} size="sm" variant={localG.type === t ? "default" : "outline"}
            className="h-8 text-xs capitalize" onClick={() => update({ type: t })}>
            {t === "linear" ? "Linear" : "Radial"}
          </Button>
        ))}
      </div>

      {/* Angle (linear only) */}
      {localG.type === "linear" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase text-muted-foreground">Ângulo — {localG.angle ?? 135}°</Label>
          <Slider min={0} max={360} step={5} value={[localG.angle ?? 135]}
            onValueChange={([v]) => update({ angle: v })} />
          <div className="grid grid-cols-4 gap-1">
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <button key={deg} onClick={() => update({ angle: deg })}
                className={cn("text-[9px] h-6 rounded border border-border/40 hover:border-primary hover:bg-primary/5 transition",
                  localG.angle === deg && "border-primary bg-primary/10 text-primary font-bold")}>
                {deg}°
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color stops bar */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase text-muted-foreground">Pontos de cor</Label>

        {/* Gradient bar — click to position selected stop */}
        <div
          ref={barRef}
          onClick={handleBarClick}
          className="w-full h-8 rounded-lg cursor-crosshair relative border border-border/40"
          style={{ background: css }}
        >
          {localG.colorStops.map((s, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setSelectedStop(i); }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all",
                selectedStop === i ? "border-white scale-125 shadow-lg" : "border-white/70 scale-100"
              )}
              style={{ left: `${s.offset * 100}%`, background: s.color }}
            />
          ))}
        </div>

        {/* Selected stop controls */}
        <div className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Stop {selectedStop + 1} / {localG.colorStops.length}</span>
            <button
              onClick={() => removeStop(selectedStop)}
              disabled={localG.colorStops.length <= 2}
              className="ml-auto text-destructive/60 hover:text-destructive disabled:opacity-30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={localG.colorStops[selectedStop]?.color ?? "#ffffff"}
              onChange={e => updateStop(selectedStop, { color: e.target.value })}
              className="w-9 h-9 rounded-lg border-2 border-border cursor-pointer p-0.5 bg-transparent shrink-0"
            />
            <div className="flex-1 space-y-1">
              <Label className="text-[9px] text-muted-foreground">Posição — {Math.round((localG.colorStops[selectedStop]?.offset ?? 0) * 100)}%</Label>
              <Slider
                min={0} max={100} step={1}
                value={[Math.round((localG.colorStops[selectedStop]?.offset ?? 0) * 100)]}
                onValueChange={([v]) => updateStop(selectedStop, { offset: v / 100 })}
              />
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full gap-1.5 h-8" onClick={addStop}>
          <Plus className="w-3.5 h-3.5" /> Adicionar ponto de cor
        </Button>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase text-muted-foreground">Presets</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {GRADIENT_PRESETS.map(p => (
            <button key={p.name}
              onClick={() => { setLocalG(p.gradient); onChange(p.gradient); }}
              className="h-9 rounded-lg border border-border/30 hover:border-primary hover:ring-2 ring-primary/20 transition-all text-[9px] font-semibold text-white relative overflow-hidden"
              style={{ background: gradientCss(p.gradient) }}>
              <span className="drop-shadow">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Remove gradient */}
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-1.5"
        onClick={() => onChange(null)}>
        <RotateCcw className="w-3.5 h-3.5" /> Remover gradiente (usar cor sólida)
      </Button>
    </div>
  );
}
