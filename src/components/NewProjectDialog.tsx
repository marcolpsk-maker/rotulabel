import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Package, Droplet, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const types = [
  { id: "capsula", label: "Cápsulas", icon: Pill, defaults: { w: 15, h: 5 } },
  { id: "po", label: "Pó", icon: Package, defaults: { w: 22, h: 9 } },
  { id: "liquido", label: "Líquido", icon: Droplet, defaults: { w: 18, h: 7 } },
  { id: "gel", label: "Gel / Outros", icon: FlaskConical, defaults: { w: 15, h: 6 } },
];

const presets = [
  { name: "Pote 60 cápsulas", w: 15, h: 5 },
  { name: "Pote 120 cápsulas", w: 18, h: 6 },
  { name: "Sachê pó 500g", w: 22, h: 9 },
  { name: "Frasco 250ml", w: 18, h: 7 },
  { name: "Personalizado", w: 0, h: 0 },
];

export default function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Novo rótulo");
  const [type, setType] = useState<string>("capsula");
  const [w, setW] = useState(15);
  const [h, setH] = useState(5);
  const [saving, setSaving] = useState(false);

  const reset = () => { setStep(1); setName("Novo rótulo"); setType("capsula"); setW(15); setH(5); };

  const create = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase.from("label_projects").insert({
      user_id: user.id, name, product_type: type, width_cm: w, height_cm: h,
      canvas_data: { elements: [] }, anvisa_data: {},
    }).select().single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    onOpenChange(false); reset();
    nav(`/editor/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {step === 1 ? "Que tipo de produto?" : step === 2 ? "Tamanho do rótulo" : "Quase pronto"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          {[1,2,3].map(s => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-gradient-canva" : "bg-muted")}/>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {types.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => { setType(t.id); setW(t.defaults.w); setH(t.defaults.h); }}
                  className={cn("p-5 rounded-xl border-2 text-left transition-all", type === t.id ? "border-primary bg-primary/5 shadow-glow" : "border-border hover:border-primary/40")}>
                  <Icon className="w-7 h-7 text-primary mb-2"/>
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.defaults.w} × {t.defaults.h} cm</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Modelos comuns</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button key={p.name} onClick={() => { if (p.w) { setW(p.w); setH(p.h); } }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-border hover:border-primary hover:bg-primary/5">
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Largura (cm)</Label><Input type="number" step="0.1" value={w} onChange={e=>setW(parseFloat(e.target.value)||0)}/></div>
              <div><Label>Altura (cm)</Label><Input type="number" step="0.1" value={h} onChange={e=>setH(parseFloat(e.target.value)||0)}/></div>
            </div>
            <div className="rounded-xl bg-muted/40 p-6 flex items-center justify-center">
              <div className="bg-card shadow-md border border-border" style={{ width: Math.min(w*12, 360), height: Math.min(h*12, 200) }}/>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div><Label>Nome do projeto</Label><Input value={name} onChange={e=>setName(e.target.value)}/></div>
            <div className="rounded-xl bg-gradient-soft p-5 text-sm space-y-1">
              <div><strong>Tipo:</strong> {types.find(t=>t.id===type)?.label}</div>
              <div><strong>Dimensões:</strong> {w} × {h} cm</div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          {step > 1 && <Button variant="ghost" onClick={() => setStep(s=>s-1)}>Voltar</Button>}
          {step < 3 ? (
            <Button onClick={() => setStep(s=>s+1)} disabled={step===2 && (w<=0 || h<=0)} className="bg-gradient-canva shadow-glow">Continuar</Button>
          ) : (
            <Button onClick={create} disabled={saving} className="bg-gradient-canva shadow-glow">{saving ? "Criando…" : "Criar e abrir editor"}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
