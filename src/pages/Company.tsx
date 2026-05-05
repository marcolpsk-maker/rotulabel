import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CompanyPage() {
  const { user } = useAuth();
  const [c, setC] = useState<any>({
    brand_name: "", cnpj: "", address: "", sac: "", responsavel_tecnico: "",
    crf: "", distribuidor: "", fabricante: "", website: "", instagram: "",
  });
  const [id, setId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("companies").select("*").eq("user_id", user.id).maybeSingle().then(({data}) => {
      if (data) { setC(data); setId(data.id); }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...c, user_id: user.id };
    const q = id
      ? supabase.from("companies").update(payload).eq("id", id)
      : supabase.from("companies").insert(payload).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Dados salvos"); if (data && !id) setId((data as any).id); }
  };

  const F = ({ k, label, area }: { k: string; label: string; area?: boolean }) => (
    <div>
      <Label>{label}</Label>
      {area
        ? <Textarea value={c[k] ?? ""} onChange={e=>setC({...c, [k]: e.target.value})}/>
        : <Input value={c[k] ?? ""} onChange={e=>setC({...c, [k]: e.target.value})}/>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader/>
      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-2">Dados da empresa</h1>
        <p className="text-muted-foreground mb-6">Preenchidos automaticamente em todos os seus rótulos.</p>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <F k="brand_name" label="Nome da marca"/>
            <F k="cnpj" label="CNPJ"/>
            <F k="responsavel_tecnico" label="Responsável técnico"/>
            <F k="crf" label="CRF"/>
            <F k="sac" label="SAC"/>
            <F k="website" label="Website"/>
            <F k="instagram" label="Instagram"/>
            <F k="fabricante" label="Fabricante"/>
            <F k="distribuidor" label="Distribuidor"/>
          </div>
          <F k="address" label="Endereço completo" area/>
          <Button onClick={save} disabled={saving} className="bg-gradient-canva shadow-glow">{saving ? "Salvando…" : "Salvar"}</Button>
        </Card>
      </main>
    </div>
  );
}
