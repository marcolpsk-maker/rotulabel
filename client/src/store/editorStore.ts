import { create } from 'zustand';

export type ElementType = 'text' | 'rect' | 'circle' | 'line' | 'image' | 'badge' | 'nutritionTable' | 'barcode' | 'group' | 'wave' | 'star' | 'triangle' | 'arrow' | 'hexagon' | 'polygon';

export type BlendMode =
  | 'source-over' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'
  | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference'
  | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export interface ElementFilters {
  blur?: number;       // 0-40
  brightness?: number; // -1 .. 1
  contrast?: number;   // -100 .. 100
  saturation?: number; // -2 .. 10
  grayscale?: boolean;
  invert?: boolean;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  groupId?: string;

  // Text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  align?: 'left' | 'center' | 'right';
  fill?: string;
  textDecoration?: string;
  letterSpacing?: number;
  lineHeight?: number;
  // Text outline
  textStroke?: string;
  textStrokeWidth?: number;
  // Curved text
  curve?: number; // -180..180 degrees of arc, 0 = straight

  // Shape
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  fillEnabled?: boolean;

  // Gradient
  gradient?: { colors: string[]; direction: number; type?: 'linear' | 'radial' };

  // Shadow
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // Effects
  blendMode?: BlendMode;
  filters?: ElementFilters;

  // Image
  src?: string;
  imageData?: string;

  // Badge
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;

  // Nutrition table / barcode
  tableData?: NutritionData;
  barcodeValue?: string;
}

export interface NutritionData {
  productName: string;
  brand: string;
  netQuantity: string;
  servingSize: string;
  servingsPerPackage: string;
  ingredients: string;
  nutrients: { name: string; amount: string; dv: string }[];
  warnings: string[];
}

export type ProductType = 'capsulas' | 'po' | 'liquido' | 'gel';

export interface PrintGuides {
  enabled: boolean;
  bleedMm: number;   // sangria
  safeMm: number;    // margem de segurança
  panels?: number[]; // posições de painéis verticais (em px do canvas)
}

export interface LabelProject {
  id?: string;
  name: string;
  productType: ProductType;
  widthCm: number;
  heightCm: number;
  backgroundColor: string;
  elements: CanvasElement[];
  guides?: PrintGuides;
}

export const CM_TO_PX = 37.795;
export const MM_TO_PX = CM_TO_PX / 10;

export interface EditorState {
  project: LabelProject;
  selectedId: string | null;
  selectedIds: string[];
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  history: LabelProject[];
  historyIndex: number;
  activeLeftTab: 'templates' | 'elements' | 'uploads' | 'text' | 'shapes' | 'layers' | 'blocks' | 'assets';

  setProject: (project: Partial<LabelProject>) => void;
  addElement: (element: CanvasElement) => void;
  addElements: (elements: CanvasElement[]) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  commitHistory: () => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  setActiveLeftTab: (tab: EditorState['activeLeftTab']) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  duplicateElement: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  groupElements: (ids: string[]) => void;
  ungroup: (groupId: string) => void;
  removeBackground: (id: string) => Promise<void>;
}

