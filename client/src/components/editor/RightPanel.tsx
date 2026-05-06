import { useEditorStore, BlendMode } from '../../store/editorStore';
import { FONTS } from '../../data/templates';

const GRADIENTS = [
  { name: 'Roxo', colors: ['#7c3aed', '#4c1d95'], direction: 135 },
  { name: 'Fogo', colors: ['#ef4444', '#7f1d1d'], direction: 135 },
  { name: 'Oceano', colors: ['#0ea5e9', '#1e3a5f'], direction: 135 },
  { name: 'Floresta', colors: ['#16a34a', '#14532d'], direction: 135 },
  { name: 'Dourado', colors: ['#d97706', '#78350f'], direction: 135 },
  { name: 'Rosa', colors: ['#db2777', '#831843'], direction: 135 },
  { name: 'Pôr do Sol', colors: ['#f97316', '#dc2626'], direction: 135 },
  { name: 'Noite', colors: ['#1e293b', '#0f172a'], direction: 135 },
  { name: 'Menta', colors: ['#10b981', '#065f46'], direction: 135 },
  { name: 'Lavanda', colors: ['#8b5cf6', '#6d28d9'], direction: 135 },
  { name: 'Ciano', colors: ['#06b6d4', '#164e63'], direction: 135 },
  { name: 'Carmim', colors: ['#e11d48', '#881337'], direction: 135 },
];

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

const inputCls = 'w-full border border-neutral-700 bg-neutral-900 rounded px-2 py-1.5 text-xs text-neutral-100 focus:border-violet-400 outline-none';
const labelCls = 'text-[10px] text-neutral-400 mb-0.5 block';
const sectionTitleCls = 'text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2';

