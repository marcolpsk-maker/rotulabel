import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditorStore, CM_TO_PX } from '../store/editorStore';
import CanvasEditor from '../components/editor/CanvasEditor';
import LeftPanel from '../components/editor/LeftPanel';
import RightPanel from '../components/editor/RightPanel';
import TopToolbar from '../components/editor/TopToolbar';
import { trpc } from '../lib/trpc';
import { toast } from 'sonner';

export default function Editor() {
  const { project, undo, redo } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const saveProject = trpc.projects.save.useMutation({
    onSuccess: () => {
      toast.success('Projeto salvo com sucesso!');
      setIsSaving(false);
    },
    onError: (err) => {
      toast.error('Erro ao salvar: ' + err.message);
      setIsSaving(false);
    },
  });

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    saveProject.mutate({
      id: project.id ?? undefined,
      name: project.name,
      data: JSON.stringify(project),
    });
  }, [project, saveProject]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const Konva = (await import('konva')).default;
      const stages = Konva.stages;
      if (!stages || stages.length === 0) {
        toast.error('Canvas não encontrado.');
        setIsExporting(false);
        return;
      }
      const stage = stages[0];
      const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
      const widthPx = project.widthCm * CM_TO_PX;
      const heightPx = project.heightCm * CM_TO_PX;
      stage.scale({ x: 1, y: 1 });
      stage.size({ width: widthPx, height: heightPx });
      const dataUrl = stage.toDataURL({ pixelRatio: 3 });
      stage.scale(originalScale);
      stage.size({ width: widthPx * originalScale.x, height: heightPx * originalScale.y });

      const pdf = new jsPDF({
        orientation: project.widthCm > project.heightCm ? 'landscape' : 'portrait',
        unit: 'cm',
        format: [project.widthCm, project.heightCm],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, project.widthCm, project.heightCm);
      pdf.save(`${project.name.replace(/\s+/g, '_')}_rotulabel.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Erro na exportação. Tente novamente.');
    }
    setIsExporting(false);
  }, [project]);

  const handleExportPNG = useCallback(async () => {
    setIsExporting(true);
    try {
      const Konva = (await import('konva')).default;
      const stages = Konva.stages;
      if (!stages || stages.length === 0) {
        toast.error('Canvas não encontrado.');
        setIsExporting(false);
        return;
      }
      const stage = stages[0];
      const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
      const widthPx = project.widthCm * CM_TO_PX;
      const heightPx = project.heightCm * CM_TO_PX;
      stage.scale({ x: 1, y: 1 });
      stage.size({ width: widthPx, height: heightPx });
      const dataUrl = stage.toDataURL({ pixelRatio: 3, mimeType: 'image/png' });
      stage.scale(originalScale);
      stage.size({ width: widthPx * originalScale.x, height: heightPx * originalScale.y });

      const link = document.createElement('a');
      link.download = `${project.name.replace(/\s+/g, '_')}_rotulabel.png`;
      link.href = dataUrl;
      link.click();
      toast.success('PNG exportado com sucesso!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Erro na exportação. Tente novamente.');
    }
    setIsExporting(false);
  }, [project]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault(); redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <TopToolbar
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
        onSave={handleSave}
        isSaving={isSaving || isExporting}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <CanvasEditor />
        <RightPanel />
      </div>
    </div>
  );
}
