import { useEditorStore } from '../../store/editorStore';
import { FONTS } from '../../data/templates';
// GRADIENTS definidos localmente abaixo

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

const inputCls = 'w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-800 focus:border-violet-400 outline-none bg-white';
const labelCls = 'text-[10px] text-gray-500 mb-0.5 block';
const sectionTitleCls = 'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2';

export default function RightPanel() {
  const { project, selectedId, updateElement, deleteElement, bringForward, sendBackward, duplicateElement, commitHistory } = useEditorStore();
  const selectedEl = project.elements.find(el => el.id === selectedId);

  if (!selectedEl) {
    return (
      <div className="w-56 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500">Propriedades</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-20">◻</div>
            <p className="text-xs text-gray-400 leading-relaxed">Selecione um elemento no canvas para editar suas propriedades</p>
          </div>
        </div>
      </div>
    );
  }

  const update = (key: string, value: unknown) => {
    updateElement(selectedEl.id, { [key]: value });
  };

  const updateAndCommit = (key: string, value: unknown) => {
    updateElement(selectedEl.id, { [key]: value });
    commitHistory();
  };

  const typeLabel = {
    rect: 'Retângulo', circle: 'Círculo', text: 'Texto',
    image: 'Imagem', badge: 'Badge', line: 'Linha',
    nutritionTable: 'Tabela', barcode: 'Cód. Barras',
  }[selectedEl.type] || 'Elemento';

  return (
    <div className="w-56 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700">{typeLabel}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => duplicateElement(selectedEl.id)}
            title="Duplicar"
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button
            onClick={() => deleteElement(selectedEl.id)}
            title="Excluir"
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
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
            <div>
              <label className={labelCls}>X (px)</label>
              <input type="number" value={Math.round(selectedEl.x)} onChange={e => updateAndCommit('x', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Y (px)</label>
              <input type="number" value={Math.round(selectedEl.y)} onChange={e => updateAndCommit('y', Number(e.target.value))} className={inputCls} />
            </div>
            {selectedEl.type !== 'circle' && selectedEl.width !== undefined && (
              <div>
                <label className={labelCls}>Largura</label>
                <input type="number" value={Math.round(selectedEl.width || 100)} onChange={e => updateAndCommit('width', Number(e.target.value))} className={inputCls} />
              </div>
            )}
            {selectedEl.type !== 'circle' && selectedEl.height !== undefined && (
              <div>
                <label className={labelCls}>Altura</label>
                <input type="number" value={Math.round(selectedEl.height || 60)} onChange={e => updateAndCommit('height', Number(e.target.value))} className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>Rotação (°)</label>
              <input type="number" value={Math.round(selectedEl.rotation || 0)} onChange={e => updateAndCommit('rotation', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Opacidade</label>
              <input type="number" min="0" max="1" step="0.05" value={selectedEl.opacity ?? 1} onChange={e => update('opacity', Number(e.target.value))} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Text properties */}
        {(selectedEl.type === 'text' || selectedEl.type === 'badge') && (
          <div>
            <p className={sectionTitleCls}>Texto</p>
            <div className="space-y-2">
              <div>
                <label className={labelCls}>Conteúdo</label>
                <textarea
                  value={selectedEl.text || ''}
                  onChange={e => update('text', e.target.value)}
                  onBlur={() => commitHistory()}
                  rows={2}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-800 focus:border-violet-400 outline-none resize-none"
                />
              </div>
              <div>
                <label className={labelCls}>Fonte</label>
                <select
                  value={selectedEl.fontFamily || 'Inter'}
                  onChange={e => updateAndCommit('fontFamily', e.target.value)}
                  className={inputCls}
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tamanho: {selectedEl.fontSize || 16}px</label>
                <input
                  type="range" min="6" max="120" step="1"
                  value={selectedEl.fontSize || 16}
                  onChange={e => update('fontSize', Number(e.target.value))}
                  onMouseUp={() => commitHistory()}
                  className="w-full accent-violet-600"
                />
              </div>
              <div className="flex gap-1">
                {(['normal', 'bold', 'italic', 'bold italic'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => updateAndCommit('fontStyle', style)}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      selectedEl.fontStyle === style ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {style === 'normal' ? 'N' : style === 'bold' ? 'B' : style === 'italic' ? 'I' : 'BI'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => updateAndCommit('align', align)}
                    className={`flex-1 py-1 text-xs rounded border transition-colors ${
                      selectedEl.align === align ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {align === 'left' ? '≡' : align === 'center' ? '≡' : '≡'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fill Color */}
        {selectedEl.type !== 'image' && (
          <div>
            <p className={sectionTitleCls}>Cor</p>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={selectedEl.fill || '#6366f1'}
                onChange={e => update('fill', e.target.value)}
                onBlur={() => commitHistory()}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={selectedEl.fill || '#6366f1'}
                onChange={e => update('fill', e.target.value)}
                onBlur={() => commitHistory()}
                className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-800 focus:border-violet-400 outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Stroke */}
        {selectedEl.type !== 'image' && (
          <div>
            <p className={sectionTitleCls}>Borda</p>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="color"
                value={selectedEl.stroke || '#e2e8f0'}
                onChange={e => update('stroke', e.target.value)}
                onBlur={() => commitHistory()}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200 bg-transparent p-0.5"
              />
              <input
                type="text"
                value={selectedEl.stroke || ''}
                onChange={e => update('stroke', e.target.value)}
                onBlur={() => commitHistory()}
                placeholder="Sem borda"
                className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-800 focus:border-violet-400 outline-none font-mono"
              />
            </div>
            <label className={labelCls}>Espessura: {selectedEl.strokeWidth || 0}px</label>
            <input
              type="range" min="0" max="20" step="1"
              value={selectedEl.strokeWidth || 0}
              onChange={e => update('strokeWidth', Number(e.target.value))}
              onMouseUp={() => commitHistory()}
              className="w-full accent-violet-600"
            />
          </div>
        )}

        {/* Corner Radius for rect */}
        {selectedEl.type === 'rect' && (
          <div>
            <label className={labelCls}>Arredondamento: {selectedEl.cornerRadius || 0}px</label>
            <input
              type="range" min="0" max="60" step="1"
              value={selectedEl.cornerRadius || 0}
              onChange={e => update('cornerRadius', Number(e.target.value))}
              onMouseUp={() => commitHistory()}
              className="w-full accent-violet-600"
            />
          </div>
        )}

        {/* Shadow */}
        <div>
          <p className={sectionTitleCls}>Sombra</p>
          <label className={labelCls}>Desfoque: {(selectedEl as any).shadowBlur || 0}px</label>
          <input
            type="range" min="0" max="40" step="1"
            value={(selectedEl as any).shadowBlur || 0}
            onChange={e => update('shadowBlur', Number(e.target.value))}
            onMouseUp={() => commitHistory()}
            className="w-full accent-violet-600 mb-2"
          />
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={(selectedEl as any).shadowColor || '#000000'}
              onChange={e => update('shadowColor', e.target.value)}
              onBlur={() => commitHistory()}
              className="w-7 h-7 rounded cursor-pointer border border-gray-200 bg-transparent p-0.5"
            />
            <span className="text-xs text-gray-500">Cor da sombra</span>
          </div>
        </div>

        {/* Gradients for shapes */}
        {(selectedEl.type === 'rect' || selectedEl.type === 'circle') && (
          <div>
            <p className={sectionTitleCls}>Gradiente</p>
            <div className="grid grid-cols-4 gap-1">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => updateAndCommit('gradient', g)}
                  title={g.name}
                  className="h-7 rounded border border-gray-200 hover:border-violet-400 transition-all"
                  style={{ background: `linear-gradient(${g.direction}deg, ${g.colors[0]}, ${g.colors[1]})` }}
                />
              ))}
              <button
                onClick={() => updateAndCommit('gradient', undefined)}
                className="h-7 rounded border border-gray-200 hover:border-violet-400 transition-all bg-gray-50 text-xs text-gray-400"
                title="Remover gradiente"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Layer order */}
        <div>
          <p className={sectionTitleCls}>Camada</p>
          <div className="flex gap-2">
            <button
              onClick={() => bringForward(selectedEl.id)}
              className="flex-1 py-1.5 text-xs border border-gray-200 hover:border-violet-400 hover:bg-violet-50 rounded transition-all text-gray-600"
            >
              ↑ Frente
            </button>
            <button
              onClick={() => sendBackward(selectedEl.id)}
              className="flex-1 py-1.5 text-xs border border-gray-200 hover:border-violet-400 hover:bg-violet-50 rounded transition-all text-gray-600"
            >
              ↓ Trás
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