export default function RightPanel() {
  const { project, selectedId, updateElement, deleteElement, bringForward, sendBackward, duplicateElement, commitHistory, toggleLock, removeBackground } = useEditorStore();
  const selectedEl = project.elements.find(el => el.id === selectedId);

  if (!selectedEl) {
    return (
      <div className="w-60 border-l border-neutral-800 bg-neutral-950 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-400">Propriedades</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-20 text-neutral-400">◻</div>
            <p className="text-xs text-neutral-500 leading-relaxed">Selecione um elemento no canvas para editar suas propriedades</p>
          </div>
        </div>
      </div>
    );
  }

  const update = (key: string, value: unknown) => updateElement(selectedEl.id, { [key]: value });
  const updateAndCommit = (key: string, value: unknown) => { updateElement(selectedEl.id, { [key]: value }); commitHistory(); };
  const updateFilter = (key: string, value: unknown) => updateElement(selectedEl.id, { filters: { ...(selectedEl.filters || {}), [key]: value } });

  const typeLabel: Record<string, string> = {
    rect: 'Retângulo', circle: 'Círculo', text: 'Texto',
    image: 'Imagem', badge: 'Badge', line: 'Linha',
    nutritionTable: 'Tabela', barcode: 'Cód. Barras', group: 'Grupo',
  };
  const label = typeLabel[selectedEl.type] || 'Elemento';

  const isText = selectedEl.type === 'text' || selectedEl.type === 'badge' || selectedEl.type === 'nutritionTable';
  const isShape = selectedEl.type === 'rect' || selectedEl.type === 'circle';

  return (
    <div className="w-60 border-l border-neutral-800 bg-neutral-950 flex flex-col h-full overflow-hidden text-neutral-100">
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold">{label}</h3>
        <div className="flex gap-1">
          <button onClick={() => toggleLock(selectedEl.id)} title="Bloquear" className={`p-1 transition-colors ${selectedEl.locked ? 'text-violet-400' : 'text-neutral-500 hover:text-neutral-200'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </button>
          <button onClick={() => duplicateElement(selectedEl.id)} title="Duplicar" className="p-1 text-neutral-500 hover:text-neutral-200">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button onClick={() => deleteElement(selectedEl.id)} title="Excluir" className="p-1 text-neutral-500 hover:text-red-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Position & Size */}
        <div>
          <p className={sectionTitleCls}>Posição & Tamanho</p>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelCls}>X</label><input type="number" value={Math.round(selectedEl.x)} onChange={e => updateAndCommit('x', Number(e.target.value))} className={inputCls} /></div>
            <div><label className={labelCls}>Y</label><input type="number" value={Math.round(selectedEl.y)} onChange={e => updateAndCommit('y', Number(e.target.value))} className={inputCls} /></div>
            {selectedEl.width !== undefined && <div><label className={labelCls}>L</label><input type="number" value={Math.round(selectedEl.width || 100)} onChange={e => updateAndCommit('width', Number(e.target.value))} className={inputCls} /></div>}
            {selectedEl.height !== undefined && <div><label className={labelCls}>A</label><input type="number" value={Math.round(selectedEl.height || 60)} onChange={e => updateAndCommit('height', Number(e.target.value))} className={inputCls} /></div>}
            <div><label className={labelCls}>Rotação</label><input type="number" value={Math.round(selectedEl.rotation || 0)} onChange={e => updateAndCommit('rotation', Number(e.target.value))} className={inputCls} /></div>
            <div><label className={labelCls}>Opacidade</label><input type="number" min="0" max="1" step="0.05" value={selectedEl.opacity ?? 1} onChange={e => update('opacity', Number(e.target.value))} className={inputCls} /></div>
          </div>
        </div>

        {/* Text */}
        {isText && (
          <div>
            <p className={sectionTitleCls}>Texto</p>
            <div className="space-y-2">
              <textarea value={selectedEl.text || ''} onChange={e => update('text', e.target.value)} onBlur={() => commitHistory()} rows={2} className={`${inputCls} resize-none`} />
              <div>
                <label className={labelCls}>Fonte</label>
                <select value={selectedEl.fontFamily || 'Inter'} onChange={e => updateAndCommit('fontFamily', e.target.value)} className={inputCls}>
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tamanho: {selectedEl.fontSize || 16}px</label>
                <input type="range" min="6" max="120" step="1" value={selectedEl.fontSize || 16} onChange={e => update('fontSize', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500" />
              </div>
              <div>
                <label className={labelCls}>Espaçamento entre letras: {selectedEl.letterSpacing || 0}</label>
                <input type="range" min="-5" max="20" step="0.5" value={selectedEl.letterSpacing || 0} onChange={e => update('letterSpacing', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500" />
              </div>
              <div className="flex gap-1">
                {(['normal', 'bold', 'italic', 'bold italic'] as const).map(style => (
                  <button key={style} onClick={() => updateAndCommit('fontStyle', style)} className={`flex-1 py-1 text-xs rounded border transition-colors ${selectedEl.fontStyle === style ? 'border-violet-400 bg-violet-900/30 text-violet-300' : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'}`}>
                    {style === 'normal' ? 'N' : style === 'bold' ? 'B' : style === 'italic' ? 'I' : 'BI'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button key={align} onClick={() => updateAndCommit('align', align)} className={`flex-1 py-1 text-xs rounded border transition-colors ${selectedEl.align === align ? 'border-violet-400 bg-violet-900/30 text-violet-300' : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'}`}>
                    {align === 'left' ? '⇤' : align === 'center' ? '☰' : '⇥'}
                  </button>
                ))}
              </div>

              {/* Outline */}
              <div className="pt-2 border-t border-neutral-800">
                <label className={labelCls}>Contorno (outline)</label>
                <div className="flex gap-2 items-center mb-1">
                  <input type="color" value={selectedEl.textStroke || '#000000'} onChange={e => update('textStroke', e.target.value)} onBlur={() => commitHistory()} className="w-8 h-8 rounded cursor-pointer border border-neutral-700 bg-transparent p-0.5" />
                  <input type="number" min="0" max="20" step="0.5" value={selectedEl.textStrokeWidth || 0} onChange={e => update('textStrokeWidth', Number(e.target.value))} onBlur={() => commitHistory()} placeholder="0" className={inputCls} />
                </div>
              </div>

              {/* Curve */}
              <div>
                <label className={labelCls}>Curvatura: {selectedEl.curve || 0}°</label>
                <input type="range" min="-180" max="180" step="5" value={selectedEl.curve || 0} onChange={e => update('curve', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500" />
              </div>
            </div>
          </div>
        )}

        {/* Fill */}
        {selectedEl.type !== 'image' && (
          <div>
            <p className={sectionTitleCls}>Cor</p>
            <div className="flex gap-2 items-center">
              <input type="color" value={selectedEl.fill || '#6366f1'} onChange={e => update('fill', e.target.value)} onBlur={() => commitHistory()} className="w-8 h-8 rounded cursor-pointer border border-neutral-700 bg-transparent p-0.5" />
              <input type="text" value={selectedEl.fill || '#6366f1'} onChange={e => update('fill', e.target.value)} onBlur={() => commitHistory()} className={`${inputCls} font-mono`} />
            </div>
          </div>
        )}

        {/* Stroke (shape) */}
        {selectedEl.type !== 'image' && !isText && (
          <div>
            <p className={sectionTitleCls}>Borda</p>
            <div className="flex gap-2 items-center mb-2">
              <input type="color" value={selectedEl.stroke || '#e2e8f0'} onChange={e => update('stroke', e.target.value)} onBlur={() => commitHistory()} className="w-8 h-8 rounded cursor-pointer border border-neutral-700 bg-transparent p-0.5" />
              <input type="text" value={selectedEl.stroke || ''} onChange={e => update('stroke', e.target.value)} onBlur={() => commitHistory()} placeholder="Sem borda" className={`${inputCls} font-mono`} />
            </div>
            <label className={labelCls}>Espessura: {selectedEl.strokeWidth || 0}px</label>
            <input type="range" min="0" max="20" step="1" value={selectedEl.strokeWidth || 0} onChange={e => update('strokeWidth', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500" />
          </div>
        )}

        {/* Corner */}
        {selectedEl.type === 'rect' && (
          <div>
            <label className={labelCls}>Arredondamento: {selectedEl.cornerRadius || 0}px</label>
            <input type="range" min="0" max="60" step="1" value={selectedEl.cornerRadius || 0} onChange={e => update('cornerRadius', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500" />
          </div>
        )}

        {/* Gradient */}
        {isShape && (
          <div>
            <p className={sectionTitleCls}>Gradiente</p>
            <div className="grid grid-cols-4 gap-1">
              {GRADIENTS.map((g, i) => (
                <button key={i} onClick={() => updateAndCommit('gradient', g)} title={g.name}
                  className="h-7 rounded border border-neutral-700 hover:border-violet-400 transition-all"
                  style={{ background: `linear-gradient(${g.direction}deg, ${g.colors[0]}, ${g.colors[1]})` }} />
              ))}
              <button onClick={() => updateAndCommit('gradient', undefined)} className="h-7 rounded border border-neutral-700 hover:border-violet-400 bg-neutral-900 text-xs text-neutral-500" title="Remover">✕</button>
            </div>
            <div className="flex gap-1 mt-2">
              <button onClick={() => updateAndCommit('gradient', selectedEl.gradient ? { ...selectedEl.gradient, type: 'linear' } : undefined)}
                className={`flex-1 py-1 text-[10px] rounded border ${selectedEl.gradient?.type !== 'radial' ? 'border-violet-400 text-violet-300' : 'border-neutral-700 text-neutral-400'}`}>Linear</button>
              <button onClick={() => updateAndCommit('gradient', selectedEl.gradient ? { ...selectedEl.gradient, type: 'radial' } : undefined)}
                className={`flex-1 py-1 text-[10px] rounded border ${selectedEl.gradient?.type === 'radial' ? 'border-violet-400 text-violet-300' : 'border-neutral-700 text-neutral-400'}`}>Radial</button>
            </div>
          </div>
        )}

        {/* Shadow */}
        <div>
          <p className={sectionTitleCls}>Sombra</p>
          <label className={labelCls}>Desfoque: {selectedEl.shadowBlur || 0}px</label>
          <input type="range" min="0" max="40" step="1" value={selectedEl.shadowBlur || 0} onChange={e => update('shadowBlur', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500 mb-2" />
          <div className="flex gap-2 items-center">
            <input type="color" value={selectedEl.shadowColor || '#000000'} onChange={e => update('shadowColor', e.target.value)} onBlur={() => commitHistory()} className="w-7 h-7 rounded cursor-pointer border border-neutral-700 bg-transparent p-0.5" />
            <span className="text-xs text-neutral-500">Cor</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div><label className={labelCls}>Offset X</label><input type="number" value={selectedEl.shadowOffsetX || 0} onChange={e => update('shadowOffsetX', Number(e.target.value))} className={inputCls} /></div>
            <div><label className={labelCls}>Offset Y</label><input type="number" value={selectedEl.shadowOffsetY || 0} onChange={e => update('shadowOffsetY', Number(e.target.value))} className={inputCls} /></div>
          </div>
        </div>

        {/* Effects: Filters + Blend Modes */}
        <div>
          <p className={sectionTitleCls}>Efeitos</p>
          <label className={labelCls}>Modo de Mesclagem</label>
          <select value={selectedEl.blendMode || 'source-over'} onChange={e => updateAndCommit('blendMode', e.target.value as BlendMode)} className={`${inputCls} mb-2`}>
            {BLEND_MODES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>

          <label className={labelCls}>Desfoque (Blur): {selectedEl.filters?.blur || 0}</label>
          <input type="range" min="0" max="40" step="1" value={selectedEl.filters?.blur || 0} onChange={e => updateFilter('blur', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500 mb-1" />

          <label className={labelCls}>Brilho: {(selectedEl.filters?.brightness || 0).toFixed(2)}</label>
          <input type="range" min="-1" max="1" step="0.05" value={selectedEl.filters?.brightness || 0} onChange={e => updateFilter('brightness', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500 mb-1" />

          <label className={labelCls}>Contraste: {selectedEl.filters?.contrast || 0}</label>
          <input type="range" min="-100" max="100" step="1" value={selectedEl.filters?.contrast || 0} onChange={e => updateFilter('contrast', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500 mb-1" />

          <label className={labelCls}>Saturação: {(selectedEl.filters?.saturation || 0).toFixed(1)}</label>
          <input type="range" min="-2" max="10" step="0.1" value={selectedEl.filters?.saturation || 0} onChange={e => updateFilter('saturation', Number(e.target.value))} onMouseUp={() => commitHistory()} className="w-full accent-violet-500 mb-2" />

          <div className="flex gap-1">
            <button onClick={() => { updateFilter('grayscale', !selectedEl.filters?.grayscale); commitHistory(); }} className={`flex-1 py-1 text-[10px] rounded border ${selectedEl.filters?.grayscale ? 'border-violet-400 text-violet-300' : 'border-neutral-700 text-neutral-400'}`}>P&B</button>
            <button onClick={() => { updateFilter('invert', !selectedEl.filters?.invert); commitHistory(); }} className={`flex-1 py-1 text-[10px] rounded border ${selectedEl.filters?.invert ? 'border-violet-400 text-violet-300' : 'border-neutral-700 text-neutral-400'}`}>Inverter</button>
          </div>
        </div>

        {/* Image-specific */}
        {selectedEl.type === 'image' && (
          <div>
            <p className={sectionTitleCls}>Imagem</p>
            <button
              onClick={async () => { await removeBackground(selectedEl.id); }}
              className="w-full py-2 text-xs rounded border border-violet-500 bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 transition-colors"
            >
              ✂ Remover Fundo
            </button>
            <p className="text-[10px] text-neutral-500 mt-1">Função preparada (mock). Integração real com API em breve.</p>
          </div>
        )}

        {/* Layer order */}
        <div>
          <p className={sectionTitleCls}>Camada</p>
          <div className="flex gap-2">
            <button onClick={() => bringForward(selectedEl.id)} className="flex-1 py-1.5 text-xs border border-neutral-700 hover:border-violet-400 hover:bg-violet-900/20 rounded text-neutral-300">↑ Frente</button>
            <button onClick={() => sendBackward(selectedEl.id)} className="flex-1 py-1.5 text-xs border border-neutral-700 hover:border-violet-400 hover:bg-violet-900/20 rounded text-neutral-300">↓ Trás</button>
          </div>
        </div>
      </div>
    </div>
  );
}
