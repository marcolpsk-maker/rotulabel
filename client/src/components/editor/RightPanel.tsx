import { useEditorStore } from '../../store/editorStore';
import { GRADIENTS, FONTS } from '../../data/templates';

export default function RightPanel() {
  const { project, selectedId, updateElement, deleteElement, bringForward, sendBackward, duplicateElement } = useEditorStore();
  const selectedEl = project.elements.find(el => el.id === selectedId);

  if (!selectedEl) {
    return (
      <div className="w-64 bg-[#1e1e2e] border-l border-[#2d2d3d] flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-[#2d2d3d]">
          <h3 className="text-sm font-semibold text-[#94a3b8]">Propriedades</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-30">◻</div>
            <p className="text-xs text-[#64748b]">Selecione um elemento no canvas para editar suas propriedades</p>
          </div>
        </div>
      </div>
    );
  }

  const update = (key: string, value: unknown) => updateElement(selectedEl.id, { [key]: value });

  return (
    <div className="w-64 bg-[#1e1e2e] border-l border-[#2d2d3d] flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-[#2d2d3d] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          {selectedEl.type === 'rect' ? 'Retângulo' :
           selectedEl.type === 'circle' ? 'Círculo' :
           selectedEl.type === 'text' ? 'Texto' :
           selectedEl.type === 'image' ? 'Imagem' :
           selectedEl.type === 'star' ? 'Estrela' : 'Elemento'}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => duplicateElement(selectedEl.id)}
            title="Duplicar"
            className="p-1 text-[#64748b] hover:text-white transition-colors text-xs"
          >⧉</button>
          <button
            onClick={() => deleteElement(selectedEl.id)}
            title="Excluir"
            className="p-1 text-[#64748b] hover:text-red-400 transition-colors text-xs"
          >✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* Position & Size */}
        <div>
          <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Posição & Tamanho</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[#64748b]">X</label>
              <input
                type="number"
                value={Math.round(selectedEl.x)}
                onChange={e => update('x', Number(e.target.value))}
                className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b]">Y</label>
              <input
                type="number"
                value={Math.round(selectedEl.y)}
                onChange={e => update('y', Number(e.target.value))}
                className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
              />
            </div>
            {selectedEl.type !== 'circle' && selectedEl.type !== 'star' && selectedEl.type !== 'triangle' && (
              <>
                <div>
                  <label className="text-xs text-[#64748b]">Largura</label>
                  <input
                    type="number"
                    value={Math.round(selectedEl.width || 100)}
                    onChange={e => update('width', Number(e.target.value))}
                    className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#64748b]">Altura</label>
                  <input
                    type="number"
                    value={Math.round(selectedEl.height || 60)}
                    onChange={e => update('height', Number(e.target.value))}
                    className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
                  />
                </div>
              </>
            )}
            {(selectedEl.type === 'circle' || selectedEl.type === 'star') && (
              <div className="col-span-2">
                <label className="text-xs text-[#64748b]">Raio</label>
                <input
                  type="number"
                  value={Math.round(selectedEl.radius || 40)}
                  onChange={e => update('radius', Number(e.target.value))}
                  className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-[#64748b]">Rotação</label>
              <input
                type="number"
                value={Math.round(selectedEl.rotation || 0)}
                onChange={e => update('rotation', Number(e.target.value))}
                className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b]">Opacidade</label>
              <input
                type="number"
                min="0" max="1" step="0.1"
                value={selectedEl.opacity ?? 1}
                onChange={e => update('opacity', Number(e.target.value))}
                className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Text properties */}
        {selectedEl.type === 'text' && (
          <div>
            <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Texto</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-[#64748b]">Conteúdo</label>
                <textarea
                  value={selectedEl.text || ''}
                  onChange={e => update('text', e.target.value)}
                  rows={2}
                  className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#64748b]">Fonte</label>
                <select
                  value={selectedEl.fontFamily || 'Montserrat'}
                  onChange={e => update('fontFamily', e.target.value)}
                  className="w-full bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none"
                >
                  {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#64748b]">Tamanho: {selectedEl.fontSize || 20}px</label>
                <input
                  type="range" min="8" max="120" step="1"
                  value={selectedEl.fontSize || 20}
                  onChange={e => update('fontSize', Number(e.target.value))}
                  className="w-full accent-[#7c3aed]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Fill Color */}
        {selectedEl.type !== 'image' && (
          <div>
            <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Cor de Preenchimento</p>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={selectedEl.fill || '#7c3aed'}
                onChange={e => update('fill', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={selectedEl.fill || '#7c3aed'}
                onChange={e => update('fill', e.target.value)}
                className="flex-1 bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Stroke */}
        {selectedEl.type !== 'image' && (
          <div>
            <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Borda</p>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="color"
                value={selectedEl.stroke || '#ffffff'}
                onChange={e => update('stroke', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={selectedEl.stroke || '#ffffff'}
                onChange={e => update('stroke', e.target.value)}
                className="flex-1 bg-[#252535] border border-[#2d2d3d] rounded px-2 py-1 text-xs text-white focus:border-[#7c3aed] outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#64748b]">Espessura: {selectedEl.strokeWidth || 0}px</label>
              <input
                type="range" min="0" max="20" step="1"
                value={selectedEl.strokeWidth || 0}
                onChange={e => update('strokeWidth', Number(e.target.value))}
                className="w-full accent-[#7c3aed]"
              />
            </div>
          </div>
        )}

        {/* Corner Radius for rect */}
        {selectedEl.type === 'rect' && (
          <div>
            <label className="text-xs text-[#64748b]">Arredondamento: {selectedEl.cornerRadius || 0}px</label>
            <input
              type="range" min="0" max="60" step="1"
              value={selectedEl.cornerRadius || 0}
              onChange={e => update('cornerRadius', Number(e.target.value))}
              className="w-full accent-[#7c3aed]"
            />
          </div>
        )}

        {/* Shadow */}
        <div>
          <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Sombra</p>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-[#64748b]">Desfoque: {selectedEl.shadowBlur || 0}px</label>
              <input
                type="range" min="0" max="40" step="1"
                value={selectedEl.shadowBlur || 0}
                onChange={e => update('shadowBlur', Number(e.target.value))}
                className="w-full accent-[#7c3aed]"
              />
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={selectedEl.shadowColor || '#000000'}
                onChange={e => update('shadowColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs text-[#64748b]">Cor da sombra</span>
            </div>
          </div>
        </div>

        {/* Gradients */}
        {selectedEl.type !== 'text' && selectedEl.type !== 'image' && (
          <div>
            <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Gradientes</p>
            <div className="grid grid-cols-3 gap-1">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => update('gradient', g)}
                  title={g.name}
                  className="h-8 rounded border border-[#2d2d3d] hover:border-[#7c3aed] transition-all"
                  style={{ background: `linear-gradient(${g.direction}deg, ${g.colors[0]}, ${g.colors[1]})` }}
                />
              ))}
              <button
                onClick={() => update('gradient', undefined)}
                className="h-8 rounded border border-[#2d2d3d] hover:border-[#7c3aed] transition-all bg-[#252535] text-xs text-[#64748b]"
                title="Remover gradiente"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Layer order */}
        <div>
          <p className="text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Camada</p>
          <div className="flex gap-2">
            <button
              onClick={() => bringForward(selectedEl.id)}
              className="flex-1 py-1.5 text-xs bg-[#252535] hover:bg-[#7c3aed]/20 border border-[#2d2d3d] hover:border-[#7c3aed] rounded transition-all text-[#94a3b8]"
            >
              ↑ Para frente
            </button>
            <button
              onClick={() => sendBackward(selectedEl.id)}
              className="flex-1 py-1.5 text-xs bg-[#252535] hover:bg-[#7c3aed]/20 border border-[#2d2d3d] hover:border-[#7c3aed] rounded transition-all text-[#94a3b8]"
            >
              ↓ Para trás
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
