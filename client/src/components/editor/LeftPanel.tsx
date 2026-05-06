import { useRef, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { LABEL_TEMPLATES, BADGES, ICONS, FONTS, PRESET_SIZES } from '../../data/templates';
import { SMART_BLOCKS, ASSET_CATEGORIES } from '../../data/blocks';

type Tab = 'templates' | 'blocks' | 'assets' | 'elements' | 'uploads' | 'text' | 'shapes' | 'size' | 'logo';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'templates', label: 'Modelos', icon: '⊞' },
  { id: 'size', label: 'Medidas', icon: '⤢' },
  { id: 'blocks', label: 'Blocos', icon: '⬚' },
  { id: 'assets', label: 'Assets', icon: '🌿' },
  { id: 'elements', label: 'Ícones', icon: '✦' },
  { id: 'logo', label: 'Logo', icon: '◈' },
  { id: 'uploads', label: 'Upload', icon: '↑' },
  { id: 'text', label: 'Texto', icon: 'T' },
  { id: 'shapes', label: 'Formas', icon: '□' },
];

// Flat icons SVG (color via currentColor) - editáveis
const FLAT_ICONS: { id: string; name: string; svg: string }[] = [
  { id: 'leaf', name: 'Folha', svg: '<path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.99.3 1.34.3 8 0 13-8 13-12 0-1.66 0-1.66-1-1.66-1 0-3 .66-3 1.66z"/>' },
  { id: 'pill', name: 'Cápsula', svg: '<path d="M10.5 15.5L4.5 9.5C2.5 7.5 2.5 4.5 4.5 2.5s5-2 7 0l6 6c2 2 2 5 0 7s-5 2-7 0z" fill="currentColor"/>' },
  { id: 'flask', name: 'Tubo', svg: '<path d="M9 2v6L4 18a2 2 0 002 3h12a2 2 0 002-3l-5-10V2H9zm2 2h2v5l4.5 9h-11L11 9V4z"/>' },
  { id: 'drop', name: 'Gota', svg: '<path d="M12 2C8 8 6 12 6 15a6 6 0 1012 0c0-3-2-7-6-13z"/>' },
  { id: 'heart', name: 'Coração', svg: '<path d="M12 21s-7-4.5-9.5-9C.8 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23.2 8.5 21.5 12c-2.5 4.5-9.5 9-9.5 9z"/>' },
  { id: 'shield', name: 'Escudo', svg: '<path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/>' },
  { id: 'star', name: 'Estrela', svg: '<polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/>' },
  { id: 'check', name: 'Check', svg: '<circle cx="12" cy="12" r="10"/><polyline points="7,12 11,16 17,8" stroke="#fff" stroke-width="2.5" fill="none"/>' },
  { id: 'fire', name: 'Fogo', svg: '<path d="M12 2c1 5-3 6-3 11a5 5 0 0010 0c0-3-2-4-2-7-2 1-3 2-3 4 0-3-1-6-2-8z"/>' },
  { id: 'lightning', name: 'Raio', svg: '<polygon points="13,2 4,14 11,14 9,22 20,10 13,10"/>' },
  { id: 'muscle', name: 'Músculo', svg: '<path d="M3 12c2-3 5-3 7 0 1 1 2 1 3 0 2-3 5-3 7 0v3c-2 3-5 3-7 0-1-1-2-1-3 0-2 3-5 3-7 0z"/>' },
  { id: 'dna', name: 'DNA', svg: '<path d="M5 3c0 6 14 6 14 12s-14 6-14 12M5 21c0-6 14-6 14-12S5 9 5 3" stroke="currentColor" stroke-width="2" fill="none"/>' },
  { id: 'molecule', name: 'Molécula', svg: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><line x1="6" y1="6" x2="18" y2="6" stroke="currentColor" stroke-width="2"/><line x1="6" y1="6" x2="12" y2="18" stroke="currentColor" stroke-width="2"/><line x1="18" y1="6" x2="12" y2="18" stroke="currentColor" stroke-width="2"/>' },
  { id: 'mortar', name: 'Almofariz', svg: '<path d="M3 8h18l-2 6a4 4 0 01-4 3h-6a4 4 0 01-4-3z"/><path d="M11 2l4 6M13 2l-2 6" stroke="currentColor" stroke-width="2" fill="none"/>' },
  { id: 'sun', name: 'Sol', svg: '<circle cx="12" cy="12" r="4"/><g stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="5" y1="19" x2="7" y2="17"/><line x1="17" y1="7" x2="19" y2="5"/></g>' },
  { id: 'moon', name: 'Lua', svg: '<path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>' },
  { id: 'apple', name: 'Maçã', svg: '<path d="M12 6c-3-3-9 0-9 6s4 11 9 11 9-5 9-11-6-9-9-6z"/><path d="M12 6c0-2 1-4 3-4" stroke="currentColor" stroke-width="2" fill="none"/>' },
  { id: 'broccoli', name: 'Brócolis', svg: '<circle cx="8" cy="8" r="4"/><circle cx="16" cy="8" r="4"/><circle cx="12" cy="6" r="3"/><path d="M10 12v8h4v-8z"/>' },
  { id: 'plus', name: 'Cruz médica', svg: '<rect x="9" y="2" width="6" height="20" rx="1"/><rect x="2" y="9" width="20" height="6" rx="1"/>' },
  { id: 'atom', name: 'Átomo', svg: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(120 12 12)"/>' },
];

const flatIconDataUrl = (svg: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120" fill="${color}" style="color:${color}">${svg}</svg>`
  )}`;

// Logo builder elements
const LOGO_BUILDER_PRESETS = [
  { id: 'circle', name: 'Círculo', type: 'circle' as const, color: '#16a34a' },
  { id: 'hex', name: 'Hexágono', type: 'hexagon' as const, color: '#0ea5e9' },
  { id: 'shield', name: 'Escudo', type: 'rect' as const, color: '#7c3aed' },
  { id: 'leaf', name: 'Folha', svg: FLAT_ICONS[0].svg, color: '#16a34a' },
  { id: 'flask', name: 'Tubo', svg: FLAT_ICONS[2].svg, color: '#0ea5e9' },
  { id: 'plus', name: 'Cruz+', svg: FLAT_ICONS[18].svg, color: '#dc2626' },
  { id: 'atom', name: 'Átomo', svg: FLAT_ICONS[19].svg, color: '#7c3aed' },
  { id: 'mortar', name: 'Almofariz', svg: FLAT_ICONS[13].svg, color: '#d97706' },
];

export default function LeftPanel() {
  const { activeLeftTab, setActiveLeftTab, setProject, addElement, addElements, project, selectElement } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [activeAssetCat, setActiveAssetCat] = useState<string>(ASSET_CATEGORIES[0].id);
  const [iconColor, setIconColor] = useState('#0f172a');
  const [logoText, setLogoText] = useState('SUA MARCA');

  const handleTemplateClick = (tpl: typeof LABEL_TEMPLATES[0]) => {
    setProject({
      name: tpl.name, productType: tpl.productType,
      widthCm: tpl.widthCm, heightCm: tpl.heightCm,
      backgroundColor: tpl.backgroundColor, elements: tpl.elements,
    });
    selectElement(null);
  };

  const handleAddText = (size: 'title' | 'subtitle' | 'body') => {
    const sizes = { title: 32, subtitle: 20, body: 14 };
    const texts = { title: 'Título', subtitle: 'Subtítulo', body: 'Texto' };
    addElement({
      id: `el_${Date.now()}`, type: 'text', x: 20, y: 20,
      text: texts[size], fontSize: sizes[size], fontFamily: 'Inter',
      fontStyle: 'normal', fill: '#0f172a', align: 'left',
      opacity: 1, visible: true, lineHeight: 1.2,
    });
  };

  const handleAddFont = (font: string) => {
    addElement({
      id: `el_${Date.now()}`, type: 'text', x: 20, y: 20,
      text: font, fontSize: 18, fontFamily: font,
      fontStyle: 'normal', fill: '#0f172a', align: 'left',
      opacity: 1, visible: true, lineHeight: 1.2,
    });
  };

  const handleAddBadge = (badge: typeof BADGES[0]) => {
    addElement({
      id: `el_${Date.now()}`, type: 'badge', x: 20, y: 20,
      text: badge.text, fontSize: 11, fontFamily: 'Montserrat',
      fontStyle: 'bold', fill: badge.textColor, align: 'center',
      width: 100, opacity: 1, visible: true,
      badgeColor: badge.color, badgeTextColor: badge.textColor,
    });
  };

  const handleAddFlatIcon = (icon: typeof FLAT_ICONS[0]) => {
    addElement({
      id: `el_${Date.now()}`, type: 'image', x: 30, y: 30,
      width: 60, height: 60,
      src: flatIconDataUrl(icon.svg, iconColor),
      opacity: 1, visible: true,
    });
  };

  const handleAddEmojiIcon = (icon: string) => {
    addElement({
      id: `el_${Date.now()}`, type: 'text', x: 20, y: 20,
      text: icon, fontSize: 32, fontFamily: 'Inter',
      fontStyle: 'normal', fill: '#0f172a', align: 'left',
      opacity: 1, visible: true,
    });
  };

  const handleAddShape = (shape: 'rect' | 'circle' | 'line' | 'wave' | 'star' | 'triangle' | 'arrow' | 'hexagon') => {
    const base = { id: `el_${Date.now()}`, x: 20, y: 20, opacity: 1, visible: true, fill: '#6366f1' };
    if (shape === 'rect') addElement({ ...base, type: 'rect', width: 120, height: 60, cornerRadius: 0 });
    else if (shape === 'circle') addElement({ ...base, type: 'circle', width: 80, height: 80 });
    else if (shape === 'line') addElement({ ...base, type: 'line', width: 120, stroke: '#0f172a', strokeWidth: 2, fill: undefined });
    else if (shape === 'wave') addElement({ ...base, type: 'wave', width: 200, height: 50 });
    else if (shape === 'star') addElement({ ...base, type: 'star', width: 80, height: 80 });
    else if (shape === 'triangle') addElement({ ...base, type: 'triangle', width: 90, height: 80 });
    else if (shape === 'arrow') addElement({ ...base, type: 'arrow', width: 120, height: 40 });
    else if (shape === 'hexagon') addElement({ ...base, type: 'hexagon', width: 80, height: 80 });
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
      id: `el_${Date.now()}`, type: 'image', x: 20, y: 20,
      width: 100, height: 100, src: img.url, opacity: 1, visible: true,
    });
  };

  const handleAddLogoElement = (preset: typeof LOGO_BUILDER_PRESETS[0]) => {
    if ('svg' in preset && preset.svg) {
      addElement({
        id: `el_${Date.now()}`, type: 'image', x: 30, y: 30,
        width: 80, height: 80, src: flatIconDataUrl(preset.svg, preset.color),
        opacity: 1, visible: true,
      });
    } else {
      handleAddShape(preset.type as any);
    }
  };

  const buildFullLogo = () => {
    const baseId = Date.now();
    const groupId = `grp_logo_${baseId}`;
    addElements([
      { id: `${baseId}_bg`, type: 'circle', x: 40, y: 40, width: 70, height: 70, fill: iconColor, opacity: 1, visible: true, groupId },
      { id: `${baseId}_ic`, type: 'image', x: 55, y: 55, width: 40, height: 40, src: flatIconDataUrl(FLAT_ICONS[0].svg, '#ffffff'), opacity: 1, visible: true, groupId },
      { id: `${baseId}_t`, type: 'text', x: 120, y: 55, text: logoText, fontSize: 22, fontFamily: 'Anton', fontStyle: 'bold', fill: iconColor, align: 'left', letterSpacing: 2, opacity: 1, visible: true, groupId },
      { id: `${baseId}_s`, type: 'text', x: 120, y: 80, text: 'NATURAL · PREMIUM', fontSize: 9, fontFamily: 'Montserrat', fill: '#64748b', align: 'left', letterSpacing: 3, opacity: 1, visible: true, groupId },
    ]);
  };

  return (
    <div className="w-16 sm:w-44 lg:w-52 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden text-slate-700">
      <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLeftTab(tab.id as any)}
            title={tab.label}
            className={`flex flex-col items-center gap-0.5 px-1 py-2 text-xs transition-colors flex-1 min-w-[44px] ${
              activeLeftTab === tab.id
                ? 'text-violet-700 bg-white border-b-2 border-violet-500'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="text-[10px] leading-none hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* SIZE */}
        {activeLeftTab === 'size' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Medidas do rótulo</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">Largura (cm)</label>
                <input type="number" step="0.1" value={project.widthCm}
                  onChange={e => setProject({ widthCm: Number(e.target.value) || 1 })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-violet-400 outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Altura (cm)</label>
                <input type="number" step="0.1" value={project.heightCm}
                  onChange={e => setProject({ heightCm: Number(e.target.value) || 1 })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:border-violet-400 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Cor de fundo</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={project.backgroundColor}
                  onChange={e => setProject({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300" />
                <input type="text" value={project.backgroundColor}
                  onChange={e => setProject({ backgroundColor: e.target.value })}
                  className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs font-mono outline-none focus:border-violet-400" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Predefinidos</p>
              <div className="space-y-1">
                {PRESET_SIZES.filter(p => p.widthCm > 0).map(p => (
                  <button key={p.label}
                    onClick={() => setProject({ widthCm: p.widthCm, heightCm: p.heightCm })}
                    className="w-full text-left px-2 py-1.5 text-xs rounded border border-slate-200 hover:border-violet-400 hover:bg-violet-50">
                    {p.label} <span className="text-slate-400">({p.widthCm}×{p.heightCm}cm)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TEMPLATES */}
        {activeLeftTab === 'templates' && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide px-1 mb-2">Modelos</p>
            {LABEL_TEMPLATES.map(tpl => (
              <button key={tpl.id} onClick={() => handleTemplateClick(tpl)}
                className="w-full rounded-lg overflow-hidden border-2 border-transparent hover:border-violet-400 transition-all group">
                <div className="w-full h-14 flex items-center justify-center" style={{ backgroundColor: tpl.backgroundColor }}>
                  <span className="text-slate-800 text-xs font-bold drop-shadow-sm truncate px-2">{tpl.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 py-0.5 text-center bg-slate-50 group-hover:bg-violet-50">
                  {tpl.widthCm} × {tpl.heightCm} cm
                </div>
              </button>
            ))}
          </div>
        )}

        {/* BLOCKS */}
        {activeLeftTab === 'blocks' && (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide px-1 mb-2">Smart Blocks</p>
            {SMART_BLOCKS.map(b => (
              <button key={b.id} onClick={() => addElements(b.build(40, 40))}
                className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.preview}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">{b.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{b.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ASSETS */}
        {activeLeftTab === 'assets' && (
          <div>
            <div className="flex gap-1 mb-2 overflow-x-auto">
              {ASSET_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveAssetCat(cat.id)}
                  className={`px-2 py-1 text-[10px] rounded whitespace-nowrap ${activeAssetCat === cat.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ASSET_CATEGORIES.find(c => c.id === activeAssetCat)?.items.map(item => (
                <button key={item.id}
                  onClick={() => addElement({ id: `el_${Date.now()}`, type: 'image', x: 30, y: 30, width: 80, height: 80, src: item.src, opacity: 1, visible: true })}
                  className="rounded overflow-hidden border border-slate-200 hover:border-violet-400 transition-all aspect-square bg-white">
                  <img src={item.src} alt={item.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ELEMENTS - Flat icons + badges + emoji */}
        {activeLeftTab === 'elements' && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Cor dos ícones</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {['#0f172a', '#ffffff', '#16a34a', '#0ea5e9', '#dc2626', '#7c3aed', '#d97706', '#db2777'].map(c => (
                  <button key={c} onClick={() => setIconColor(c)}
                    className={`w-5 h-5 rounded-full border-2 ${iconColor === c ? 'border-violet-500' : 'border-slate-200'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Ícones flat (clique = cor escolhida)</p>
              <div className="grid grid-cols-4 gap-1">
                {FLAT_ICONS.map(icon => (
                  <button key={icon.id} onClick={() => handleAddFlatIcon(icon)} title={icon.name}
                    className="aspect-square rounded border border-slate-200 hover:border-violet-400 hover:bg-violet-50 flex items-center justify-center p-1.5"
                    style={{ color: iconColor }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"
                      dangerouslySetInnerHTML={{ __html: icon.svg }} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Selos</p>
              <div className="grid grid-cols-2 gap-1">
                {BADGES.map(b => (
                  <button key={b.id} onClick={() => handleAddBadge(b)}
                    className="rounded-full px-2 py-1.5 text-[10px] font-bold transition-all hover:scale-105"
                    style={{ backgroundColor: b.color, color: b.textColor }}>
                    {b.text}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Emojis</p>
              <div className="grid grid-cols-5 gap-1">
                {ICONS.map((icon, i) => (
                  <button key={i} onClick={() => handleAddEmojiIcon(icon)}
                    className="text-xl p-1 rounded hover:bg-slate-100">
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOGO BUILDER */}
        {activeLeftTab === 'logo' && (
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Construtor de logo</p>
            <input value={logoText} onChange={e => setLogoText(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-violet-400"
              placeholder="Nome da marca" />
            <div className="flex items-center gap-2">
              <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)}
                className="w-7 h-7 rounded cursor-pointer" />
              <span className="text-xs text-slate-600">Cor principal</span>
            </div>
            <button onClick={buildFullLogo}
              className="w-full py-2 text-xs rounded bg-violet-600 text-white font-semibold hover:bg-violet-700">
              + Gerar logo completa
            </button>
            <p className="text-[10px] text-slate-500 font-semibold uppercase pt-2">Elementos individuais</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LOGO_BUILDER_PRESETS.map(preset => (
                <button key={preset.id} onClick={() => handleAddLogoElement(preset)}
                  className="aspect-square rounded border border-slate-200 hover:border-violet-400 flex flex-col items-center justify-center p-2 gap-1"
                  style={{ color: preset.color }}>
                  {'svg' in preset && preset.svg ? (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" dangerouslySetInnerHTML={{ __html: preset.svg }} />
                  ) : (
                    <div className="w-7 h-7 rounded" style={{ backgroundColor: preset.color }} />
                  )}
                  <span className="text-[9px] text-slate-500">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* UPLOADS */}
        {activeLeftTab === 'uploads' && (
          <div className="space-y-3">
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg py-4 text-center hover:border-violet-400 hover:bg-violet-50 transition-colors">
              <div className="text-2xl mb-1">↑</div>
              <p className="text-xs text-slate-600">Clique para fazer upload</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Logo, fotos PNG, JPG, SVG</p>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-1.5">
                {uploadedImages.map(img => (
                  <button key={img.id} onClick={() => handleAddUploadedImage(img)}
                    className="rounded overflow-hidden border border-slate-200 hover:border-violet-400 transition-all aspect-square bg-slate-50">
                    <img src={img.url} alt={img.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 text-center">Nenhuma imagem enviada ainda.</p>
            )}
          </div>
        )}

        {/* TEXT */}
        {activeLeftTab === 'text' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <button onClick={() => handleAddText('title')} className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50">
                <span className="text-sm font-bold text-slate-800">Adicionar título</span>
              </button>
              <button onClick={() => handleAddText('subtitle')} className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50">
                <span className="text-xs font-semibold text-slate-700">Adicionar subtítulo</span>
              </button>
              <button onClick={() => handleAddText('body')} className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50">
                <span className="text-xs text-slate-600">Adicionar texto</span>
              </button>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mb-2">Fontes</p>
              <div className="space-y-0.5">
                {FONTS.map(font => (
                  <button key={font} onClick={() => handleAddFont(font)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50" style={{ fontFamily: font }}>
                    <span className="text-xs text-slate-700">{font}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SHAPES */}
        {activeLeftTab === 'shapes' && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-2">Formas básicas</p>
            {([
              { k: 'rect', label: 'Retângulo', icon: '▭' },
              { k: 'circle', label: 'Círculo', icon: '○' },
              { k: 'line', label: 'Linha', icon: '─' },
              { k: 'triangle', label: 'Triângulo', icon: '△' },
              { k: 'star', label: 'Estrela', icon: '★' },
              { k: 'hexagon', label: 'Hexágono', icon: '⬡' },
              { k: 'arrow', label: 'Seta', icon: '➜' },
              { k: 'wave', label: 'Onda', icon: '〰' },
            ] as const).map(s => (
              <button key={s.k} onClick={() => handleAddShape(s.k)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50">
                <span className="text-lg w-6 text-center">{s.icon}</span>
                <span className="text-xs text-slate-700">{s.label}</span>
              </button>
            ))}
            <p className="text-[10px] text-slate-500 font-semibold uppercase pt-3 mb-1">Dica</p>
            <p className="text-[10px] text-slate-500">Use ondas em camadas com diferentes cores e opacidades para fundos modernos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
