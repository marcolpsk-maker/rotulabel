import { LabelProject, CanvasElement } from '../store/editorStore';

// Rótulos de suplemento — formato "deitado" 18 x 6,5 cm com 3 painéis:
//   Esquerdo: Ingredientes / Advertências / Fabricante
//   Centro:   Hero — Logo + NOME DO PRODUTO + Subtítulo + 60 CÁPSULAS
//   Direito:  Tabela nutricional / Sugestão de uso
// 18 x 6,5 cm @ 37.795px/cm => 680 x 246 px.

const W = 680;
const H = 246;
const PANEL_L = 220;     // largura painel esquerdo
const PANEL_R = 220;     // largura painel direito
const CENTER_X = W / 2;  // 340

function el(p: Partial<CanvasElement> & { id: string; type: CanvasElement['type']; x: number; y: number }): CanvasElement {
  return { opacity: 1, visible: true, ...p } as CanvasElement;
}

// Hero centralizado padrão (logo + nome + subtítulo + 60 cápsulas)
function buildHero(opts: {
  productName: string;
  subtitle?: string;
  brand?: string;
  accent: string;       // cor do destaque
  textColor: string;    // cor principal do texto do hero
  mutedColor: string;   // cor secundária
  capsulasBg: string;   // fundo do "60 cápsulas"
  capsulasFg: string;   // texto do "60 cápsulas"
  ingredientLine?: string;
}): CanvasElement[] {
  const { productName, subtitle = 'PREMIUM FORMULA', brand = 'BRAND', accent, textColor, mutedColor, capsulasBg, capsulasFg, ingredientLine } = opts;
  return [
    // Marca / logo (texto)
    el({ id: 'h_brand', type: 'text', x: CENTER_X - 100, y: 18, width: 200, text: brand, fontSize: 14, fontFamily: 'Montserrat', fontStyle: 'bold', fill: accent, align: 'center', letterSpacing: 2 }),
    // Linha decorativa
    el({ id: 'h_line', type: 'rect', x: CENTER_X - 30, y: 38, width: 60, height: 2, fill: accent }),
    // NOME DO PRODUTO
    el({ id: 'h_name', type: 'text', x: CENTER_X - 160, y: 50, width: 320, text: productName, fontSize: 42, fontFamily: 'Anton', fontStyle: 'bold', fill: textColor, align: 'center', letterSpacing: 2 }),
    // Subtítulo
    el({ id: 'h_sub', type: 'text', x: CENTER_X - 140, y: 102, width: 280, text: subtitle, fontSize: 11, fontFamily: 'Montserrat', fill: accent, align: 'center', letterSpacing: 6 }),
    // Linha ingredientes (ex: 300mg + 200mg)
    ...(ingredientLine ? [el({ id: 'h_ing', type: 'text', x: CENTER_X - 140, y: 130, width: 280, text: ingredientLine, fontSize: 13, fontFamily: 'Montserrat', fontStyle: 'bold', fill: textColor, align: 'center' })] : []),
    // Selo "60 CÁPSULAS"
    el({ id: 'h_caps_bg', type: 'rect', x: CENTER_X - 70, y: H - 70, width: 140, height: 50, fill: capsulasBg, cornerRadius: 25 }),
    el({ id: 'h_caps_n', type: 'text', x: CENTER_X - 70, y: H - 60, width: 60, text: '60', fontSize: 26, fontFamily: 'Anton', fontStyle: 'bold', fill: capsulasFg, align: 'center' }),
    el({ id: 'h_caps_l', type: 'text', x: CENTER_X - 5, y: H - 55, width: 70, text: 'CÁPSULAS\n500mg', fontSize: 8, fontFamily: 'Montserrat', fontStyle: 'bold', fill: capsulasFg, align: 'left', lineHeight: 1.3 }),
    // Tipo
    el({ id: 'h_type', type: 'text', x: CENTER_X - 120, y: H - 14, width: 240, text: 'SUPLEMENTO ALIMENTAR EM CÁPSULAS', fontSize: 7, fontFamily: 'Montserrat', fontStyle: 'bold', fill: mutedColor, align: 'center', letterSpacing: 1 }),
  ];
}

