import { useCallback, useEffect, useRef, useState } from "react";
import { AnyEl, newId } from "./types";

export function useEditorState(initial: AnyEl[] = []) {
  const [elements, setElements] = useState<AnyEl[]>(initial);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);  // multi-select
  const history  = useRef<AnyEl[][]>([initial]);
  const future   = useRef<AnyEl[][]>([]);
  const skipNext = useRef(false);

  // ── History tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    if (skipNext.current) { skipNext.current = false; return; }
    history.current.push(elements);
    if (history.current.length > 60) history.current.shift();
    future.current = [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  const setFromHistory = (els: AnyEl[]) => { skipNext.current = true; setElements(els); };

  const undo = () => {
    if (history.current.length < 2) return;
    const cur = history.current.pop()!;
    future.current.push(cur);
    setFromHistory(history.current[history.current.length - 1]);
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(next);
    setFromHistory(next);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const add = useCallback((el: Omit<AnyEl, "id"> & Partial<Pick<AnyEl,"id">>) => {
    const full = { ...el, id: el.id ?? newId() } as AnyEl;
    setElements(es => [...es, full]);
    setSelectedId(full.id);
    setSelectedIds([full.id]);
    return full.id;
  }, []);

  const update = useCallback((id: string, patch: Partial<AnyEl>) => {
    setElements(es => es.map(e => e.id === id ? { ...e, ...patch } as AnyEl : e));
  }, []);

  // Update all selected elements at once (for multi-select move)
  const updateMany = useCallback((ids: string[], patch: Partial<AnyEl>) => {
    setElements(es => es.map(e => ids.includes(e.id) ? { ...e, ...patch } as AnyEl : e));
  }, []);

  const remove = useCallback((id: string) => {
    setElements(es => es.filter(e => e.id !== id));
    setSelectedId(s => s === id ? null : s);
    setSelectedIds(ids => ids.filter(i => i !== id));
  }, []);

  const removeSelected = useCallback(() => {
    setElements(es => es.filter(e => !selectedIds.includes(e.id)));
    setSelectedId(null);
    setSelectedIds([]);
  }, [selectedIds]);

  const duplicate = useCallback((id: string) => {
    setElements(es => {
      const e = es.find(x => x.id === id); if (!e) return es;
      const copy = { ...e, id: newId(), x: e.x + 12, y: e.y + 12 } as AnyEl;
      setSelectedId(copy.id);
      setSelectedIds([copy.id]);
      return [...es, copy];
    });
  }, []);

  const reorder = useCallback((id: string, dir: "front"|"back"|"forward"|"backward") => {
    setElements(es => {
      const i = es.findIndex(e => e.id === id); if (i < 0) return es;
      const copy = [...es]; const [el] = copy.splice(i, 1);
      if (dir === "front")    copy.push(el);
      else if (dir === "back")     copy.unshift(el);
      else if (dir === "forward")  copy.splice(Math.min(i + 1, copy.length), 0, el);
      else                         copy.splice(Math.max(i - 1, 0), 0, el);
      return copy;
    });
  }, []);

  // ── Multi-select helpers ──────────────────────────────────────────────────
  const selectOne = useCallback((id: string | null) => {
    setSelectedId(id);
    setSelectedIds(id ? [id] : []);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        setSelectedId(next[next.length - 1] ?? null);
        return next;
      } else {
        setSelectedId(id);
        return [...prev, id];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedIds([]);
  }, []);

  const canUndo = history.current.length > 1;
  const canRedo = future.current.length > 0;

  return {
    elements,
    setElements: setFromHistory,
    selectedId, setSelectedId: selectOne,
    selectedIds, toggleSelect, clearSelection,
    add, update, updateMany, remove, removeSelected, duplicate, reorder,
    undo, redo, canUndo, canRedo,
  };
}
