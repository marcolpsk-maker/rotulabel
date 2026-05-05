import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NutritionData } from "@/editor/types";
import { Plus, Trash2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultWarnings = [
  "ESTE PRODUTO NÃO É UM MEDICAMENTO.",
  "NÃO EXCEDER A RECOMENDAÇÃO DIÁRIA DE CONSUMO.",
  "MANTENHA FORA DO ALCANCE DE CRIANÇAS.",
  "ESTE PRODUTO NÃO DEVE SER CONSUMIDO POR GESTANTES, LACTANTES E CRIANÇAS.",
  "NÃO CONTÉM GLÚTEN.",
  "NÃO CONTÉM AÇÚCARES.",
  "DISPENSADO DE REGISTRO CONFORME RDC n° 240, DE 26 DE JULHO DE 2018.",
  "CONSERVAR EM LOCAL SECO E AO ABRIGO DA LUZ.",
  "VALIDADE E LOTE VIDE O FRASCO.",
];

// Quick-start templates for common supplement types
const NUTRIENT_PRESETS = {
  "Creatina (pó)": [
    { name: "Valor energético", perServing: "0 kcal / 0 kJ", vd: "0%" },
    { name: "Carboidratos", perServing: "0 g", vd: "0%" },
    { name: "Proteínas", perServing: "0 g", vd: "0%" },
    { name: "Gorduras totais", perServing: "0 g", vd: "0%" },
    { name: "Creatina Monoidratada (mg)", perServing: "3000", vd: "**" },
  ],
  "Whey Protein": [
    { name: "Valor energético", perServing: "120 kcal / 502 kJ", vd: "6%" },
    { name: "Carboidratos", perServing: "3 g", vd: "1%" },
    { name: "Proteínas", perServing: "25 g", vd: "33%" },
    { name: "Gorduras totais", perServing: "1,5 g", vd: "3%" },
    { name: "Gorduras saturadas", perServing: "0,8 g", vd: "4%" },
    { name: "Sódio", perServing: "90 mg", vd: "4%" },
  ],
  "Termogênico": [
    { name: "Valor energético", perServing: "5 kcal / 21 kJ", vd: "0%" },
    { name: "Carboidratos", perServing: "0 g", vd: "0%" },
    { name: "Cafeína Anidra (mg)", perServing: "200", vd: "**" },
    { name: "L-Carnitina (mg)", perServing: "500", vd: "**" },
    { name: "Extrato de Chá Verde (mg)", perServing: "300", vd: "**" },
    { name: "Picolinato de Cromo (mcg)", perServing: "200", vd: "**" },
  ],
  "Cápsula Vitamínica": [
    { name: "Valor energético", perServing: "0 kcal / 0 kJ", vd: "0%" },
    { name: "Vitamina C (mg)", perServing: "500", vd: "556%" },
    { name: "Vitamina D3 (UI)", perServing: "2000", vd: "500%" },
    { name: "Vitamina E (mg)", perServing: "15", vd: "100%" },
    { name: "Zinco (mg)", perServing: "11", vd: "100%" },
    { name: "Magnésio (mg)", perServing: "200", vd: "48%" },
  ],
  "Colágeno": [
    { name: "Valor energético", perServing: "40 kcal / 167 kJ", vd: "2%" },
    { name: "Carboidratos", perServing: "0 g", vd: "0%" },
    { name: "Proteínas", perServing: "10 g", vd: "13%" },
    { name: "Gorduras totais", perServing: "0 g", vd: "0%" },
    { name: "Colágeno Hidrolisado (g)", perServing: "10", vd: "**" },
    { name: "Vitamina C (mg)", perServing: "45", vd: "50%" },
  ],
  "Melatonina / Sleep": [
    { name: "Valor energético", perServing: "0 kcal", vd: "0%" },
    { name: "Melatonina (mg)", perServing: "0,21", vd: "**" },
    { name: "L-Triptofano (mg)", perServing: "300", vd: "**" },
    { name: "Magnésio PA (mg)", perServing: "400", vd: "48%" },
    { name: "Vitamina B6 (mg)", perServing: "0,38", vd: "30%" },
  ],
  "Vazio (custom)": [
    { name: "Valor energético", perServing: "", vd: "" },
    { name: "Carboidratos", perServing: "", vd: "" },
    { name: "Proteínas", perServing: "", vd: "" },
    { name: "Gorduras totais", perServing: "", vd: "" },
    { name: "Sódio", perServing: "", vd: "" },
  ],
};

export default function AnvisaWizard({ open, onOpenChange, initial, onApply, embedded = false }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<NutritionData>;
  onApply: (data: NutritionData) => void;
  embedded?: boolean;
}) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<NutritionData>({
    productName: initial?.productName ?? "",
    brand: initial?.brand ?? "",
    quantity: initial?.quantity ?? "",
    servingSize: initial?.servingSize ?? "1 cápsula",
    servingsPerPackage: initial?.servingsPerPackage ?? "60",
    ingredients: initial?.ingredients ?? "",
    warnings: initial?.warnings ?? [defaultWarnings[0], defaultWarnings[1], defaultWarnings[2]],
    nutrients: initial?.nutrients ?? NUTRIENT_PRESETS["Vazio (custom)"],
  });

  const apply = () => { onApply(d); onOpenChange(false); setStep(1); };

  const content = (
    <div className={cn("space-y-6", embedded ? "" : "max-h-[90vh] overflow-y-auto")}>
      {!embedded && (
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Tabela Nutricional ANVISA</DialogTitle>
        </DialogHeader>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-2">
        {["Produto", "Nutrientes", "Advertências"].map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 flex-1">
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors",
              i + 1 <= step ? "bg-gradient-canva text-white" : "bg-muted text-muted-foreground"
            )}>{i + 1}</div>
            <div className={cn("h-1.5 flex-1 rounded-full transition-colors", i + 1 < step ? "bg-gradient-canva" : "bg-muted")} />
            <span className="text-[9px] text-muted-foreground hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: basic info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">1. Informações do Produto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Nome do produto</Label><Input value={d.productName} onChange={e=>setD({...d, productName: e.target.value})} placeholder="ex: Creatina Monoidratada"/></div>
            <div className="space-y-1.5"><Label>Marca</Label><Input value={d.brand} onChange={e=>setD({...d, brand: e.target.value})} placeholder="ex: KingSport"/></div>
            <div className="space-y-1.5"><Label>Quantidade líquida</Label><Input value={d.quantity} onChange={e=>setD({...d, quantity: e.target.value})} placeholder="ex: 300g / 60 cápsulas"/></div>
            <div className="space-y-1.5"><Label>Tamanho da porção</Label><Input value={d.servingSize} onChange={e=>setD({...d, servingSize: e.target.value})} placeholder="ex: 3g / 1 cápsula"/></div>
            <div className="space-y-1.5"><Label>Porções por embalagem</Label><Input value={d.servingsPerPackage} onChange={e=>setD({...d, servingsPerPackage: e.target.value})} placeholder="ex: 60 / 100 / 166"/></div>
          </div>
          <div className="space-y-1.5">
            <Label>Ingredientes (lista completa)</Label>
            <Textarea value={d.ingredients} onChange={e=>setD({...d, ingredients: e.target.value})} rows={3}
              placeholder="Creatina Monoidratada. NÃO CONTÉM GLÚTEN. NÃO CONTÉM AÇÚCAR."/>
          </div>
        </div>
      )}

      {/* Step 2: nutrients */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg">2. Tabela Nutricional</h3>
          </div>

          {/* Preset selector */}
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground mb-2 block">Carregar modelo de suplemento</Label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(NUTRIENT_PRESETS).map(k => (
                <button key={k} onClick={() => setD({...d, nutrients: NUTRIENT_PRESETS[k as keyof typeof NUTRIENT_PRESETS].map(n => ({...n}))})}
                  className="px-2.5 py-1 text-[10px] rounded-full border border-border hover:border-primary hover:bg-primary/5 transition flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-primary"/>{k}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-muted px-3 py-2">
              <div className="col-span-5 text-[10px] font-bold uppercase text-muted-foreground">Nutriente</div>
              <div className="col-span-4 text-[10px] font-bold uppercase text-muted-foreground">Por porção</div>
              <div className="col-span-2 text-[10px] font-bold uppercase text-muted-foreground">%VD*</div>
              <div className="col-span-1"/>
            </div>
            <div className="divide-y divide-border">
              {d.nutrients.map((n, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center px-1 py-0.5 hover:bg-muted/20 transition">
                  <Input className="col-span-5 border-none h-8 text-xs bg-transparent" value={n.name}
                    onChange={e=>{const c=[...d.nutrients]; c[i]={...c[i], name:e.target.value}; setD({...d, nutrients:c});}}
                    placeholder="Nome do nutriente"/>
                  <Input className="col-span-4 border-none h-8 text-xs bg-transparent" value={n.perServing}
                    onChange={e=>{const c=[...d.nutrients]; c[i]={...c[i], perServing:e.target.value}; setD({...d, nutrients:c});}}
                    placeholder="0 g"/>
                  <Input className="col-span-2 border-none h-8 text-xs bg-transparent" value={n.vd}
                    onChange={e=>{const c=[...d.nutrients]; c[i]={...c[i], vd:e.target.value}; setD({...d, nutrients:c});}}
                    placeholder="0%"/>
                  <Button size="icon" variant="ghost" className="col-span-1 h-7 w-7 text-destructive/50 hover:text-destructive"
                    onClick={()=>setD({...d, nutrients: d.nutrients.filter((_,j)=>j!==i)})}>
                    <Trash2 className="w-3 h-3"/>
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-2 border-t">
              <Button variant="outline" size="sm" className="w-full"
                onClick={()=>setD({...d, nutrients:[...d.nutrients,{name:"",perServing:"",vd:""}]})}>
                <Plus className="w-3.5 h-3.5 mr-1"/>Adicionar linha
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">** Não estabelecido · Use "**" para compostos sem VD definido.</p>
        </div>
      )}

      {/* Step 3: warnings */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">3. Advertências Obrigatórias</h3>
          <p className="text-sm text-muted-foreground">Selecione as advertências aplicáveis ao seu produto (ANVISA RDC 240/2018).</p>
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {defaultWarnings.map(w => (
              <label key={w} className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer",
                d.warnings.includes(w) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
              )}>
                <Checkbox className="mt-0.5 shrink-0" checked={d.warnings.includes(w)}
                  onCheckedChange={(c)=>setD({...d, warnings: c ? [...d.warnings, w] : d.warnings.filter(x=>x!==w)})}/>
                <span className="text-xs leading-snug">{w}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-4 border-t mt-4">
        <div>
          {step > 1 && <Button variant="outline" onClick={()=>setStep(s=>s-1)}>← Voltar</Button>}
        </div>
        <div className="flex gap-2">
          {step < 3
            ? <Button onClick={()=>setStep(s=>s+1)} className="bg-gradient-canva shadow-glow min-w-[130px]">Próximo →</Button>
            : <Button onClick={apply} className="bg-gradient-canva shadow-glow min-w-[170px]">✓ Gerar tabela no rótulo</Button>
          }
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {content}
      </DialogContent>
    </Dialog>
  );
}
