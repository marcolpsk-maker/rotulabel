import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Pill, Droplet, FlaskConical, Package,
  Trash2, Copy, Pencil, Search, SortAsc, SortDesc, LayoutGrid, List
} from "lucide-react";
import NewProjectDialog from "@/components/NewProjectDialog";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const productIcons: Record<string, any> = {
  capsula: Pill, po: Package, liquido: Droplet, gel: FlaskConical,
};

type SortKey = "updated_at" | "created_at" | "name";
type ViewMode = "grid" | "list";

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("label_projects")
      .select("*")
      .order(sortKey, { ascending: sortAsc });
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user, sortKey, sortAsc]);

  const filtered = useMemo(() =>
    projects.filter(p => p.name?.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const remove = async (id: string) => {
    if (!confirm("Excluir este rótulo permanentemente?")) return;
    const { error } = await supabase.from("label_projects").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Rótulo excluído"); load(); }
  };

  const duplicate = async (p: any) => {
    const { data, error } = await supabase.from("label_projects").insert([{
      user_id: user?.id,
      name: `${p.name} (cópia)`,
      width_cm: p.width_cm,
      height_cm: p.height_cm,
      product_type: p.product_type,
      canvas_data: p.canvas_data,
      thumbnail: p.thumbnail,
    }]).select().single();
    if (error) toast.error(error.message);
    else { toast.success("Projeto duplicado!"); load(); }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <main className="container mx-auto px-6 py-10 max-w-7xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Meus Rótulos</h1>
            <p className="text-muted-foreground mt-1">
              {filtered.length} {filtered.length === 1 ? "rótulo" : "rótulos"}
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-gradient-canva shadow-glow gap-2">
            <Plus className="w-4 h-4" /> Novo rótulo
          </Button>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar rótulo…"
              className="pl-9 h-9"
            />
          </div>

          <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Atualizado em</SelectItem>
              <SelectItem value="created_at">Criado em</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
            onClick={() => setSortAsc(v => !v)} title={sortAsc ? "Ascendente" : "Descendente"}>
            {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>

          <div className="flex border border-border rounded-lg overflow-hidden h-9">
            <button onClick={() => setViewMode("grid")}
              className={cn("px-3 flex items-center", viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={cn("px-3 flex items-center border-l border-border", viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[3/2] bg-muted rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-canva flex items-center justify-center shadow-glow mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display font-bold text-xl">
              {search ? "Nenhum rótulo encontrado" : "Nenhum rótulo ainda"}
            </h3>
            <p className="text-muted-foreground mt-1 mb-6">
              {search ? `Nenhum resultado para "${search}"` : "Comece criando seu primeiro rótulo profissional."}
            </p>
            {!search && (
              <Button onClick={() => setOpen(true)} className="bg-gradient-canva shadow-glow">
                Criar primeiro rótulo
              </Button>
            )}
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p}
                onOpen={() => nav(`/editor/${p.id}`)}
                onDuplicate={() => duplicate(p)}
                onDelete={() => remove(p.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <ProjectRow key={p.id} project={p}
                onOpen={() => nav(`/editor/${p.id}`)}
                onDuplicate={() => duplicate(p)}
                onDelete={() => remove(p.id)} />
            ))}
          </div>
        )}
      </main>
      <NewProjectDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

// ─── Card View ────────────────────────────────────────────────────────────────
function ProjectCard({ project: p, onOpen, onDuplicate, onDelete }: {
  project: any; onOpen: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const Icon = productIcons[p.product_type] ?? Package;
  return (
    <Card
      className="group overflow-hidden hover:shadow-elevated transition-all duration-200 cursor-pointer border-border/60 hover:border-primary/30"
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div className="aspect-[3/2] bg-gradient-soft relative flex items-center justify-center border-b overflow-hidden">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
            <Icon className="w-10 h-10" />
            <span className="text-[10px] font-mono">{p.width_cm} × {p.height_cm} cm</span>
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onDuplicate(); }}
            className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
            title="Duplicar">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
            title="Excluir">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Size badge */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-mono bg-background/80 backdrop-blur px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground">
            {p.width_cm} × {p.height_cm} cm
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <h3 className="font-semibold truncate text-sm">{p.name}</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </Card>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function ProjectRow({ project: p, onOpen, onDuplicate, onDelete }: {
  project: any; onOpen: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const Icon = productIcons[p.product_type] ?? Package;
  return (
    <div
      onClick={onOpen}
      className="flex items-center gap-4 p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/2 bg-card cursor-pointer transition-all group"
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg bg-muted/40 shrink-0 flex items-center justify-center overflow-hidden border border-border/40">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain" />
        ) : (
          <Icon className="w-6 h-6 text-muted-foreground/30" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{p.name}</p>
        <p className="text-[11px] text-muted-foreground">{p.width_cm} × {p.height_cm} cm</p>
      </div>

      <p className="text-[11px] text-muted-foreground hidden sm:block shrink-0">
        {format(new Date(p.updated_at), "dd/MM/yyyy HH:mm")}
      </p>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={e => { e.stopPropagation(); onOpen(); }}
          className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition" title="Editar">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={e => { e.stopPropagation(); onDuplicate(); }}
          className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition" title="Duplicar">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition" title="Excluir">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
