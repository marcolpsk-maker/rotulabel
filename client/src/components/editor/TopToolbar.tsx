import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

interface TopToolbarProps {
  onExportPDF: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export default function TopToolbar({ onExportPDF, onSave, isSaving }: TopToolbarProps) {
  const { project, zoom, setZoom, undo, redo, toggleGrid, showGrid, historyIndex, history, setProject } = useEditorStore();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(project.name);

  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleNameSubmit = () => {
    setProject({ name: nameValue });
    setEditingName(false);
  };

  return (
    <div className="h-12 bg-[#1a1a2e] border-b border-[#2d2d3d] flex items-center px-4 gap-3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center">
          <span className="text-white font-bold text-xs">R</span>
        </div>
        <span className="text-white font-bold text-sm hidden md:block">Rotulabel</span>
      </div>

      <div className="w-px h-6 bg-[#2d2d3d]" />

      {/* Project name */}
      <div className="flex items-center">
        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
            className="bg-[#252535] border border-[#7c3aed] rounded px-2 py-0.5 text-sm text-white outline-none w-40"
          />
        ) : (
          <button
            onClick={() => { setNameValue(project.name); setEditingName(true); }}
            className="text-sm text-[#e2e8f0] hover:text-white transition-colors truncate max-w-40"
            title="Clique para renomear"
          >
            {project.name}
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-[#2d2d3d]" />

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Desfazer (Ctrl+Z)"
          className="p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#252535] disabled:opacity-30 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Refazer (Ctrl+Y)"
          className="p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#252535] disabled:opacity-30 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-[#2d2d3d]" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          className="p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#252535] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/>
          </svg>
        </button>
        <select
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="bg-[#252535] border border-[#2d2d3d] rounded px-1 py-0.5 text-xs text-white outline-none focus:border-[#7c3aed]"
        >
          {zoomLevels.map(z => (
            <option key={z} value={z}>{Math.round(z * 100)}%</option>
          ))}
        </select>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          className="p-1.5 rounded text-[#64748b] hover:text-white hover:bg-[#252535] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-[#2d2d3d]" />

      {/* Grid toggle */}
      <button
        onClick={toggleGrid}
        title="Mostrar/ocultar grade"
        className={`p-1.5 rounded transition-all ${showGrid ? 'text-[#7c3aed] bg-[#7c3aed]/20' : 'text-[#64748b] hover:text-white hover:bg-[#252535]'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      </button>

      {/* Canvas size info */}
      <div className="text-xs text-[#64748b] hidden lg:block">
        {project.width} × {project.height}px
      </div>

      <div className="flex-1" />

      {/* Action buttons */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252535] hover:bg-[#2d2d3d] border border-[#2d2d3d] rounded text-xs text-[#94a3b8] hover:text-white transition-all disabled:opacity-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
        {isSaving ? 'Salvando...' : 'Salvar'}
      </button>

      <button
        onClick={onExportPDF}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#6d28d9] hover:to-[#5b21b6] rounded text-xs text-white font-medium transition-all shadow-lg shadow-[#7c3aed]/25"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Exportar PDF
      </button>
    </div>
  );
}
