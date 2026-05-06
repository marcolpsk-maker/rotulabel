import { LabelProject, CanvasElement } from '../store/editorStore';

// Templates no formato horizontal (rótulo de suplemento)
// 15cm x 5cm = 566.9px x 188.97px @ 37.795px/cm

function makeEl(partial: Partial<CanvasElement> & { id: string; type: CanvasElement['type']; x: number; y: number }): CanvasElement {
  return {
    opacity: 1,
    visible: true,
    ...partial,
  } as CanvasElement;
}

export const LABEL_TEMPLATES: LabelProject[] = [
  {
    id: 'tpl_suplemento',
    name: 'Suplemento',
    productType: 'capsulas',
    widthCm: 15,
    heightCm: 5,
    backgroundColor: '#1e1b4b',
    elements: [
      makeEl({ id: 'e1', type: 'rect', x: 0, y: 0, width: 567, height: 189, fill: '#1e1b4b' }),
      makeEl({ id: 'e2', type: 'rect', x: 0, y: 0, width: 280, height: 189, fill: '#6d28d9' }),
      makeEl({ id: 'e3', type: 'text', x: 20, y: 45, text: 'SUPLEMENTO', fontSize: 28, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#ffffff', align: 'left' }),
      makeEl({ id: 'e4', type: 'text', x: 20, y: 82, text: 'ALIMENTAR', fontSize: 14, fontFamily: 'Montserrat', fill: '#c4b5fd', align: 'left' }),
      makeEl({ id: 'e5', type: 'text', x: 20, y: 140, text: '60 CÁPSULAS · 500mg', fontSize: 11, fontFamily: 'Montserrat', fill: '#e9d5ff', align: 'left' }),
      makeEl({ id: 'e6', type: 'circle', x: 310, y: 94, width: 120, height: 120, fill: '#7c3aed' }),
      makeEl({ id: 'e7', type: 'text', x: 420, y: 60, text: 'NOME DO\nPRODUTO', fontSize: 18, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#ffffff', align: 'center', width: 140 }),
      makeEl({ id: 'e8', type: 'text', x: 310, y: 155, text: 'Suplemento Alimentar', fontSize: 9, fontFamily: 'Inter', fill: '#94a3b8', align: 'left' }),
    ],
  },
  {
    id: 'tpl_100pure',
    name: '100% PURE',
    productType: 'capsulas',
    widthCm: 15,
    heightCm: 5,
    backgroundColor: '#4c1d95',
    elements: [
      makeEl({ id: 'e1', type: 'rect', x: 0, y: 0, width: 567, height: 189, fill: '#4c1d95' }),
      makeEl({ id: 'e2', type: 'rect', x: 350, y: 0, width: 217, height: 189, fill: '#2563eb' }),
      makeEl({ id: 'e3', type: 'circle', x: 320, y: 94, width: 160, height: 160, fill: '#3b82f6' }),
      makeEl({ id: 'e4', type: 'text', x: 20, y: 50, text: '100% PURE', fontSize: 34, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#ffffff', align: 'left' }),
      makeEl({ id: 'e5', type: 'text', x: 20, y: 95, text: 'SUPLEMENTO ALIMENTAR', fontSize: 10, fontFamily: 'Montserrat', fill: '#c4b5fd', align: 'left' }),
      makeEl({ id: 'e6', type: 'text', x: 20, y: 150, text: '60 CÁPSULAS · 500mg', fontSize: 10, fontFamily: 'Inter', fill: '#e9d5ff', align: 'left' }),
    ],
  },
  {
    id: 'tpl_premium',
    name: 'Premium',
    productType: 'capsulas',
    widthCm: 15,
    heightCm: 5,
    backgroundColor: '#0f172a',
    elements: [
      makeEl({ id: 'e1', type: 'rect', x: 0, y: 0, width: 567, height: 189, fill: '#0f172a' }),
      makeEl({ id: 'e2', type: 'rect', x: 0, y: 0, width: 567, height: 4, fill: '#d97706' }),
      makeEl({ id: 'e3', type: 'rect', x: 0, y: 185, width: 567, height: 4, fill: '#d97706' }),
      makeEl({ id: 'e4', type: 'text', x: 283, y: 45, text: 'PREMIUM', fontSize: 36, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#d97706', align: 'center', width: 540 }),
      makeEl({ id: 'e5', type: 'text', x: 283, y: 90, text: 'SUPLEMENTO ALIMENTAR', fontSize: 11, fontFamily: 'Montserrat', fill: '#94a3b8', align: 'center', width: 540 }),
      makeEl({ id: 'e6', type: 'text', x: 283, y: 140, text: '60 CÁPSULAS · 500mg', fontSize: 11, fontFamily: 'Inter', fill: '#fde68a', align: 'center', width: 540 }),
    ],
  },
  {
    id: 'tpl_thermogenic',
    name: 'Thermogenic',
    productType: 'capsulas',
    widthCm: 15,
    heightCm: 5,
    backgroundColor: '#7c2d12',
    elements: [
      makeEl({ id: 'e1', type: 'rect', x: 0, y: 0, width: 567, height: 189, fill: '#7c2d12' }),
      makeEl({ id: 'e2', type: 'rect', x: 0, y: 0, width: 200, height: 189, fill: '#ef4444' }),
      makeEl({ id: 'e3', type: 'text', x: 100, y: 50, text: 'THERMO', fontSize: 22, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#ffffff', align: 'center', width: 200 }),
      makeEl({ id: 'e4', type: 'text', x: 100, y: 80, text: 'GENIC', fontSize: 22, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#ffffff', align: 'center', width: 200 }),
      makeEl({ id: 'e5', type: 'text', x: 100, y: 140, text: '60 CÁPS', fontSize: 10, fontFamily: 'Inter', fill: '#fecaca', align: 'center', width: 200 }),
      makeEl({ id: 'e6', type: 'text', x: 380, y: 50, text: 'EXTREME\nBURN', fontSize: 20, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#fde68a', align: 'center', width: 180 }),
      makeEl({ id: 'e7', type: 'text', x: 380, y: 130, text: 'Suplemento Alimentar', fontSize: 9, fontFamily: 'Inter', fill: '#fca5a5', align: 'center', width: 180 }),
    ],
  },
  {
    id: 'tpl_branco',
    name: 'Em Branco',
    productType: 'capsulas',
    widthCm: 15,
    heightCm: 5,
    backgroundColor: '#ffffff',
    elements: [
      makeEl({ id: 'e1', type: 'text', x: 283, y: 80, text: 'Nome do Produto', fontSize: 24, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#1e293b', align: 'center', width: 540 }),
      makeEl({ id: 'e2', type: 'text', x: 283, y: 120, text: 'Suplemento Alimentar', fontSize: 11, fontFamily: 'Inter', fill: '#94a3b8', align: 'center', width: 540 }),
    ],
  },
];

export const BADGES: { id: string; text: string; color: string; textColor: string }[] = [
  { id: 'b1', text: '100% PURE', color: '#6d28d9', textColor: '#ffffff' },
  { id: 'b2', text: 'SEM GLÚTEN', color: '#16a34a', textColor: '#ffffff' },
  { id: 'b3', text: 'ZERO AÇÚCAR', color: '#dc2626', textColor: '#ffffff' },
  { id: 'b4', text: 'VEGANO', color: '#15803d', textColor: '#ffffff' },
  { id: 'b5', text: 'PREMIUM', color: '#d97706', textColor: '#ffffff' },
  { id: 'b6', text: 'NATURAL', color: '#0891b2', textColor: '#ffffff' },
];

export const ICONS = ['⚡', '🔥', '🏋', '🍃', '⭐', '✓', '💪', '🌿', '🧬', '💊'];

export const FONTS = [
  'Inter', 'Plus Jakarta Sans', 'Montserrat', 'Bebas Neue', 'Oswald',
  'Roboto', 'Poppins', 'Anton', 'Archivo Black', 'Russo One',
  'Black Ops One', 'Bungee', 'Teko', 'Rubik', 'Orbitron',
  'Manrope', 'DM Sans', 'Work Sans', 'Nunito', 'Barlow',
  'Playfair Display', 'Merriweather', 'Lora', 'Pacifico', 'Caveat',
  'JetBrains Mono',
];

export const PRODUCT_TYPES = [
  { id: 'capsulas', label: 'Cápsulas', widthCm: 15, heightCm: 5, icon: '💊' },
  { id: 'po', label: 'Pó', widthCm: 22, heightCm: 9, icon: '🥤' },
  { id: 'liquido', label: 'Líquido', widthCm: 18, heightCm: 7, icon: '💧' },
  { id: 'gel', label: 'Gel / Outros', widthCm: 15, heightCm: 6, icon: '🧴' },
] as const;

export const PRESET_SIZES = [
  { label: 'Pote 60 cápsulas', widthCm: 15, heightCm: 5 },
  { label: 'Pote 120 cápsulas', widthCm: 18, heightCm: 6 },
  { label: 'Sachê pó 500g', widthCm: 22, heightCm: 9 },
  { label: 'Frasco 250ml', widthCm: 18, heightCm: 7 },
  { label: 'Personalizado', widthCm: 0, heightCm: 0 },
];
