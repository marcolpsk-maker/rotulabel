import { create } from 'zustand';

export type ElementType = 'text' | 'rect' | 'circle' | 'line' | 'image' | 'badge' | 'nutritionTable' | 'barcode';

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

  // Text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // 'normal' | 'bold' | 'italic' | 'bold italic'
  align?: 'left' | 'center' | 'right';
  fill?: string;
  textDecoration?: string;

  // Shape
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  fillEnabled?: boolean;

  // Image
  src?: string;
  imageData?: string;

  // Badge
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;

  // Nutrition table / barcode data
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

export interface LabelProject {
  id?: string;
  name: string;
  productType: ProductType;
  widthCm: number;
  heightCm: number;
  backgroundColor: string;
  elements: CanvasElement[];
}

// 1cm = 37.795px (96dpi)
export const CM_TO_PX = 37.795;

export interface EditorState {
  project: LabelProject;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  history: LabelProject[];
  historyIndex: number;
  activeLeftTab: 'templates' | 'elements' | 'uploads' | 'text' | 'shapes' | 'layers';

  setProject: (project: Partial<LabelProject>) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  commitHistory: () => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setActiveLeftTab: (tab: EditorState['activeLeftTab']) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  duplicateElement: (id: string) => void;
  toggleVisibility: (id: string) => void;
}

const defaultProject: LabelProject = {
  name: 'Novo rótulo',
  productType: 'capsulas',
  widthCm: 15,
  heightCm: 5,
  backgroundColor: '#ffffff',
  elements: [],
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: defaultProject,
  selectedId: null,
  zoom: 1,
  showGrid: true,
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

  selectElement: (id) => set({ selectedId: id }),

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
}));
