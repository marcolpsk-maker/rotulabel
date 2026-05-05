/**
 * Presets e Padrões de Design para Rótulos de Nutracêuticos.
 * Baseado na análise de 31 rótulos reais (Maio 2026).
 */

export interface LabelCategory {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    title: string;
    subtitle: string;
    body: string;
  };
  elements: string[]; // IDs de ícones ou caminhos de imagens
  visualStyle: string; // 'Agressivo', 'Clean', 'Naturista', 'Premium', etc.
}

export const LABEL_CATEGORIES: LabelCategory[] = [
  {
    id: 'sono',
    name: 'Sono e Relaxamento',
    description: 'Fórmulas calmantes e auxiliares do sono.',
    colors: {
      primary: '#1E3A8A', // Azul Escuro
      secondary: '#581C87', // Roxo
      accent: '#E2E8F0',    // Prata/Cinza Claro
      background: '#0F172A', // Navy
    },
    typography: {
      title: 'Bebas Neue',
      subtitle: 'Montserrat',
      body: 'Inter',
    },
    elements: ['moon', 'stars', 'leaf-soft'],
    visualStyle: 'Suave / Noturno',
  },
  {
    id: 'emagrecimento',
    name: 'Emagrecimento / Termogênicos',
    description: 'Fórmulas para queima de gordura e inibição de apetite.',
    colors: {
      primary: '#DC2626', // Vermelho
      secondary: '#EA580C', // Laranja
      accent: '#FACC15',    // Amarelo
      background: '#18181B', // Preto/Zinco
    },
    typography: {
      title: 'Oswald',
      subtitle: 'Montserrat',
      body: 'Roboto',
    },
    elements: ['flame', 'zap', 'skull'],
    visualStyle: 'Agressivo / Energético',
  },
  {
    id: 'vitaminas',
    name: 'Vitaminas e Minerais',
    description: 'Suplementos essenciais e fitoterápicos.',
    colors: {
      primary: '#166534', // Verde
      secondary: '#713F12', // Marrom
      accent: '#CA8A04',    // Dourado
      background: '#FFFFFF', // Branco
    },
    typography: {
      title: 'Montserrat',
      subtitle: 'Source Sans 3',
      body: 'Inter',
    },
    elements: ['leaf', 'sun', 'shield-check'],
    visualStyle: 'Naturista / Profissional',
  },
  {
    id: 'performance',
    name: 'Performance / Musculação',
    description: 'Suplementos para força, resistência e ganho muscular.',
    colors: {
      primary: '#000000', // Preto
      secondary: '#B91C1C', // Vermelho Escuro
      accent: '#22C55E',    // Verde Limão (Contraste)
      background: '#F8FAFC', // Off-white
    },
    typography: {
      title: 'Anton',
      subtitle: 'Barlow Condensed',
      body: 'Roboto',
    },
    elements: ['dumbbell', 'trophy', 'activity'],
    visualStyle: 'Moderno / Power',
  },
  {
    id: 'libido',
    name: 'Saúde Sexual / Libido',
    description: 'Fórmulas para vitalidade e bem-estar sexual.',
    colors: {
      primary: '#BE123C', // Carmesim
      secondary: '#DB2777', // Rosa Choque
      accent: '#701A75',    // Roxo Escuro
      background: '#FFF1F2', // Rosa Bebê
    },
    typography: {
      title: 'Playfair Display',
      subtitle: 'Plus Jakarta Sans',
      body: 'Lato',
    },
    elements: ['heart', 'sparkles', 'flower'],
    visualStyle: 'Sofisticado / Sensual',
  }
];

export const PRESET_ICONS = [
  { id: 'moon', category: 'sono', keywords: ['noite', 'calma'] },
  { id: 'stars', category: 'sono', keywords: ['noite', 'sonho'] },
  { id: 'flame', category: 'emagrecimento', keywords: ['fogo', 'termo'] },
  { id: 'zap', category: 'emagrecimento', keywords: ['energia', 'raio'] },
  { id: 'leaf', category: 'vitaminas', keywords: ['natural', 'planta'] },
  { id: 'shield-check', category: 'vitaminas', keywords: ['segurança', 'imunidade'] },
  { id: 'dumbbell', category: 'performance', keywords: ['treino', 'força'] },
  { id: 'heart', category: 'libido', keywords: ['amor', 'vitalidade'] },
  { id: 'sparkles', category: 'libido', keywords: ['premium', 'brilho'] },
];

export const PRESET_SEALS = [
  { name: 'Vegano', color: 'green', icon: 'leaf' },
  { name: 'Sem Glúten', color: 'yellow', icon: 'alert-triangle' },
  { name: 'Orgânico', color: 'green', icon: 'check-circle' },
  { name: 'Premium', color: 'gold', icon: 'award' },
  { name: 'Novo', color: 'blue', icon: 'zap' },
];
