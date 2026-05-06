import { CanvasElement } from '../store/editorStore';

export interface SmartBlock {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'legal' | 'nutrition' | 'contact';
  preview: string; // emoji or initials
  build: (offsetX: number, offsetY: number) => CanvasElement[];
}

const id = (s: string) => `${s}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const SMART_BLOCKS: SmartBlock[] = [
  {
    id: 'block_hero',
    name: 'Área Frontal (Hero)',
    description: 'Logo + Título + Subtítulo + Quantidade',
    category: 'hero',
    preview: '⭐',
    build: (x, y) => {
      const g = id('grp');
      return [
        { id: id('el'), type: 'rect', x: x + 0, y: y + 0, width: 60, height: 60, fill: '#eef2ff', stroke: '#a5b4fc', strokeWidth: 1, cornerRadius: 8, groupId: g, opacity: 1, visible: true },
        { id: id('el'), type: 'text', x: x + 12, y: y + 24, text: 'LOGO', fontSize: 14, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#6366f1', align: 'center', width: 36, groupId: g, opacity: 1, visible: true },
        { id: id('el'), type: 'text', x: x + 80, y: y + 4, text: 'NOME PRODUTO', fontSize: 28, fontFamily: 'Montserrat', fontStyle: 'bold', fill: '#0f172a', align: 'left', groupId: g, opacity: 1, visible: true },
        { id: id('el'), type: 'text', x: x + 80, y: y + 38, text: 'Suplemento Alimentar', fontSize: 12, fontFamily: 'Inter', fill: '#475569', align: 'left', groupId: g, opacity: 1, visible: true },
        { id: id('el'), type: 'text', x: x + 80, y: y + 60, text: '60 cápsulas · 500mg', fontSize: 11, fontFamily: 'Inter', fontStyle: 'bold', fill: '#6366f1', align: 'left', groupId: g, opacity: 1, visible: true },
      ];
    },
  },
  {
    id: 'block_nutrition',
    name: 'Tabela Nutricional',
    description: 'Tabela ANVISA editável (duplo clique)',
    category: 'nutrition',
    preview: '📊',
    build: (x, y) => {
      const g = id('grp');
      const lines = [
        'INFORMAÇÃO NUTRICIONAL',
        'Porção: 1 cápsula (500mg) — 60 porções',
        '─────────────────────────',
        'Quantidade por porção        %VD*',
        '─────────────────────────',
        'Valor energético  0 kcal      0%',
        'Carboidratos      0 g         0%',
        'Proteínas         0 g         0%',
        'Gorduras totais   0 g         0%',
        'Fibra alimentar   0 g         0%',
        'Sódio             0 mg        0%',
        '─────────────────────────',
        '*% Valores Diários (dieta 2.000 kcal).',
      ];
      return [
        { id: id('el'), type: 'rect', x, y, width: 220, height: 220, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 1.5, cornerRadius: 4, groupId: g, opacity: 1, visible: true },
        { id: id('el'), type: 'nutritionTable', x: x + 8, y: y + 8, width: 204, height: 200, text: lines.join('\n'), fontSize: 8, fontFamily: 'Inter', fill: '#0f172a', align: 'left', groupId: g, opacity: 1, visible: true },
      ];
    },
  },
  {
    id: 'block_legal',
    name: 'Informações Legais',
    description: 'Fabricado por, CNPJ, Lote, Validade',
    category: 'legal',
    preview: '⚖',
    build: (x, y) => {
      const g = id('grp');
      const txt = [
        'FABRICADO POR: NOME DA EMPRESA LTDA',
        'CNPJ: 00.000.000/0001-00',
        'Endereço: Rua Exemplo, 123 - Cidade/UF',
        'SAC: 0800-000-0000',
        'LOTE / VAL: VER EMBALAGEM',
        'Indústria Brasileira',
      ].join('\n');
      return [
        { id: id('el'), type: 'text', x, y, width: 240, text: txt, fontSize: 6, fontFamily: 'Inter', fill: '#0f172a', align: 'left', lineHeight: 1.4, groupId: g, opacity: 1, visible: true },
      ];
    },
  },
  {
    id: 'block_warnings',
    name: 'Advertências ANVISA',
    description: 'Texto obrigatório de advertência',
    category: 'legal',
    preview: '⚠',
    build: (x, y) => {
      const g = id('grp');
      const txt = [
        'ESTE PRODUTO NÃO É UM MEDICAMENTO.',
        'NÃO EXCEDER A RECOMENDAÇÃO DIÁRIA DE CONSUMO.',
        'MANTENHA FORA DO ALCANCE DE CRIANÇAS.',
        'GESTANTES, LACTANTES E CRIANÇAS ATÉ 3 ANOS NÃO DEVEM CONSUMIR.',
      ].join('\n');
      return [
        { id: id('el'), type: 'text', x, y, width: 260, text: txt, fontSize: 6, fontFamily: 'Inter', fontStyle: 'bold', fill: '#0f172a', align: 'left', lineHeight: 1.4, groupId: g, opacity: 1, visible: true },
      ];
    },
  },
];

// ---------- Asset library (placeholders) ----------
// Using inline SVGs encoded as data URLs so they always work without external assets.
const svg = (inner: string, w = 120, h = 120) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${inner}</svg>`
  )}`;

const leaf = (color: string) =>
  svg(`<path d="M60 10 C 20 30, 20 90, 60 110 C 100 90, 100 30, 60 10 Z" fill="${color}"/><path d="M60 15 L60 105" stroke="#ffffff" stroke-width="2" opacity=".6"/>`);

const circle = (color: string, label: string) =>
  svg(`<circle cx="60" cy="60" r="55" fill="${color}"/><text x="60" y="66" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#ffffff">${label}</text>`);

