import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { LABEL_TEMPLATES, IMAGE_CATEGORIES } from '../../data/templates';

export default function LeftPanel() {
  const { activeLeftTab, setActiveLeftTab, setProject, addElement, project } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const loadTemplate = (template: typeof LABEL_TEMPLATES[0]) => {
    setProject({
      ...template,
      id: `proj_${Date.now()}`,
      name: template.name,
    });
  };

  const addShape = (type: 'rect' | 'circle' | 'star' | 'triangle') => {
    const id = `el_${Date.now()}`;
    const centerX = project.width / 2;
    const centerY = project.height / 2;
    if (type === 'rect') {
      addElement({ id, type: 'rect', x: centerX - 60, y: centerY - 30, width: 120, height: 60, fill: '#7c3aed', cornerRadius: 4, draggable: true, opacity: 1 });
    } else if (type === 'circle') {
      addElement({ id, type: 'circle', x: centerX, y: centerY, radius: 50, fill: '#7c3aed', draggable: true, opacity: 1 });
    } else if (type === 'star') {
      addElement({ id, type: 'star', x: centerX, y: centerY, radius: 50, fill: '#d97706', draggable: true, opacity: 1 });
    } else if (type === 'triangle') {
      addElement({ id, type: 'triangle', x: centerX, y: centerY, radius: 50, fill: '#ef4444', draggable: true, opacity: 1 });
    }
  };

  const addText = (preset: { text: string; fontSize: number; fontFamily: string; fill: string }) => {
    const id = `el_${Date.now()}`;
    addElement({
      id,
      type: 'text',
      x: project.width / 2,
      y: project.height / 2,
      text: preset.text,
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fill: preset.fill,
      width: 200,
      draggable: true,
      opacity: 1,
    });
  };

  const addImage = (imgUrl: string, imgName: string) => {
    const id = `el_${Date.now()}`;
    addElement({
      id,
      type: 'image',
      x: project.width / 2 - 60,
      y: project.height / 2 - 60,
      width: 120,
      height: 120,
      src: imgUrl,
      draggable: true,
      opacity: 1,
    });
  };

  const tabs = [
    { id: 'templates', label: 'Templates', icon: '⬛' },
    { id: 'elements', label: 'Elementos', icon: '◼' },
    { id: 'images', label: 'Imagens', icon: '🖼' },
    { id: 'text', label: 'Texto', icon: 'T' },
  ] as const;

  return (
    <div className="w-64 bg-[#1e1e2e] border-r border-[#2d2d3d] flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#2d2d3d]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLeftTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeLeftTab === tab.id
                ? 'text-[#7c3aed] border-b-2 border-[#7c3aed] bg-[#7c3aed]/10'
                : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            <div className="text-sm mb-0.5">{tab.icon}</div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">

        {/* TEMPLATES */}
        {activeLeftTab === 'templates' && (
          <div className="space-y-2">
            <p className="text-xs text-[#64748b] mb-3">Clique para aplicar um template</p>
            {LABEL_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => loadTemplate(tpl)}
                className="w-full text-left group"
              >
                <div
                  className="w-full h-24 rounded-lg border border-[#2d2d3d] group-hover:border-[#7c3aed] transition-colors overflow-hidden relative"
                  style={{ background: tpl.backgroundGradient || tpl.backgroundColor }}
                >
                  {/* Mini preview */}
                  <div className="absolute inset-0 flex flex-col p-2">
                    <div
                      className="w-full h-8 rounded mb-1 opacity-80"
                      style={{ background: tpl.elements[1]?.fill || '#7c3aed' }}
                    />
                    <div className="text-white text-xs font-bold truncate">
                      {tpl.elements.find(e => e.type === 'text')?.text || tpl.name}
                    </div>
                    <div className="text-white/50 text-xs mt-auto">
                      {tpl.elements.filter(e => e.type === 'text').length} textos · {tpl.elements.filter(e => e.type === 'rect').length} formas
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] mt-1 group-hover:text-white transition-colors">{tpl.name}</p>
              </button>
            ))}
          </div>
        )}

        {/* ELEMENTS */}
        {activeLeftTab === 'elements' && (
          <div>
            <p className="text-xs text-[#64748b] mb-3">Clique para adicionar ao canvas</p>

            <div className="mb-4">
              <p className="text-xs font-semibold text-[#94a3b8] mb-2 uppercase tracking-wider">Formas</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'rect' as const, label: 'Retângulo', preview: '▬' },
                  { type: 'circle' as const, label: 'Círculo', preview: '●' },
                  { type: 'star' as const, label: 'Estrela', preview: '★' },
                  { type: 'triangle' as const, label: 'Triângulo', preview: '▲' },
                ].map(shape => (
                  <button
                    key={shape.type}
                    onClick={() => addShape(shape.type)}
                    className="flex flex-col items-center justify-center p-3 bg-[#252535] hover:bg-[#7c3aed]/20 border border-[#2d2d3d] hover:border-[#7c3aed] rounded-lg transition-all text-white"
                  >
                    <span className="text-2xl mb-1">{shape.preview}</span>
                    <span className="text-xs text-[#94a3b8]">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-[#94a3b8] mb-2 uppercase tracking-wider">Linhas & Divisores</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Linha Horizontal', points: [20, 0, 180, 0] },
                  { label: 'Linha Diagonal', points: [0, 0, 200, 40] },
                ].map((line, i) => (
                  <button
                    key={i}
                    onClick={() => addElement({
                      id: `el_${Date.now()}`,
                      type: 'line',
                      x: project.width / 2 - 100,
                      y: project.height / 2,
                      fill: '#7c3aed',
                      stroke: '#7c3aed',
                      strokeWidth: 2,
                      draggable: true,
                      opacity: 1,
                    })}
                    className="flex items-center gap-2 p-2 bg-[#252535] hover:bg-[#7c3aed]/20 border border-[#2d2d3d] hover:border-[#7c3aed] rounded-lg transition-all text-white text-xs"
                  >
                    <span className="text-[#94a3b8]">—</span> {line.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#94a3b8] mb-2 uppercase tracking-wider">Selos & Badges</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Sem Glúten', color: '#16a34a' },
                  { label: 'Vegano', color: '#059669' },
                  { label: 'Natural', color: '#d97706' },
                  { label: 'Premium', color: '#7c3aed' },
                ].map((badge, i) => (
                  <button
                    key={i}
                    onClick={() => addElement({
                      id: `el_${Date.now()}`,
                      type: 'rect',
                      x: project.width / 2 - 40,
                      y: project.height / 2 - 15,
                      width: 80,
                      height: 30,
                      fill: badge.color,
                      cornerRadius: 15,
                      draggable: true,
                      opacity: 1,
                    })}
                    className="flex items-center justify-center p-2 rounded-full text-white text-xs font-bold transition-all hover:scale-105"
                    style={{ background: badge.color }}
                  >
                    {badge.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMAGES */}
        {activeLeftTab === 'images' && (
          <div>
            <p className="text-xs text-[#64748b] mb-3">Clique para adicionar ao canvas</p>
            <div className="flex gap-1 mb-3 flex-wrap">
              {IMAGE_CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(i)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    selectedCategory === i
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#252535] text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_CATEGORIES[selectedCategory]?.images.map(img => (
                <button
                  key={img.id}
                  onClick={() => addImage(img.url, img.name)}
                  className="group relative rounded-lg overflow-hidden border border-[#2d2d3d] hover:border-[#7c3aed] transition-all"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-20 object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">+ Adicionar</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] p-1 truncate">{img.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TEXT */}
        {activeLeftTab === 'text' && (
          <div className="space-y-2">
            <p className="text-xs text-[#64748b] mb-3">Clique para adicionar texto</p>
            {[
              { text: 'NOME DO PRODUTO', fontSize: 32, fontFamily: 'Montserrat', fill: '#ffffff', label: 'Título Principal' },
              { text: 'Subtítulo', fontSize: 20, fontFamily: 'Montserrat', fill: '#94a3b8', label: 'Subtítulo' },
              { text: 'Ingredientes ativos', fontSize: 16, fontFamily: 'Montserrat', fill: '#e2e8f0', label: 'Ingredientes' },
              { text: '60 CÁPSULAS | 500mg', fontSize: 14, fontFamily: 'Montserrat', fill: '#7c3aed', label: 'Quantidade' },
              { text: 'Suplemento Alimentar', fontSize: 11, fontFamily: 'Montserrat', fill: '#64748b', label: 'Texto Legal' },
              { text: 'PREMIUM', fontSize: 13, fontFamily: 'Montserrat', fill: '#d97706', label: 'Badge Texto' },
            ].map((preset, i) => (
              <button
                key={i}
                onClick={() => addText(preset)}
                className="w-full text-left p-3 bg-[#252535] hover:bg-[#7c3aed]/20 border border-[#2d2d3d] hover:border-[#7c3aed] rounded-lg transition-all"
              >
                <div
                  className="font-medium truncate"
                  style={{ fontSize: Math.min(preset.fontSize, 18), color: preset.fill === '#ffffff' ? '#e2e8f0' : preset.fill }}
                >
                  {preset.text}
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">{preset.label} · {preset.fontSize}px · {preset.fontFamily}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