// Painel esquerdo padrão (legal / advertências resumidas)
function buildLeftPanel(textColor: string): CanvasElement[] {
  return [
    el({ id: 'l_t1', type: 'text', x: 12, y: 14, width: PANEL_L - 24, text: 'INGREDIENTES:', fontSize: 7, fontFamily: 'Montserrat', fontStyle: 'bold', fill: textColor, lineHeight: 1.4 }),
    el({ id: 'l_t2', type: 'text', x: 12, y: 24, width: PANEL_L - 24, text: 'Composição conforme rotulagem. Cápsula gelatinosa dura. NÃO CONTÉM GLÚTEN.', fontSize: 6, fontFamily: 'Inter', fill: textColor, lineHeight: 1.4 }),
    el({ id: 'l_t3', type: 'text', x: 12, y: 60, width: PANEL_L - 24, text: 'ADVERTÊNCIA:', fontSize: 7, fontFamily: 'Montserrat', fontStyle: 'bold', fill: textColor, lineHeight: 1.4 }),
    el({ id: 'l_t4', type: 'text', x: 12, y: 70, width: PANEL_L - 24, text: '"ESTE PRODUTO NÃO É UM MEDICAMENTO." Não exceder a recomendação diária. Manter fora do alcance de crianças.', fontSize: 6, fontFamily: 'Inter', fill: textColor, lineHeight: 1.4 }),
    el({ id: 'l_t5', type: 'text', x: 12, y: 130, width: PANEL_L - 24, text: 'FABRICADO POR:\nNome da Empresa LTDA\nCNPJ: 00.000.000/0001-00\nSAC: 0800-000-0000', fontSize: 6, fontFamily: 'Inter', fill: textColor, lineHeight: 1.4 }),
    el({ id: 'l_t6', type: 'text', x: 12, y: H - 30, width: PANEL_L - 24, text: 'LOTE / VAL: VER EMBALAGEM\nIndústria Brasileira', fontSize: 6, fontFamily: 'Inter', fontStyle: 'bold', fill: textColor, lineHeight: 1.4 }),
  ];
}

// Painel direito padrão (tabela nutricional simplificada)
function buildRightPanel(textColor: string, panelBg?: string): CanvasElement[] {
  const x0 = W - PANEL_R;
  const items: CanvasElement[] = [];
  if (panelBg) items.push(el({ id: 'r_bg', type: 'rect', x: x0, y: 0, width: PANEL_R, height: H, fill: panelBg }));
  items.push(
    el({ id: 'r_t1', type: 'text', x: x0 + 12, y: 12, width: PANEL_R - 24, text: 'INFORMAÇÃO NUTRICIONAL', fontSize: 8, fontFamily: 'Montserrat', fontStyle: 'bold', fill: textColor, align: 'center' }),
    el({ id: 'r_t2', type: 'text', x: x0 + 12, y: 26, width: PANEL_R - 24, text: 'Porção: 1 cápsula (500mg) — 60 porções', fontSize: 6, fontFamily: 'Inter', fill: textColor, align: 'center' }),
    el({ id: 'r_line1', type: 'rect', x: x0 + 12, y: 40, width: PANEL_R - 24, height: 1, fill: textColor }),
    el({ id: 'r_t3', type: 'text', x: x0 + 12, y: 46, width: PANEL_R - 24, text: 'Quantidade por porção        %VD*', fontSize: 6, fontFamily: 'Inter', fontStyle: 'bold', fill: textColor }),
    el({ id: 'r_line2', type: 'rect', x: x0 + 12, y: 58, width: PANEL_R - 24, height: 1, fill: textColor }),
    el({ id: 'r_t4', type: 'text', x: x0 + 12, y: 64, width: PANEL_R - 24, text: 'Valor energético  0 kcal      0%\nCarboidratos      0 g         0%\nProteínas         0 g         0%\nGorduras totais   0 g         0%\nFibra alimentar   0 g         0%\nSódio             0 mg        0%', fontSize: 6, fontFamily: 'Inter', fill: textColor, lineHeight: 1.5 }),
    el({ id: 'r_line3', type: 'rect', x: x0 + 12, y: 130, width: PANEL_R - 24, height: 1, fill: textColor }),
    el({ id: 'r_t5', type: 'text', x: x0 + 12, y: 136, width: PANEL_R - 24, text: '*% Valores Diários (dieta 2.000 kcal).', fontSize: 5, fontFamily: 'Inter', fontStyle: 'italic', fill: textColor }),
    el({ id: 'r_t6', type: 'text', x: x0 + 12, y: 160, width: PANEL_R - 24, text: 'SUGESTÃO DE USO:\nConsumir 2 cápsulas ao dia, 1 hora antes de dormir.', fontSize: 6, fontFamily: 'Inter', fill: textColor, lineHeight: 1.4 }),
  );
  return items;
}

