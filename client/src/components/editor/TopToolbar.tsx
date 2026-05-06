import { useState } from 'react';
import { Link } from 'wouter';
import { useEditorStore, CM_TO_PX } from '../../store/editorStore';
import AnvisaModal from './AnvisaModal';

export interface TopToolbarProps {
  onExportPDF: () => void;
  onExportPNG: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function TopToolbar({ onExportPDF, onExportPNG, onSave, isSaving }: TopToolbarProps) {
  const { project, setProject, zoom, setZoom, undo, redo, historyIndex, history, addElement } = useEditorStore();
  const [showAnvisa, setShowAnvisa] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleAddBarcode = () => {
    // Auto-position no painel direito (estilo padrão do template)
    const widthPx = project.widthCm * CM_TO_PX;
    const x = Math.max(20, widthPx - 150);
    const y = 30;
    addElement({
      id: `el_${Date.now()}`, type: 'barcode',
      x, y, width: 130, height: 50,
      barcodeValue: '7891234567890', text: '7891234567890',
      fill: '#0f172a', opacity: 1, visible: true,
    });
  };

  const btn = "p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all";

  return (
    <>
      <div className="h-12 border-b border-slate-200 bg-white flex items-center px-2 sm:px-3 gap-1 sm:gap-2 shrink-0 z-10 shadow-sm text-slate-700 overflow-x-auto">
        <Link href="/" className="flex items-center gap-1.5 mr-1 no-underline">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-bold text-slate-900 text-sm hidden md:block">Rotulabel</span>
        </Link>

        <input
          type="text"
          value={project.name}
          onChange={(e) => setProject({ name: e.target.value })}
          className="text-sm font-medium text-slate-800 border border-transparent rounded px-2 py-1 min-w-0 w-28 sm:w-36 hover:border-slate-200 focus:border-violet-400 focus:outline-none bg-transparent hover:bg-slate-50 focus:bg-white"
        />

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        <button onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)" className={btn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
        <button onClick={redo} disabled={!canRedo} title="Refazer" className={btn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Quick size editor */}
        <div className="hidden md:flex items-center gap-1 text-xs">
          <span className="text-slate-400">Medida:</span>
          <input type="number" step="0.1" value={project.widthCm}
            onChange={e => setProject({ widthCm: Number(e.target.value) || 1 })}
            className="w-12 border border-slate-200 rounded px-1 py-0.5 text-xs outline-none focus:border-violet-400" />
          <span className="text-slate-400">×</span>
          <input type="number" step="0.1" value={project.heightCm}
            onChange={e => setProject({ heightCm: Number(e.target.value) || 1 })}
            className="w-12 border border-slate-200 rounded px-1 py-0.5 text-xs outline-none focus:border-violet-400" />
          <span className="text-slate-400">cm</span>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5 hidden md:block" />

        <button onClick={() => setShowAnvisa(true)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span className="hidden lg:inline">ANVISA</span>
        </button>

        <button onClick={handleAddBarcode}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v14"/></svg>
          <span className="hidden lg:inline">Cód. barras</span>
        </button>

        <div className="flex items-center gap-0.5 ml-auto">
          <button onClick={() => setZoom(Math.max(0.25, parseFloat((zoom - 0.1).toFixed(2))))} className={btn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>
          </button>
          <select value={zoom} onChange={e => setZoom(Number(e.target.value))}
            className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-violet-400 w-16">
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(z => (<option key={z} value={z}>{Math.round(z * 100)}%</option>))}
          </select>
          <button onClick={() => setZoom(Math.min(3, parseFloat((zoom + 0.1).toFixed(2))))} className={btn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        <button onClick={onSave} disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          <span className="hidden md:inline">{isSaving ? 'Salvando...' : 'Salvar'}</span>
        </button>

        <div className="relative">
          <button onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/30 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Exportar</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 min-w-40 py-1">
              <button onClick={() => { onExportPDF(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">PDF</button>
              <button onClick={() => { onExportPNG(); setShowExportMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">PNG</button>
            </div>
          )}
        </div>

        <Link href="/projects" className="no-underline hidden md:block">
          <button className="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Meus projetos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
        </Link>
      </div>

      {showAnvisa && <AnvisaModal onClose={() => setShowAnvisa(false)} />}
    </>
  );
}
