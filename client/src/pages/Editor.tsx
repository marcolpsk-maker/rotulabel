import { useRef, useCallback, useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
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
  const stageContainerRef = useRef<HTMLDivElement>(null);

  const saveProject = trpc.projects.save.useMutation({
    onSuccess: () => {
      toast.success('Projeto salvo! Seu rótulo foi salvo com sucesso.');
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
      id: project.id,
      name: project.name,
      data: JSON.stringify(project),
    });
  }, [project, saveProject]);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const Konva = (await import('konva')).default;

      // Find the Konva stage
      const stages = Konva.stages;
      if (!stages || stages.length === 0) {
        toast.error('Canvas não encontrado.');
        setIsExporting(false);
        return;
      }

      const stage = stages[0];
      const originalScale = { x: stage.scaleX(), y: stage.scaleY() };

      // Export at 1:1 scale for quality
      stage.scale({ x: 1, y: 1 });
      stage.size({ width: project.width, height: project.height });

      const dataUrl = stage.toDataURL({ pixelRatio: 2 });

      // Restore scale
      stage.scale(originalScale);
      stage.size({ width: project.width * originalScale.x, height: project.height * originalScale.y });

      // Create PDF
      const pdf = new jsPDF({
        orientation: project.width > project.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [project.width * 0.264583, project.height * 0.264583], // px to mm
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, project.width * 0.264583, project.height * 0.264583);
      pdf.save(`${project.name.replace(/\s+/g, '_')}_rotulabel.pdf`);

      toast.success('PDF exportado! Arquivo salvo com sucesso.');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Erro na exportação. Tente novamente.');
    }
    setIsExporting(false);
  }, [project]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, handleSave]);

  return (
    <div className="flex flex-col h-screen bg-[#141414] overflow-hidden">
      <TopToolbar
        onExportPDF={handleExportPDF}
        onSave={handleSave}
        isSaving={isSaving || isExporting}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <div ref={stageContainerRef} className="flex-1 overflow-hidden">
          <CanvasEditor />
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
