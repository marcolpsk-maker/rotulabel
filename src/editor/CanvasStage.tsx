import { useEffect, useRef, useCallback, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Image as KImage, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { AnyEl, SNAP_GRID } from "./types";

// ─── Gradient helpers ─────────────────────────────────────────────────────────
function buildGradientProps(el: AnyEl) {
  const g = el.gradient;
  if (!g?.colorStops?.length) return {};
  const stops: (number | string)[] = [];
  g.colorStops.forEach(s => stops.push(s.offset, s.color));

  if (g.type === "radial") {
    const cx = el.type === "circle" ? 0 : el.width / 2;
    const cy = el.type === "circle" ? 0 : el.height / 2;
    const r  = el.type === "circle" ? Math.min(el.width, el.height) / 2 : Math.max(el.width, el.height) / 2;
    return {
      fill: undefined,
      fillRadialGradientStartPoint: { x: cx, y: cy },
      fillRadialGradientEndPoint:   { x: cx, y: cy },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius:   r,
      fillRadialGradientColorStops:  stops,
    };
  }
  const angle = ((g.angle ?? 135) * Math.PI) / 180;
  const w = el.type === "circle" ? Math.min(el.width, el.height) : el.width;
  const h = el.type === "circle" ? Math.min(el.width, el.height) : el.height;
  const cx = el.type === "circle" ? 0 : w / 2;
  const cy = el.type === "circle" ? 0 : h / 2;
  const len = Math.sqrt(w * w + h * h) / 2;
  return {
    fill: undefined,
    fillLinearGradientStartPoint: { x: cx - Math.cos(angle) * len, y: cy - Math.sin(angle) * len },
    fillLinearGradientEndPoint:   { x: cx + Math.cos(angle) * len, y: cy + Math.sin(angle) * len },
    fillLinearGradientColorStops: stops,
  };
}

function ImgNode({ el, ...rest }: any) {
  const [img] = useImage(el.src, "anonymous");
  return <KImage image={img} {...rest} />;
}

function NodeFor({ el, common }: { el: AnyEl; common: any }) {
  const gp = buildGradientProps(el);
  switch (el.type) {
    case "text": {
      const t = el as any;
      return (
        <Text {...common} text={t.text ?? ""} fontSize={t.fontSize ?? 16} fontFamily={t.fontFamily ?? "Inter"}
          fontStyle={t.fontStyle ?? "normal"} align={t.align ?? "left"}
          letterSpacing={t.letterSpacing ?? 0} lineHeight={t.lineHeight ?? 1.2}
          fill={el.fill ?? "#111111"} width={el.width} wrap="word" />
      );
    }
    case "rect":
      return <Rect {...common} {...gp} cornerRadius={(el as any).cornerRadius ?? 0}
        fill={el.gradient ? undefined : (el.fill ?? "#7c3aed")} stroke={el.stroke} strokeWidth={el.strokeWidth ?? 0} />;
    case "circle": {
      const cx = el.x + el.width / 2; const cy = el.y + el.height / 2;
      return <Circle {...common} {...gp} x={cx} y={cy} radius={Math.min(el.width, el.height) / 2}
        fill={el.gradient ? undefined : (el.fill ?? "#06b6d4")} stroke={el.stroke} strokeWidth={el.strokeWidth ?? 0} />;
    }
    case "line": {
      const isVert = (el.height ?? 0) > (el.width ?? 0);
      return <Line {...common} points={isVert ? [0,0,0,el.height] : [0,0,el.width,0]}
        stroke={el.stroke ?? "#111111"} strokeWidth={el.strokeWidth ?? 2} />;
    }
    case "image": case "barcode": case "nutrition":
      return <ImgNode el={el} {...common} />;
    default: return null;
  }
}

function snap(v: number) { return Math.round(v / SNAP_GRID) * SNAP_GRID; }

// ─── Drop zone overlay ────────────────────────────────────────────────────────
function DropOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-sm pointer-events-none"
      style={{ background: "rgba(124,58,237,0.08)", border: "2px dashed #7c3aed" }}>
      <p className="text-primary font-bold text-sm bg-background/90 px-4 py-2 rounded-full">Soltar aqui</p>
    </div>
  );
}

