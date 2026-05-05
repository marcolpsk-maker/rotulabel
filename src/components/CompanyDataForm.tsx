import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Save, MapPin, Hash, Phone, Globe } from "lucide-react";
import { toast } from "sonner";

export default function CompanyDataForm({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    brand_name: "",
    cnpj: "",
    fabricante: "",
    distribuidor: "",
    address: "",
    sac: "",
    website: "",
    responsavel_tecnico: "",
    crf: ""
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("companies").select("*").eq("user_id", user.id).single().then(({ data, error }) => {
      if (data) setData(data as any);
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("companies").upsert({
      ...data,
      user_id: user.id,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Dados da empresa salvos");
      onComplete();
    }
  };

  if (loading) return <div>Carregando dados da empresa...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Building2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Dados do Distribuidor e Fabricante</h2>
          <p className="text-muted-foreground">Estes dados serão usados automaticamente no rodapé do seu rótulo.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome da Marca / Fantasia</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" value={data.brand_name} onChange={e=>setData({...data, brand_name: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>CNPJ</Label>
          <div className="relative">
            <Hash className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" value={data.cnpj} onChange={e=>setData({...data, cnpj: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Endereço Completo</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" value={data.address} onChange={e=>setData({...data, address: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fabricado por:</Label>
          <Input value={data.fabricante} onChange={e=>setData({...data, fabricante: e.target.value})} placeholder="Razão social do fabricante" />
        </div>
        <div className="space-y-2">
          <Label>Distribuído por:</Label>
          <Input value={data.distribuidor} onChange={e=>setData({...data, distribuidor: e.target.value})} placeholder="Razão social do distribuidor" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>SAC / Atendimento</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" value={data.sac} onChange={e=>setData({...data, sac: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" value={data.website} onChange={e=>setData({...data, website: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <Label>Responsável Técnico</Label>
          <Input value={data.responsavel_tecnico} onChange={e=>setData({...data, responsavel_tecnico: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>CRF / Registro</Label>
          <Input value={data.crf} onChange={e=>setData({...data, crf: e.target.value})} />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button size="lg" onClick={save} disabled={saving} className="bg-gradient-canva shadow-glow min-w-[200px]">
          <Save className="w-5 h-5 mr-2" />
          {saving ? "Salvando..." : "Salvar e Continuar"}
        </Button>
      </div>
    </div>
  );
}