const defaultProject: LabelProject = {
  name: 'Novo rótulo',
  productType: 'capsulas',
  widthCm: 18,
  heightCm: 6.5,
  backgroundColor: '#ffffff',
  elements: [],
  guides: { enabled: true, bleedMm: 3, safeMm: 3 },
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: defaultProject,
  selectedId: null,
  selectedIds: [],
  zoom: 1,
  showGrid: true,
  showGuides: true,
  history: [defaultProject],
  historyIndex: 0,
  activeLeftTab: 'templates',

  setProject: (updates) => {
    const newProject = { ...get().project, ...updates };
    const history = get().history.slice(0, get().historyIndex + 1);
    set({ project: newProject, history: [...history, newProject], historyIndex: history.length });
  },

  addElement: (element) => {
    const elements = [...get().project.elements, element];
    const newProject = { ...get().project, elements };
    const history = get().history.slice(0, get().historyIndex + 1);
    set({ project: newProject, history: [...history, newProject], historyIndex: history.length, selectedId: element.id });
  },

  addElements: (newEls) => {
    const elements = [...get().project.elements, ...newEls];
    const newProject = { ...get().project, elements };
    const history = get().history.slice(0, get().historyIndex + 1);
    set({ project: newProject, history: [...history, newProject], historyIndex: history.length, selectedId: newEls[0]?.id ?? null });
  },

  updateElement: (id, updates) => {
    const elements = get().project.elements.map(el => el.id === id ? { ...el, ...updates } : el);
    set({ project: { ...get().project, elements } });
  },

  commitHistory: () => {
    const state = get();
    const history = state.history.slice(0, state.historyIndex + 1);
    set({ history: [...history, state.project], historyIndex: history.length });
  },

  deleteElement: (id) => {
    const elements = get().project.elements.filter(el => el.id !== id);
    const newProject = { ...get().project, elements };
    const history = get().history.slice(0, get().historyIndex + 1);
    set({ project: newProject, history: [...history, newProject], historyIndex: history.length, selectedId: null });
  },

  selectElement: (id) => set({ selectedId: id, selectedIds: id ? [id] : [] }),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      set({ project: history[historyIndex - 1], historyIndex: historyIndex - 1, selectedId: null });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      set({ project: history[historyIndex + 1], historyIndex: historyIndex + 1, selectedId: null });
    }
  },

  setZoom: (zoom) => set({ zoom }),
  toggleGrid: () => set({ showGrid: !get().showGrid }),
  toggleGuides: () => set({ showGuides: !get().showGuides }),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),

  bringForward: (id) => {
    const elements = [...get().project.elements];
    const idx = elements.findIndex(el => el.id === id);
    if (idx < elements.length - 1) {
      [elements[idx], elements[idx + 1]] = [elements[idx + 1], elements[idx]];
      const newProject = { ...get().project, elements };
      const history = get().history.slice(0, get().historyIndex + 1);
      set({ project: newProject, history: [...history, newProject], historyIndex: history.length });
    }
  },

  sendBackward: (id) => {
    const elements = [...get().project.elements];
    const idx = elements.findIndex(el => el.id === id);
    if (idx > 0) {
      [elements[idx], elements[idx - 1]] = [elements[idx - 1], elements[idx]];
      const newProject = { ...get().project, elements };
      const history = get().history.slice(0, get().historyIndex + 1);
      set({ project: newProject, history: [...history, newProject], historyIndex: history.length });
    }
  },

  duplicateElement: (id) => {
    const el = get().project.elements.find(e => e.id === id);
    if (el) {
      const newEl = { ...el, id: `el_${Date.now()}`, x: el.x + 10, y: el.y + 10 };
      const elements = [...get().project.elements, newEl];
      const newProject = { ...get().project, elements };
      const history = get().history.slice(0, get().historyIndex + 1);
      set({ project: newProject, history: [...history, newProject], historyIndex: history.length, selectedId: newEl.id });
    }
  },

  toggleVisibility: (id) => {
    const elements = get().project.elements.map(el =>
      el.id === id ? { ...el, visible: el.visible === false ? true : false } : el
    );
    set({ project: { ...get().project, elements } });
  },

  toggleLock: (id) => {
    const elements = get().project.elements.map(el =>
      el.id === id ? { ...el, locked: !el.locked } : el
    );
    set({ project: { ...get().project, elements } });
  },

  groupElements: (ids) => {
    const groupId = `grp_${Date.now()}`;
    const elements = get().project.elements.map(el =>
      ids.includes(el.id) ? { ...el, groupId } : el
    );
    set({ project: { ...get().project, elements } });
  },

  ungroup: (groupId) => {
    const elements = get().project.elements.map(el =>
      el.groupId === groupId ? { ...el, groupId: undefined } : el
    );
    set({ project: { ...get().project, elements } });
  },

  // Mock background removal (real: API like remove.bg or replicate)
  removeBackground: async (id) => {
    const el = get().project.elements.find(e => e.id === id);
    if (!el || el.type !== 'image') return;
    // Mock: apply CSS-style filter as visual hint and toast
    get().updateElement(id, {
      filters: { ...(el.filters || {}), brightness: 0.05 },
    });
    get().commitHistory();
  },
}));
