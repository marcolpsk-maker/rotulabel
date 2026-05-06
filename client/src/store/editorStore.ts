import { create } from 'zustand';

export type ElementType = 'rect' | 'circle' | 'text' | 'image' | 'line' | 'star' | 'triangle';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  src?: string;
  draggable?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  cornerRadius?: number;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number;
  };
}

export interface LabelProject {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundGradient?: string;
  elements: CanvasElement[];
}

interface EditorState {
  project: LabelProject;
  selectedId: string | null;
  history: LabelProject[];
  historyIndex: number;
  zoom: number;
  showGrid: boolean;
  activeLeftTab: 'templates' | 'elements' | 'images' | 'text';

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
}

const defaultProject: LabelProject = {
  id: 'new',
  name: 'Novo Rótulo',
  width: 420,
  height: 620,
  backgroundColor: '#ffffff',
  elements: [],
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: defaultProject,
  selectedId: null,
  history: [defaultProject],
  historyIndex: 0,
  zoom: 1,
  showGrid: false,
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
    const newProject = { ...get().project, elements };
    set({ project: newProject });
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
      set({ historyIndex: historyIndex - 1, project: history[historyIndex - 1], selectedId: null });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1, project: history[historyIndex + 1] });
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
      const newEl = { ...el, id: `el_${Date.now()}`, x: el.x + 20, y: el.y + 20 };
      get().addElement(newEl);
    }
  },
}));
