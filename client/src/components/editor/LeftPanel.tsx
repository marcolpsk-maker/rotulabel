import { useRef, useState } from 'react';
import { useEditorStore, CanvasElement } from '../../store/editorStore';
import { LABEL_TEMPLATES, BADGES, ICONS, FONTS } from '../../data/templates';
import { SMART_BLOCKS, ASSET_CATEGORIES } from '../../data/blocks';

type Tab = 'templates' | 'blocks' | 'assets' | 'elements' | 'uploads' | 'text' | 'shapes' | 'layers';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'templates', label: 'Models', icon: '⊞' },
  { id: 'blocks', label: 'Blocos', icon: '⬚' },
  { id: 'assets', label: 'Assets', icon: '🌿' },
  { id: 'elements', label: 'Elem', icon: '✦' },
  { id: 'uploads', label: 'Upload', icon: '↑' },
  { id: 'text', label: 'Texto', icon: 'T' },
  { id: 'shapes', label: 'Formas', icon: '□' },
  { id: 'layers', label: 'Camadas', icon: '≡' },
];

export default function LeftPanel() {
  const { activeLeftTab, setActiveLeftTab, setProject, addElement, addElements, project, selectElement, deleteElement, toggleVisibility } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [activeAssetCat, setActiveAssetCat] = useState<string>(ASSET_CATEGORIES[0].id);

  const handleTemplateClick = (tpl: typeof LABEL_TEMPLATES[0]) => {
    setProject({
      name: tpl.name,
      productType: tpl.productType,
      widthCm: tpl.widthCm,
      heightCm: tpl.heightCm,
      backgroundColor: tpl.backgroundColor,
      elements: tpl.elements,
    });
    selectElement(null);
  };

  const handleAddText = (size: 'title' | 'subtitle' | 'body') => {
    const sizes = { title: 32, subtitle: 20, body: 14 };
    const texts = { title: 'Título', subtitle: 'Subtítulo', body: 'Texto' };
    addElement({
      id: `el_${Date.now()}`,
      type: 'text',
      x: 20, y: 20,
      text: texts[size],
      fontSize: sizes[size],
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fill: '#0f172a',
      align: 'left',
      opacity: 1,
      visible: true,
    });
  };

  const handleAddFont = (font: string) => {
    addElement({
      id: `el_${Date.now()}`,
      type: 'text',
      x: 20, y: 20,
      text: font,
      fontSize: 18,
      fontFamily: font,
      fontStyle: 'normal',
      fill: '#0f172a',
      align: 'left',
      opacity: 1,
      visible: true,
    });
  };

  const handleAddBadge = (badge: typeof BADGES[0]) => {
    addElement({
      id: `el_${Date.now()}`,
      type: 'badge',
      x: 20, y: 20,
      text: badge.text,
      fontSize: 11,
      fontFamily: 'Montserrat',
      fontStyle: 'bold',
      fill: badge.textColor,
      align: 'center',
      width: 100,
      opacity: 1,
      visible: true,
      badgeColor: badge.color,
      badgeTextColor: badge.textColor,
    });
  };

  const handleAddIcon = (icon: string) => {
    addElement({
      id: `el_${Date.now()}`,
      type: 'text',
      x: 20, y: 20,
      text: icon,
      fontSize: 32,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      fill: '#0f172a',
      align: 'left',
      opacity: 1,
      visible: true,
    });
  };

  const handleAddShape = (shape: 'rect' | 'circle' | 'line') => {
    if (shape === 'rect') {
      addElement({ id: `el_${Date.now()}`, type: 'rect', x: 20, y: 20, width: 120, height: 60, fill: '#6366f1', strokeWidth: 0, cornerRadius: 0, opacity: 1, visible: true });
    } else if (shape === 'circle') {
      addElement({ id: `el_${Date.now()}`, type: 'circle', x: 20, y: 20, width: 80, height: 80, fill: '#6366f1', strokeWidth: 0, opacity: 1, visible: true });
    } else {
      addElement({ id: `el_${Date.now()}`, type: 'line', x: 20, y: 20, width: 120, stroke: '#0f172a', strokeWidth: 2, opacity: 1, visible: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        const id = `upload_${Date.now()}_${Math.random()}`;
        setUploadedImages(prev => [...prev, { id, url, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUploadedImage = (img: { id: string; url: string }) => {
    addElement({
      id: `el_${Date.now()}`,
      type: 'image',
      x: 20, y: 20,
      width: 100, height: 100,
      src: img.url,
      opacity: 1,
      visible: true,
    });
  };

  const layers = [...project.elements].reverse();
  const selectedId = useEditorStore(s => s.selectedId);

  return (
    <div className="w-44 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLeftTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-2 text-xs transition-colors flex-1 ${
              activeLeftTab === tab.id ? 'text-violet-600 bg-violet-50 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm leading-none">{tab.icon}</span>
            <span className="text-[10px] leading-none">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">

        {/* Templates */}
        {activeLeftTab === 'templates' && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Modelos</p>
            {LABEL_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateClick(tpl)}
                className="w-full rounded-lg overflow-hidden border-2 border-transparent hover:border-violet-400 transition-all group"
              >
                <div
                  className="w-full h-14 flex items-center justify-center"
                  style={{ backgroundColor: tpl.backgroundColor }}
                >
                  <span className="text-white text-xs font-bold drop-shadow-sm truncate px-2">{tpl.name}</span>
                </div>
                <div className="text-[10px] text-gray-500 py-0.5 text-center bg-gray-50 group-hover:bg-violet-50 transition-colors">
                  {tpl.widthCm} × {tpl.heightCm} cm
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Elements / Badges */}
        {activeLeftTab === 'elements' && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Selos / Badges</p>
              <div className="grid grid-cols-2 gap-1">
                {BADGES.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleAddBadge(b)}
                    className="rounded-full px-2 py-1.5 text-[10px] font-bold transition-all hover:scale-105 hover:shadow-md"
                    style={{ backgroundColor: b.color, color: b.textColor }}
                  >
                    {b.text}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Ícones</p>
              <div className="grid grid-cols-5 gap-1">
                {ICONS.map((icon, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddIcon(icon)}
                    className="text-xl p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload */}
        {activeLeftTab === 'uploads' && (
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 text-center hover:border-violet-400 hover:bg-violet-50 transition-colors"
            >
              <div className="text-2xl mb-1">↑</div>
              <p className="text-xs text-gray-500">Clique para fazer upload</p>
              <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {uploadedImages.map(img => (
                  <button
                    key={img.id}
                    onClick={() => handleAddUploadedImage(img)}
                    className="rounded overflow-hidden border border-gray-200 hover:border-violet-400 transition-all aspect-square"
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 text-center">Nenhuma imagem enviada ainda.</p>
            )}
          </div>
        )}

        {/* Text */}
        {activeLeftTab === 'text' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <button
                onClick={() => handleAddText('title')}
                className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-800">Adicionar título</span>
              </button>
              <button
                onClick={() => handleAddText('subtitle')}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-700">Adicionar subtítulo</span>
              </button>
              <button
                onClick={() => handleAddText('body')}
                className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
              >
                <span className="text-xs text-gray-600">Adicionar texto</span>
              </button>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Fontes ({FONTS.length} disponíveis)</p>
              <div className="space-y-0.5">
                {FONTS.map(font => (
                  <button
                    key={font}
                    onClick={() => handleAddFont(font)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: font }}
                  >
                    <span className="text-xs text-gray-700">{font}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shapes */}
        {activeLeftTab === 'shapes' && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Formas</p>
            <button
              onClick={() => handleAddShape('rect')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              <span className="text-xs text-gray-700">Retângulo</span>
            </button>
            <button
              onClick={() => handleAddShape('circle')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                <circle cx="12" cy="12" r="9"/>
              </svg>
              <span className="text-xs text-gray-700">Círculo</span>
            </button>
            <button
              onClick={() => handleAddShape('line')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              <span className="text-xs text-gray-700">Linha</span>
            </button>
          </div>
        )}

        {/* Layers */}
        {activeLeftTab === 'layers' && (
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide px-1 mb-2">Camadas</p>
            {layers.length === 0 && (
              <p className="text-[10px] text-gray-400 text-center py-4">Nenhum elemento no canvas.</p>
            )}
            {layers.map((el) => (
              <div
                key={el.id}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  selectedId === el.id ? 'bg-violet-50 border border-violet-200' : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => selectElement(el.id)}
              >
                <span className="text-xs text-gray-400 w-4">
                  {el.type === 'text' || el.type === 'badge' ? 'T' : el.type === 'rect' ? '□' : el.type === 'circle' ? '○' : '—'}
                </span>
                <span className="text-xs text-gray-700 flex-1 truncate">
                  {el.type === 'text' || el.type === 'badge' ? (el.text?.slice(0, 15) || 'Texto') : el.type}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  {el.visible !== false ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                  className="text-gray-300 hover:text-red-500 p-0.5"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