function withIds(prefix: string, els: CanvasElement[]): CanvasElement[] {
  return els.map((e, i) => ({ ...e, id: `${prefix}_${e.id}_${i}` }));
}

// ============ TEMPLATES ============

export const LABEL_TEMPLATES: LabelProject[] = [
  // 1) Suplemento — referência principal (estilo Sonox/Nutryox)
  {
    id: 'tpl_suplemento',
    name: 'Suplemento',
    productType: 'capsulas',
    widthCm: 18,
    heightCm: 6.5,
    backgroundColor: '#ffffff',
    elements: [
      // Faixa inferior escura (como referência)
      el({ id: 'bg_bottom', type: 'rect', x: 0, y: H * 0.55, width: W, height: H * 0.45, fill: '#0f172a' }),
      // Painel esquerdo (fundo claro)
      ...withIds('L', buildLeftPanel('#0f172a')),
      // Painel direito (fundo claro)
      ...withIds('R', buildRightPanel('#0f172a')),
      // Hero centro
      ...withIds('H', buildHero({
        productName: 'NOME PRODUTO',
        subtitle: 'PREMIUM FORMULA',
        brand: 'SUA MARCA',
        accent: '#0ea5e9',
        textColor: '#0f172a',
        mutedColor: '#94a3b8',
        capsulasBg: '#0ea5e9',
        capsulasFg: '#ffffff',
        ingredientLine: '300mg + 200mg + 210mcg',
      })),
    ],
  },

  // 2) Sono / Relaxamento (roxo)
  {
    id: 'tpl_sono',
    name: 'Sono & Relaxamento',
    productType: 'capsulas',
    widthCm: 18,
    heightCm: 6.5,
    backgroundColor: '#ffffff',
    elements: [
      el({ id: 'bg_bottom', type: 'rect', x: 0, y: H * 0.55, width: W, height: H * 0.45, fill: '#1e1b4b' }),
      ...withIds('L', buildLeftPanel('#0f172a')),
      ...withIds('R', buildRightPanel('#0f172a')),
      ...withIds('H', buildHero({
        productName: 'SONO+',
        subtitle: 'NIGHT FORMULA',
        brand: 'PURE LAB',
        accent: '#7c3aed',
        textColor: '#0f172a',
        mutedColor: '#64748b',
        capsulasBg: '#7c3aed',
        capsulasFg: '#ffffff',
        ingredientLine: 'Melatonina + Triptofano + Magnésio',
      })),
    ],
  },

  // 3) Emagrecedor (vermelho)
  {
    id: 'tpl_emagrecedor',
    name: 'Emagrecedor',
    productType: 'capsulas',
    widthCm: 18,
    heightCm: 6.5,
    backgroundColor: '#ffffff',
    elements: [
      el({ id: 'bg_bottom', type: 'rect', x: 0, y: H * 0.55, width: W, height: H * 0.45, fill: '#7f1d1d' }),
      ...withIds('L', buildLeftPanel('#0f172a')),
      ...withIds('R', buildRightPanel('#0f172a')),
      ...withIds('H', buildHero({
        productName: 'THERMO',
        subtitle: 'EXTREME BURN',
        brand: 'FIT NUTRI',
        accent: '#dc2626',
        textColor: '#0f172a',
        mutedColor: '#64748b',
        capsulasBg: '#dc2626',
        capsulasFg: '#ffffff',
        ingredientLine: 'Cafeína + Picolinato de Cromo',
      })),
    ],
  },

  // 4) Vitaminas (verde)
  {
    id: 'tpl_vitaminas',
    name: 'Vitaminas',
    productType: 'capsulas',
    widthCm: 18,
    heightCm: 6.5,
    backgroundColor: '#ffffff',
    elements: [
      el({ id: 'bg_bottom', type: 'rect', x: 0, y: H * 0.55, width: W, height: H * 0.45, fill: '#14532d' }),
      ...withIds('L', buildLeftPanel('#0f172a')),
      ...withIds('R', buildRightPanel('#0f172a')),
      ...withIds('H', buildHero({
        productName: 'VITA D3',
        subtitle: 'IMMUNE SUPPORT',
        brand: 'NATURE LAB',
        accent: '#16a34a',
        textColor: '#0f172a',
        mutedColor: '#64748b',
        capsulasBg: '#16a34a',
        capsulasFg: '#ffffff',
        ingredientLine: 'Vitamina D3 2.000 UI',
      })),
    ],
  },

  // 5) Performance (dourado)
  {
    id: 'tpl_performance',
    name: 'Performance',
    productType: 'capsulas',
    widthCm: 18,
    heightCm: 6.5,
    backgroundColor: '#ffffff',
    elements: [
      el({ id: 'bg_bottom', type: 'rect', x: 0, y: H * 0.55, width: W, height: H * 0.45, fill: '#0f172a' }),
      el({ id: 'bg_strip1', type: 'rect', x: 0, y: 0, width: W, height: 4, fill: '#d97706' }),
      el({ id: 'bg_strip2', type: 'rect', x: 0, y: H - 4, width: W, height: 4, fill: '#d97706' }),
      ...withIds('L', buildLeftPanel('#0f172a')),
      ...withIds('R', buildRightPanel('#0f172a')),
      ...withIds('H', buildHero({
        productName: 'TESTO JACK',
        subtitle: 'ADVANCED 1800MG',
        brand: 'HEALTH STORE',
        accent: '#d97706',
        textColor: '#0f172a',
        mutedColor: '#64748b',
        capsulasBg: '#d97706',
        capsulasFg: '#ffffff',
        ingredientLine: 'Long Jack + Saw Palmetto + Tribulus',
      })),
    ],
  },

  // 6) Em branco (estrutura padrão)
  {
    id: 'tpl_branco',
    name: 'Em Branco (estrutura)',
    productType: 'capsulas',
    widthCm: 18,
    heightCm: 6.5,
    backgroundColor: '#ffffff',
    elements: [
      ...withIds('L', buildLeftPanel('#0f172a')),
      ...withIds('R', buildRightPanel('#0f172a')),
      ...withIds('H', buildHero({
        productName: 'PRODUTO',
        subtitle: 'SUBTÍTULO AQUI',
        brand: 'SUA MARCA',
        accent: '#6366f1',
        textColor: '#0f172a',
        mutedColor: '#94a3b8',
        capsulasBg: '#6366f1',
        capsulasFg: '#ffffff',
      })),
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
  { id: 'b7', text: 'LAB TESTED', color: '#7c3aed', textColor: '#ffffff' },
  { id: 'b8', text: 'ANVISA', color: '#0f172a', textColor: '#ffffff' },
  { id: 'b9', text: 'NON-GMO', color: '#0ea5e9', textColor: '#ffffff' },
  { id: 'b10', text: 'KOSHER', color: '#1e40af', textColor: '#ffffff' },
];

export const ICONS = ['⚡', '🔥', '🏋', '🍃', '⭐', '✓', '💪', '🌿', '🧬', '💊', '🌙', '☀', '🩺', '🥦', '🧪'];

export const FONTS = [
  'Inter', 'Plus Jakarta Sans', 'Montserrat', 'Bebas Neue', 'Oswald',
  'Roboto', 'Poppins', 'Anton', 'Archivo Black', 'Russo One',
  'Black Ops One', 'Bungee', 'Teko', 'Rubik', 'Orbitron',
  'Manrope', 'DM Sans', 'Work Sans', 'Nunito', 'Barlow',
  'Playfair Display', 'Merriweather', 'Lora', 'Pacifico', 'Caveat',
  'JetBrains Mono',
];

export const PRODUCT_TYPES = [
  { id: 'capsulas', label: 'Cápsulas', widthCm: 18, heightCm: 6.5, icon: '💊' },
  { id: 'po', label: 'Pó', widthCm: 22, heightCm: 9, icon: '🥤' },
  { id: 'liquido', label: 'Líquido', widthCm: 18, heightCm: 7, icon: '💧' },
  { id: 'gel', label: 'Gel / Outros', widthCm: 15, heightCm: 6, icon: '🧴' },
] as const;

export const PRESET_SIZES = [
  { label: 'Pote 60 cápsulas', widthCm: 18, heightCm: 6.5 },
  { label: 'Pote 120 cápsulas', widthCm: 20, heightCm: 7 },
  { label: 'Sachê pó 500g', widthCm: 22, heightCm: 9 },
  { label: 'Frasco 250ml', widthCm: 18, heightCm: 7 },
  { label: 'Personalizado', widthCm: 0, heightCm: 0 },
];
