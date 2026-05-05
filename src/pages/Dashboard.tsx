import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pill, Droplet, FlaskConical, Package, Trash2 } from "lucide-react";
import NewProjectDialog from "@/components/NewProjectDialog";
import { toast } from "sonner";
import { format } from "date-fns";

const productIcons: Record<string, any> = {
  capsula: Pill, po: Package, liquido: Droplet, gel: FlaskConical,
};

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("label_projects").select("*").order("updated_at", { ascending: false });
    setProjects(data ?? []); setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm("Excluir este rótulo?")) return;
    const { error } = await supabase.from("label_projects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader/>
      <main className="container mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Meus rótulos</h1>
            <p className="text-muted-foreground mt-1">Crie, edite e exporte seus rótulos para impressão.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-gradient-canva shadow-glow"><Plus className="w-4 h-4 mr-1.5"/>Novo rótulo</Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Carregando…</div>
        ) : projects.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-canva flex items-center justify-center shadow-glow mb-4">
              <Plus className="w-8 h-8 text-white"/>
            </div>
            <h3 className="font-display font-bold text-xl">Nenhum rótulo ainda</h3>
            <p className="text-muted-foreground mt-1 mb-6">Comece criando seu primeiro rótulo profissional.</p>
            <Button onClick={() => setOpen(true)} className="bg-gradient-canva shadow-glow">Criar primeiro rótulo</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map(p => {
              const Icon = productIcons[p.product_type] ?? Package;
              return (
                <Card key={p.id} className="group overflow-hidden hover:shadow-elevated transition-all cursor-pointer border-border/60" onClick={() => nav(`/editor/${p.id}`)}>
                  <div className="aspect-[3/2] bg-gradient-soft relative flex items-center justify-center border-b">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain"/>
                    ) : (
                      <div className="text-muted-foreground text-xs font-mono">{p.width_cm} × {p.height_cm} cm</div>
                    )}
                    <button onClick={(e)=>{e.stopPropagation(); remove(p.id);}} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-card/90 backdrop-blur opacity-0 group-hover:opacity-100 flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary"/>
                      <h3 className="font-semibold truncate">{p.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Atualizado {format(new Date(p.updated_at), "dd/MM/yyyy")}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <NewProjectDialog open={open} onOpenChange={setOpen}/>
    </div>
  );
}
