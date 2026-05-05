import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import LeftPanel from "@/editor/LeftPanel";
import RightPanel from "@/editor/RightPanel";
import CanvasStage from "@/editor/CanvasStage";
import LayersPanel from "@/editor/LayersPanel";
import InlineTextEditor from "@/editor/InlineTextEditor";
import { useEditorState } from "@/editor/useEditorState";
import { useFonts, ALL_GOOGLE_FONTS } from "@/editor/useFonts";
import { AnyEl, PX_PER_CM, TextEl } from "@/editor/types";
import { exportToPDF, exportToPNG, exportToJPG, generateThumbnail } from "@/editor/ExportEngine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Save, Download,
  ChevronLeft, Layers, Grid3x3, Maximize2, Clock
} from "lucide-react";
import { toast } from "sonner";
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
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showZones, setShowZones] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [editingText, setEditingText] = useState<(TextEl & { id: string }) | null>(null);

  // Pre-load all Google Fonts on mount
  useFonts(ALL_GOOGLE_FONTS);

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
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        ed.elements.forEach(el => ed.toggleSelect(el.id));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (ed.selectedId) ed.duplicate(ed.selectedId);
      }
      // Delete: remove all selected or just focused element
      if (e.key === "Delete" || e.key === "Backspace") {
        if (ed.selectedIds.length > 1) ed.removeSelected();
        else if (ed.selectedId) ed.remove(ed.selectedId);
      }
      if (e.key === "Escape") ed.clearSelection();
      // Arrow nudge (single element)
      if (ed.selectedId && ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        const el = ed.elements.find(x => x.id === ed.selectedId);
        if (!el) return;
        const dx = e.key === "ArrowLeft" ? -delta : e.key === "ArrowRight" ? delta : 0;
        const dy = e.key === "ArrowUp"   ? -delta : e.key === "ArrowDown"  ? delta : 0;
        ed.update(ed.selectedId, { x: el.x + dx, y: el.y + dy });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!project) return;
    const t = setInterval(() => { save(); }, 30_000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, ed.elements]);

  const selected = ed.elements.find(e => e.id === ed.selectedId) ?? null;

  // HTML5 drag from LeftPanel → canvas: create element at drop position
  const onDropAsset = (type: string, data: any, x: number, y: number) => {
    if (type === "image" && data.src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.src;
      img.onload = () => {
        const max = Math.min(widthPx * 0.5, 300);
        const r = Math.min(max / img.width, max / img.height, 1);
        ed.add({ ...data, type, x, y, width: img.width * r, height: img.height * r });
      };
    } else {
      ed.add({ ...data, type, x, y });
    }
  };

  const save = async () => {
    if (!project) return;
    setSaving(true);
    const thumbnail = stageRef.current ? generateThumbnail(stageRef.current) : undefined;
    const { error } = await supabase.from("label_projects").update({
      canvas_data: { elements: ed.elements } as any,
      thumbnail,
    }).eq("id", project.id);
    setSaving(false);
    if (error) { toast.error(error.message); }
    else { setSavedAt(new Date()); toast.success("Projeto salvo!"); }
  };

  const handleExportPNG = async () => {
    if (!stageRef.current) return;
    try { await exportToPNG(stageRef.current); toast.success("PNG 300dpi exportado!"); }
    catch (e) { toast.error("Erro ao exportar PNG"); }
  };

  const handleExportJPG = async () => {
    if (!stageRef.current) return;
    try { await exportToJPG(stageRef.current); toast.success("JPG 300dpi exportado!"); }
    catch (e) { toast.error("Erro ao exportar JPG"); }
  };

  const handleExportPDF = async () => {
    if (!stageRef.current || !project) return;
    try {
      await exportToPDF(stageRef.current, widthPx, heightPx, { dpi: 300, bleedMm: 3, cropMarks: true });
      toast.success("PDF para gráfica exportado! (300dpi + marcas de corte)");
    } catch (e) { toast.error("Erro ao exportar PDF"); }
  };

  // Double-click: open inline text editor
  const handleDblClick = (id: string) => {
    const el = ed.elements.find(e => e.id === id);
    if (el?.type === "text") setEditingText(el as TextEl & { id: string });
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
          <Button
            size="icon" variant={snapEnabled ? "default" : "ghost"}
            className="h-7 w-7" onClick={() => setSnapEnabled(v => !v)}
            title={snapEnabled ? "Snap ativado (5px)" : "Snap desativado"}
          >
            <span className="text-[10px] font-black">⊞</span>
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={fitToScreen} title="Ajustar à tela">
            <Maximize2 className="w-3.5 h-3.5"/>
          </Button>
        </div>

        <div className="w-px h-5 bg-border"/>

        {/* Save + Export */}
        <div className="flex items-center gap-1.5">
          {savedAt && !saving && (
            <span className="text-[9px] text-muted-foreground/60 flex items-center gap-1" title={`Salvo às ${savedAt.toLocaleTimeString()}`}>
              <Clock className="w-3 h-3"/>
              {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button size="sm" variant="outline" onClick={save} disabled={saving} className="h-8 gap-1.5">
            <Save className="w-3.5 h-3.5"/>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 bg-gradient-canva shadow-glow border-none">
              <Download className="w-3.5 h-3.5"/>Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px]">
            <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
              <span className="text-base">📄</span>
              <div>
                <p className="text-xs font-semibold">PDF para gráfica</p>
                <p className="text-[10px] text-muted-foreground">300dpi + marcas de corte + bleed 3mm</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPNG} className="gap-2">
              <span className="text-base">🖼️</span>
              <div>
                <p className="text-xs font-semibold">PNG 300 DPI</p>
                <p className="text-[10px] text-muted-foreground">Alta resolução, fundo transparente</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJPG} className="gap-2">
              <span className="text-base">🎨</span>
              <div>
                <p className="text-xs font-semibold">JPG 300 DPI</p>
                <p className="text-[10px] text-muted-foreground">Ideal para visualização e envio</p>
              </div>
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
                  setScale={setZoom}
                  elements={ed.elements.filter(e => !hiddenIds.has(e.id))}
                  selectedId={ed.selectedId}
                  selectedIds={ed.selectedIds}
                  onSelect={ed.setSelectedId}
                  onToggleSelect={ed.toggleSelect}
                  onClearSelection={ed.clearSelection}
                  onChange={ed.update}
                  onDblClick={handleDblClick}
                  stageRef={stageRef}
                  showZoneGuides={showZones}
                  snapEnabled={snapEnabled}
                  onDropAsset={onDropAsset}
                />
                {/* Inline text editor overlay */}
                <InlineTextEditor
                  editing={editingText}
                  stageRef={stageRef}
                  zoom={zoom}
                  onChange={(id, text) => ed.update(id, { text } as any)}
                  onClose={() => setEditingText(null)}
                />
              </div>

              <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[9px] text-muted-foreground/60">
                  Del · Ctrl+Z/Y · Ctrl+D · Setas · {snapEnabled ? "Snap ✓" : "Snap off"}
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