const ribbon = (color: string, label: string) =>
  svg(`<path d="M10 30 H110 L100 60 L110 90 H10 L20 60 Z" fill="${color}"/><text x="60" y="65" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#ffffff">${label}</text>`, 120, 120);

export interface AssetItem {
  id: string;
  name: string;
  src: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  items: AssetItem[];
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: 'botanicos',
    name: 'Botânicos',
    icon: '🌿',
    items: [
      { id: 'a1', name: 'Folha verde', src: leaf('#16a34a') },
      { id: 'a2', name: 'Folha oliva', src: leaf('#65a30d') },
      { id: 'a3', name: 'Folha esmeralda', src: leaf('#059669') },
      { id: 'a4', name: 'Folha menta', src: leaf('#10b981') },
      { id: 'a5', name: 'Açafrão', src: circle('#f59e0b', 'AÇAF') },
      { id: 'a6', name: 'Gengibre', src: circle('#d97706', 'GEN') },
    ],
  },
  {
    id: 'pos',
    name: 'Pós/Extratos',
    icon: '🥤',
    items: [
      { id: 'p1', name: 'Whey', src: circle('#fafaf9', 'WHEY') },
      { id: 'p2', name: 'Creatina', src: circle('#e2e8f0', 'CREA') },
      { id: 'p3', name: 'Carvão', src: circle('#1e293b', 'CARV') },
      { id: 'p4', name: 'Cacau', src: circle('#78350f', 'CACAO') },
    ],
  },
  {
    id: 'texturas',
    name: 'Texturas',
    icon: '◐',
    items: [
      { id: 't1', name: 'Gradiente roxo', src: svg(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/>`) },
      { id: 't2', name: 'Gradiente fogo', src: svg(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/>`) },
      { id: 't3', name: 'Carbono', src: svg(`<rect width="120" height="120" fill="#0f172a"/><g fill="#1e293b">${Array.from({length: 36}).map((_,i)=>`<rect x="${(i%6)*20}" y="${Math.floor(i/6)*20}" width="10" height="10"/>`).join('')}</g>`) },
      { id: 't4', name: 'Metal', src: svg(`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1"/><stop offset=".5" stop-color="#f8fafc"/><stop offset="1" stop-color="#94a3b8"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/>`) },
    ],
  },
  {
    id: 'selos',
    name: 'Selos',
    icon: '🏅',
    items: [
      { id: 's1', name: '100% Natural', src: ribbon('#16a34a', '100% NAT') },
      { id: 's2', name: 'Sem Glúten', src: ribbon('#0ea5e9', 'S/ GLÚTEN') },
      { id: 's3', name: 'Vegano', src: ribbon('#15803d', 'VEGANO') },
      { id: 's4', name: 'Premium', src: ribbon('#d97706', 'PREMIUM') },
      { id: 's5', name: 'Zero Açúcar', src: ribbon('#dc2626', 'ZERO') },
      { id: 's6', name: 'Lab Tested', src: ribbon('#7c3aed', 'LAB') },
    ],
  },
];