// ─── Main Stage ───────────────────────────────────────────────────────────────
export default function CanvasStage({
  width, height, scale, setScale, elements, selectedId, selectedIds = [],
  onSelect, onToggleSelect, onClearSelection, onChange, stageRef,
  showZoneGuides = false, snapEnabled = true,
  onDropAsset,
}: {
  width: number; height: number;
  scale: number; setScale?: (s: number) => void;
  elements: AnyEl[];
  selectedId: string | null;
  selectedIds?: string[];
  onSelect: (id: string | null) => void;
  onToggleSelect?: (id: string) => void;
  onClearSelection?: () => void;
  onChange: (id: string, patch: Partial<AnyEl>) => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  showZoneGuides?: boolean;
  snapEnabled?: boolean;
  onDropAsset?: (type: string, data: any, x: number, y: number) => void;
}) {
  const trRef      = useRef<Konva.Transformer | null>(null);
  const layerRef   = useRef<Konva.Layer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const isPanning  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Sync transformer with selection
  useEffect(() => {
    const tr = trRef.current; const layer = layerRef.current;
    if (!tr || !layer) return;
    const nodes = selectedIds.length > 0
      ? selectedIds.map(id => layer.findOne("#" + id)).filter(Boolean) as Konva.Node[]
      : selectedId ? [layer.findOne("#" + selectedId)].filter(Boolean) as Konva.Node[] : [];
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedId, selectedIds, elements]);

  // ── Mouse wheel zoom ───────────────────────────────────────────────────────
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (!setScale || !stageRef.current) return;
    const scaleBy = 1.08;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition()!;
    const oldScale = scale;
    const newScale = e.evt.deltaY < 0
      ? Math.min(3, oldScale * scaleBy)
      : Math.max(0.1, oldScale / scaleBy);
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    setScale(+newScale.toFixed(2));
  }, [scale, setScale, stageRef]);

  // ── Middle mouse / spacebar pan ────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { e.preventDefault(); isPanning.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      setStagePos(p => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = (e: MouseEvent) => { if (e.button === 1) isPanning.current = false; };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // ── HTML5 drag-and-drop from LeftPanel ────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!onDropAsset || !stageRef.current) return;
    const type = e.dataTransfer.getData("el-type");
    const data = e.dataTransfer.getData("el-data");
    const rect = containerRef.current!.getBoundingClientRect();
    // Convert screen coords to canvas coords
    const x = (e.clientX - rect.left - stagePos.x) / scale;
    const y = (e.clientY - rect.top  - stagePos.y) / scale;
    onDropAsset(type, data ? JSON.parse(data) : {}, x, y);
  };

  // ── Common node props factory ──────────────────────────────────────────────
  const makeCommon = useCallback((el: AnyEl) => {
    const isCircle = el.type === "circle";
    return {
      id: el.id,
      x: isCircle ? el.x + el.width / 2 : el.x,
      y: isCircle ? el.y + el.height / 2 : el.y,
      width: el.width, height: el.height,
      rotation: el.rotation ?? 0,
      opacity:  el.opacity  ?? 1,
      draggable: !el.locked,
      shadowColor: el.shadowColor, shadowBlur: el.shadowBlur,
      shadowOffsetX: el.shadowOffsetX, shadowOffsetY: el.shadowOffsetY,
      // Click / Shift+Click
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.evt.shiftKey && onToggleSelect) onToggleSelect(el.id);
        else onSelect(el.id);
      },
      onTap: () => onSelect(el.id),
      onDragEnd: (e: any) => {
        let nx = e.target.x(); let ny = e.target.y();
        if (snapEnabled) { nx = snap(nx); ny = snap(ny); e.target.x(nx); e.target.y(ny); }
        onChange(el.id, {
          x: isCircle ? nx - el.width / 2 : nx,
          y: isCircle ? ny - el.height / 2 : ny,
        });
      },
      onTransformEnd: (e: any) => {
        const node = e.target;
        const sx = node.scaleX(); const sy = node.scaleY();
        node.scaleX(1); node.scaleY(1);
        const w = Math.max(4, el.width * sx); const h = Math.max(4, el.height * sy);
        const patch: any = { width: w, height: h, rotation: node.rotation() };
        if (isCircle) { patch.x = node.x() - w/2; patch.y = node.y() - h/2; }
        else { patch.x = node.x(); patch.y = node.y(); }
        if (el.type === "text") patch.fontSize = (el as any).fontSize * sy;
        onChange(el.id, patch);
      },
    };
  }, [onChange, onSelect, onToggleSelect, snapEnabled]);

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ cursor: isPanning.current ? "grabbing" : "default" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DropOverlay active={isDragOver} />
      <Stage
        ref={stageRef as any}
        width={width * scale}
        height={height * scale}
        scaleX={scale} scaleY={scale}
        x={stagePos.x} y={stagePos.y}
        onWheel={handleWheel}
        onMouseDown={e => { if (e.target === e.target.getStage() && !e.evt.shiftKey) { onClearSelection?.() ?? onSelect(null); } }}
        style={{ display: "block" }}
      >
        <Layer ref={layerRef}>
          <Rect x={0} y={0} width={width} height={height} fill="#ffffff" listening={false} />

          {showZoneGuides && [
            <Line key="z1" points={[width*0.28, 0, width*0.28, height]} stroke="#7c3aed" strokeWidth={0.5} dash={[4,4]} opacity={0.5} listening={false} />,
            <Line key="z2" points={[width*0.70, 0, width*0.70, height]} stroke="#7c3aed" strokeWidth={0.5} dash={[4,4]} opacity={0.5} listening={false} />,
          ]}

          {elements.map(el => (
            <NodeFor key={el.id} el={el} common={makeCommon(el)} />
          ))}

          <Transformer
            ref={trRef}
            rotateEnabled keepRatio={false}
            anchorSize={8} anchorCornerRadius={2}
            borderStroke="#7c3aed" anchorStroke="#7c3aed" anchorFill="#ffffff"
            borderDash={[3, 3]}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export { SNAP_GRID };
