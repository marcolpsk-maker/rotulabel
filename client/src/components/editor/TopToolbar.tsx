import { useState } from 'react';
import { Link } from 'wouter';
import { useEditorStore } from '../../store/editorStore';
import AnvisaModal from './AnvisaModal';

export interface TopToolbarProps {
  onExportPDF: () => void;
  onExportPNG: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function TopToolbar({ onExportPDF, onExportPNG, onSave, isSaving }: TopToolbarProps) {
  const { project, setProject, zoom, setZoom, undo, redo, historyIndex, history } = useEditorStore();
  const [showAnvisa, setShowAnvisa] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <div className="h-12 border-b border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 flex items-center px-2 sm:px-3 gap-1 sm:gap-2 shrink-0 z-10 shadow-md text-neutral-200 overflow-x-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 mr-1 no-underline">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-bold text-white text-sm hidden md:block">Rotulabel</span>
        </Link>

        {/* Project name */}
        <input
          type="text"
          value={project.name}
          onChange={(e) => setProject({ name: e.target.value })}
          className="text-sm font-medium text-neutral-200 border border-transparent rounded px-2 py-1 min-w-0 w-28 sm:w-36 hover:border-neutral-700 focus:border-violet-400 focus:outline-none bg-transparent hover:bg-neutral-800 focus:bg-neutral-900 transition-colors"
        />

        <div className="w-px h-5 bg-neutral-700 mx-0.5" />

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Refazer (Ctrl+Shift+Z)"
          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
        </button>

        <div className="w-px h-5 bg-neutral-700 mx-0.5" />

        {/* Tabela ANVISA */}
        <button
          onClick={() => setShowAnvisa(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          Tabela ANVISA
        </button>

        {/* Cód. barras */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
          onClick={() => {
            const { addElement } = useEditorStore.getState();
            addElement({
              id: `el_${Date.now()}`,
              type: 'barcode',
              x: 20, y: 20,
              width: 120, height: 60,
              barcodeValue: '7891234567890',
              text: '7891234567890',
            });
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v14"/>
          </svg>
          Cód. barras
        </button>

        {/* Zoom */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            onClick={() => setZoom(Math.max(0.25, parseFloat((zoom - 0.1).toFixed(2))))}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/>
            </svg>
          </button>
          <select
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="text-xs text-neutral-200 bg-neutral-900 border border-neutral-700 rounded px-1 py-0.5 outline-none focus:border-violet-400 w-16"
          >
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(z => (
              <option key={z} value={z}>{Math.round(z * 100)}%</option>
            ))}
          </select>
          <button
            onClick={() => setZoom(Math.min(3, parseFloat((zoom + 0.1).toFixed(2))))}
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
          </button>
        </div>

        <div className="w-px h-5 bg-neutral-700 mx-0.5" />

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-neutral-300 hover:bg-neutral-800 border border-neutral-700 transition-colors disabled:opacity-50"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-700 rounded-lg shadow-lg z-50 min-w-40 py-1">
              <button
                onClick={() => { onExportPDF(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                Exportar como PDF
              </button>
              <button
                onClick={() => { onExportPNG(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Exportar como PNG
              </button>
            </div>
          )}
        </div>

        {/* Projects link */}
        <Link href="/projects" className="no-underline">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-neutral-400 hover:bg-neutral-800 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span className="hidden sm:inline">Meus projetos</span>
          </button>
        </Link>
      </div>

      {showAnvisa && <AnvisaModal onClose={() => setShowAnvisa(false)} />}
    </>
  );
}
