/**
 * InlineTextEditor
 *
 * Renderiza um <textarea> flutuante sobre o canvas quando o usuário
 * dá double-click num elemento de texto no Konva.
 *
 * Como usar:
 *   <InlineTextEditor
 *     editing={editingEl}          // TextEl | null
 *     stageRef={stageRef}
 *     zoom={zoom}
 *     onChange={(id, text) => ed.update(id, { text })}
 *     onClose={() => setEditingEl(null)}
 *   />
 */
import { useEffect, useRef } from "react";
import type Konva from "konva";
import { TextEl } from "./types";

interface Props {
  editing: (TextEl & { id: string }) | null;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  zoom: number;
  onChange: (id: string, text: string) => void;
  onClose: () => void;
}

export default function InlineTextEditor({ editing, stageRef, zoom, onChange, onClose }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing || !stageRef.current || !ref.current) return;

    const stage = stageRef.current;
    const container = stage.container();
    const containerRect = container.getBoundingClientRect();

    // Get the Konva node's absolute position
    const layer = stage.getLayers()[0];
    const node  = layer?.findOne("#" + editing.id);
    if (!node) return;

    const absPos  = node.getAbsolutePosition();
    const absRot  = node.getAbsoluteRotation();
    const scaleX  = stage.scaleX();

    const ta = ref.current;
    ta.value  = editing.text ?? "";
    ta.style.position  = "fixed";
    ta.style.left      = (containerRect.left + absPos.x) + "px";
    ta.style.top       = (containerRect.top  + absPos.y) + "px";
    ta.style.width     = (editing.width  * scaleX) + "px";
    ta.style.minHeight = (editing.height * scaleX) + "px";
    ta.style.fontSize  = ((editing.fontSize ?? 16) * scaleX) + "px";
    ta.style.fontFamily = editing.fontFamily ?? "Inter";
    ta.style.fontStyle  = editing.fontStyle ?? "normal";
    ta.style.lineHeight = String(editing.lineHeight ?? 1.2);
    ta.style.letterSpacing = ((editing.letterSpacing ?? 0) * scaleX) + "px";
    ta.style.textAlign  = editing.align ?? "left";
    ta.style.color      = editing.fill ?? "#111111";
    ta.style.transform  = `rotate(${absRot}deg)`;
    ta.style.transformOrigin = "top left";
    ta.style.display    = "block";

    ta.focus();
    ta.select();
  }, [editing, stageRef, zoom]);

  const commit = () => {
    if (!editing || !ref.current) return;
    onChange(editing.id, ref.current.value);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    // Ctrl+Enter commits (Enter alone is a newline in textarea)
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); commit(); }
  };

  if (!editing) return null;

  return (
    <textarea
      ref={ref}
      onBlur={commit}
      onKeyDown={handleKey}
      onChange={() => {}}
      className="fixed z-[200] p-0 m-0 border-2 border-primary/60 outline-none resize-none bg-transparent backdrop-blur-sm rounded"
      style={{
        boxShadow: "0 0 0 3px rgba(124,58,237,0.15)",
        caretColor: editing.fill ?? "#111111",
      }}
    />
  );
}
