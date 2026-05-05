import { useState } from "react";
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnyEl } from "./types";

const TYPE_ICONS: Record<string, string> = {
  text: "T",
  rect: "▭",
  circle: "◯",
  line: "—",
  image: "🖼",
  barcode: "▦",
  nutrition: "⊞",
};

const TYPE_COLORS: Record<string, string> = {
  text: "bg-blue-500",
  rect: "bg-purple-500",
  circle: "bg-pink-500",
  line: "bg-green-500",
  image: "bg-orange-500",
  barcode: "bg-gray-500",
  nutrition: "bg-teal-500",
};

function getLabel(el: AnyEl): string {
  if (el.type === "text") return (el as any).text?.slice(0, 22) || "Texto";
  if (el.type === "barcode") return `Barcode: ${(el as any).code?.slice(0, 10)}`;
  if (el.type === "nutrition") return "Tabela Nutricional";
  if (el.type === "image") return "Imagem";
  return el.type.charAt(0).toUpperCase() + el.type.slice(1);
}

export default function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onRemove,
  onReorder,
  onToggleVisibility,
  hiddenIds,
}: {
  elements: AnyEl[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, dir: "front" | "back" | "forward" | "backward") => void;
  onToggleVisibility: (id: string) => void;
  hiddenIds: Set<string>;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const reversed = [...elements].reverse(); // top layer first

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border/50">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          Camadas ({elements.length})
        </p>
      </div>

      {elements.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[10px] text-muted-foreground text-center p-4">
            Adicione elementos ao canvas para ver as camadas aqui.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {reversed.map((el, i) => {
          const isSelected = el.id === selectedId;
          const isHidden = hiddenIds.has(el.id);

          return (
            <div
              key={el.id}
              draggable
              onDragStart={() => setDragging(el.id)}
              onDragEnd={() => setDragging(null)}
              onClick={() => onSelect(el.id)}
              className={cn(
                "group flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-border/30 transition-colors",
                isSelected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/40",
                dragging === el.id && "opacity-50",
                isHidden && "opacity-40"
              )}
            >
              {/* Drag handle */}
              <GripVertical className="w-3 h-3 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />

              {/* Type icon */}
              <div className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-black shrink-0",
                TYPE_COLORS[el.type] ?? "bg-gray-500"
              )}>
                {TYPE_ICONS[el.type] ?? "?"}
              </div>

              {/* Label */}
              <span className={cn(
                "flex-1 text-[10px] truncate leading-tight",
                isSelected ? "font-semibold text-foreground" : "text-muted-foreground"
              )}>
                {getLabel(el)}
              </span>

              {/* Actions (show on hover or selected) */}
              <div className={cn(
                "flex items-center gap-0.5 shrink-0",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isSelected && "opacity-100"
              )}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id); }}
                  className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center"
                  title={isHidden ? "Mostrar" : "Ocultar"}
                >
                  {isHidden
                    ? <EyeOff className="w-3 h-3 text-muted-foreground" />
                    : <Eye className="w-3 h-3 text-muted-foreground" />
                  }
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReorder(el.id, "forward"); }}
                  className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center"
                  title="Subir"
                >
                  <ChevronUp className="w-3 h-3 text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReorder(el.id, "backward"); }}
                  className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center"
                  title="Descer"
                >
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(el.id); }}
                  className="w-5 h-5 rounded hover:bg-destructive/10 flex items-center justify-center"
                  title="Remover"
                >
                  <Trash2 className="w-3 h-3 text-destructive/60" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-border/50 bg-muted/10">
        <p className="text-[9px] text-muted-foreground">
          💡 Clique para selecionar · Arraste para reordenar
        </p>
      </div>
    </div>
  );
}
