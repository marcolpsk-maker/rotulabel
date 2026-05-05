import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import LeftPanel from "@/editor/LeftPanel";
import RightPanel from "@/editor/RightPanel";
import CanvasStage from "@/editor/CanvasStage";
import LayersPanel from "@/editor/LayersPanel";
import { useEditorState } from "@/editor/useEditorState";
import { AnyEl, PRINT_PX_PER_CM, PX_PER_CM } from "@/editor/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Save, Download,
  ChevronLeft, Layers, Grid3x3, Maximize2
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import Konva from "konva";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();
  const stageRef = useRef<Konva.Stage | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const toggleVisibility = (id: string) =>
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const ed = useEditorState([]);

  // Load project
  useEffect(() => {
    if (!id) return;
    supabase.from("label_projects").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error || !data) { toast.error("Projeto não encontrado"); nav("/dashboard"); return; }
      setProject(data);
      const els = (data.canvas_data as any)?.elements ?? [];
      ed.setElements(els);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const widthPx = useMemo(() => (project?.width_cm ?? 15) * PX_PER_CM, [project]);
  const heightPx = useMemo(() => (project?.height_cm ?? 5) * PX_PER_CM, [project]);

  // Auto fit-to-screen when project loads
  useEffect(() => {
    if (!project) return;
    const avW = window.innerWidth - 580 - 96;
    const avH = window.innerHeight - 108;
    const fitZoom = Math.min(avW / widthPx, avH / heightPx, 1.5);
    setZoom(Math.max(0.1, Math.round(fitZoom * 10) / 10));
  }, [project, widthPx, heightPx]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? ed.redo() : ed.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); ed.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") { e.preventDefault(); if (ed.selectedId) ed.duplicate(ed.selectedId); }
      if ((e.key === "Delete" || e.key === "Backspace") && ed.selectedId) ed.remove(ed.selectedId);
      if (e.key === "Escape") ed.setSelectedId(null);
      // Nudge with arrow keys
      if (ed.selectedId && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const el = ed.elements.find(x => x.id === ed.selectedId);
        if (!el) return;
        const dx = e.key === "ArrowLeft" ? -delta : e.key === "ArrowRight" ? delta : 0;
        const dy = e.key === "ArrowUp" ? -delta : e.key === "ArrowDown" ? delta : 0;
        ed.update(ed.selectedId, { x: el.x + dx, y: el.y + dy });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed]);

  const selected = ed.elements.find(e => e.id === ed.selectedId) ?? null;

  const save = async () => {
    if (!project) return;
    setSaving(true);
    let thumbnail: string | undefined;
    try { thumbnail = stageRef.current?.toDataURL({ pixelRatio: 0.4, mimeType: "image/jpeg", quality: 0.8 }); } catch {}
    const { error } = await supabase.from("label_projects").update({
      canvas_data: { elements: ed.elements } as any,
      thumbnail,
    }).eq("id", project.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Projeto salvo!");
  };

  const exportPNG = () => {
    if (!stageRef.current) return;
    const ratio = PRINT_PX_PER_CM / PX_PER_CM / zoom;
    const url = stageRef.current.toDataURL({ pixelRatio: ratio, mimeType: "image/png" });
    const a = document.createElement("a");
    a.href = url; a.download = `${project?.name ?? "rotulo"}.png`; a.click();
    toast.success("PNG exportado em 300dpi!");
  };

  const exportPDF = () => {
    if (!stageRef.current || !project) return;
    const ratio = PRINT_PX_PER_CM / PX_PER_CM / zoom;
    const url = stageRef.current.toDataURL({ pixelRatio: ratio, mimeType: "image/png" });
    const pdf = new jsPDF({
      unit: "cm",
      format: [project.width_cm, project.height_cm],
      orientation: project.width_cm > project.height_cm ? "l" : "p",
    });
    pdf.addImage(url, "PNG", 0, 0, project.width_cm, project.height_cm);
    pdf.save(`${project.name ?? "rotulo"}.pdf`);
    toast.success("PDF exportado para gráfica!");
  };

  const fitToScreen = () => {
    const avW = window.innerWidth - 580 - 96;
    const avH = window.innerHeight - 108;
    const fitZoom = Math.min(avW / widthPx, avH / heightPx, 1.5);
    setZoom(Math.max(0.1, Math.round(fitZoom * 10) / 10));
  };

  const onAdd = (el: any) => {
    if (el.type === "image" && el.src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = el.src;
      img.onload = () => {
        const max = Math.min(widthPx * 0.5, 300);
        const r = Math.min(max / img.width, max / img.height, 1);
        ed.add({ ...el, width: img.width * r, height: img.height * r });
      };
    } else {
      ed.add(el);
    }
  };

  const onLoadTemplate = (els: any[]) => {
    ed.setElements(els);
    toast.success("Template carregado!");
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-canva animate-pulse"/>
          <p className="text-muted-foreground text-sm">Carregando editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── TOP BAR ── */}
      <header className="h-12 flex items-center gap-2 px-3 border-b border-border bg-card shrink-0">
        {/* Back + project name */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => nav("/dashboard")}>
          <ChevronLeft className="w-4 h-4"/>
        </Button>
        <Input
          value={project.name}
          onChange={e => setProject({ ...project, name: e.target.value })}
          onBlur={async () => { await supabase.from("label_projects").update({ name: project.name }).eq("id", project.id); }}
          className="w-44 h-8 text-sm font-semibold border-none focus-visible:ring-1 bg-transparent"
        />
        <span className="text-[10px] text-muted-foreground font-mono">
          {project.width_cm} × {project.height_cm} cm
        </span>

        <div className="flex-1"/>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/40">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={ed.undo} disabled={!ed.canUndo} title="Desfazer (Ctrl+Z)">
            <Undo2 className="w-3.5 h-3.5"/>
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={ed.redo} disabled={!ed.canRedo} title="Refazer (Ctrl+Y)">
            <Redo2 className="w-3.5 h-3.5"/>
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/40">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.1, +(z - 0.1).toFixed(1)))}>
            <ZoomOut className="w-3.5 h-3.5"/>
          </Button>
          <button
            onClick={fitToScreen}
            className="text-[11px] font-mono font-bold w-10 text-center hover:text-primary transition-colors"
            title="Ajustar à tela"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(1)))}>
            <ZoomIn className="w-3.5 h-3.5"/>
          </Button>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/40">
          <Button
            size="icon" variant={showZones ? "default" : "ghost"}
            className="h-7 w-7" onClick={() => setShowZones(v => !v)}
            title="Guias de zona (3 colunas)"
          >
            <Grid3x3 className="w-3.5 h-3.5"/>
          </Button>
          <Button
            size="icon" variant={showLayers ? "default" : "ghost"}
            className="h-7 w-7" onClick={() => setShowLayers(v => !v)}
            title="Painel de Camadas"
          >
            <Layers className="w-3.5 h-3.5"/>
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={fitToScreen} title="Ajustar à tela">
            <Maximize2 className="w-3.5 h-3.5"/>
          </Button>
        </div>

        <div className="w-px h-5 bg-border"/>

        {/* Save + Export */}
        <Button size="sm" variant="outline" onClick={save} disabled={saving} className="h-8 gap-1.5">
          <Save className="w-3.5 h-3.5"/>
          {saving ? "Salvando…" : "Salvar"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 bg-gradient-canva shadow-glow border-none">
              <Download className="w-3.5 h-3.5"/>Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuItem onClick={exportPDF} className="gap-2">
              <span className="text-base">📄</span> PDF para gráfica (300dpi)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportPNG} className="gap-2">
              <span className="text-base">🖼️</span> PNG alta resolução
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── EDITOR BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left panel */}
        <LeftPanel
          onAdd={onAdd}
          onLoadTemplate={onLoadTemplate}
          canvasW={widthPx}
          canvasH={heightPx}
        />

        {/* Center: canvas + layers */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main
            ref={canvasWrapRef}
            className="flex-1 canvas-bg overflow-auto flex items-center justify-center"
            style={{ padding: "48px 64px" }}
          >
            <div className="relative group">
              {/* Size label */}
              <div className="absolute -top-7 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/40">
                  {project.width_cm} × {project.height_cm} cm · {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Canvas */}
              <div
                className="shadow-2xl ring-1 ring-black/10"
                style={{ borderRadius: 2 }}
              >
                <CanvasStage
                  width={widthPx}
                  height={heightPx}
                  scale={zoom}
                  elements={ed.elements.filter(e => !hiddenIds.has(e.id))}
                  selectedId={ed.selectedId}
                  onSelect={ed.setSelectedId}
                  onChange={ed.update}
                  stageRef={stageRef}
                  showZoneGuides={showZones}
                />
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[9px] text-muted-foreground/60">
                  Del · Ctrl+Z · Ctrl+D · Setas para mover
                </span>
              </div>
            </div>
          </main>

          {/* Layers panel — slide up from bottom */}
          <div className={cn(
            "border-t border-border bg-card transition-all duration-200 overflow-hidden shrink-0",
            showLayers ? "h-56" : "h-0"
          )}>
            <LayersPanel
              elements={ed.elements}
              selectedId={ed.selectedId}
              onSelect={ed.setSelectedId}
              onRemove={ed.remove}
              onReorder={ed.reorder}
              onToggleVisibility={toggleVisibility}
              hiddenIds={hiddenIds}
            />
          </div>
        </div>

        {/* Right panel */}
        <RightPanel
          el={selected}
          onChange={p => ed.selectedId && ed.update(ed.selectedId, p)}
          onRemove={() => ed.selectedId && ed.remove(ed.selectedId)}
          onDuplicate={() => ed.selectedId && ed.duplicate(ed.selectedId)}
          onReorder={d => ed.selectedId && ed.reorder(ed.selectedId, d)}
        />
      </div>
    </div>
  );
}
