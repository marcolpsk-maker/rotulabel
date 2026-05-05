import { useEffect, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Image as KImage, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { AnyEl, PX_PER_CM, SNAP_GRID } from "./types";

// ─── Gradient helpers ─────────────────────────────────────────────────────────
function buildGradientProps(el: AnyEl) {
  const g = el.gradient;
  if (!g || !g.colorStops?.length) return {};

  // Flatten colorStops → Konva format: [offset, color, offset, color, ...]
  const stops: (number | string)[] = [];
  g.colorStops.forEach(s => stops.push(s.offset, s.color));

  if (g.type === "radial") {
    const cx = el.type === "circle" ? 0 : el.width / 2;
    const cy = el.type === "circle" ? 0 : el.height / 2;
    const r = el.type === "circle" ? Math.min(el.width, el.height) / 2 : Math.max(el.width, el.height) / 2;
    return {
      fill: undefined,
      fillRadialGradientStartPoint: { x: cx, y: cy },
      fillRadialGradientEndPoint: { x: cx, y: cy },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: r,
      fillRadialGradientColorStops: stops,
    };
  }

  // Linear gradient — convert angle to start/end points
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

// ─── Image node ───────────────────────────────────────────────────────────────
function ImgNode({ el, ...rest }: any) {
  const [img] = useImage(el.src, "anonymous");
  return <KImage image={img} {...rest} />;
}

// ─── Per-element renderer ─────────────────────────────────────────────────────
function NodeFor({ el, common }: { el: AnyEl; common: any }) {
  const gp = buildGradientProps(el);

  switch (el.type) {
    case "text": {
      const t = el as any;
      return (
        <Text
          {...common}
          text={t.text ?? ""}
          fontSize={t.fontSize ?? 16}
          fontFamily={t.fontFamily ?? "Inter"}
          fontStyle={t.fontStyle ?? "normal"}
          align={t.align ?? "left"}
          letterSpacing={t.letterSpacing ?? 0}
          lineHeight={t.lineHeight ?? 1.2}
          fill={el.fill ?? "#111111"}
          width={el.width}
          wrap="word"
        />
      );
    }
    case "rect":
      return (
        <Rect
          {...common}
          {...gp}
          cornerRadius={(el as any).cornerRadius ?? 0}
          fill={el.gradient ? undefined : (el.fill ?? "#7c3aed")}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth ?? 0}
        />
      );
    case "circle": {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const r = Math.min(el.width, el.height) / 2;
      return (
        <Circle
          {...common}
          {...gp}
          x={cx} y={cy} radius={r}
          fill={el.gradient ? undefined : (el.fill ?? "#06b6d4")}
          stroke={el.stroke}
          strokeWidth={el.strokeWidth ?? 0}
        />
      );
    }
    case "line": {
      const isVert = (el.height ?? 0) > (el.width ?? 0);
      const pts = isVert ? [0, 0, 0, el.height] : [0, 0, el.width, 0];
      return (
        <Line
          {...common}
          points={pts}
          stroke={el.stroke ?? "#111111"}
          strokeWidth={el.strokeWidth ?? 2}
        />
      );
    }
    case "image":
    case "barcode":
    case "nutrition":
      return <ImgNode el={el} {...common} />;
    default:
      return null;
  }
}

// ─── Snap helper ──────────────────────────────────────────────────────────────
function snapVal(v: number): number {
  return Math.round(v / SNAP_GRID) * SNAP_GRID;
}

// ─── Main Stage component ─────────────────────────────────────────────────────
export default function CanvasStage({
  width, height, scale, elements, selectedId, onSelect, onChange,
  stageRef, showZoneGuides = false, snapEnabled = true,
}: {
  width: number; height: number; scale: number;
  elements: AnyEl[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<AnyEl>) => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  showZoneGuides?: boolean;
  snapEnabled?: boolean;
}) {
  const trRef = useRef<Konva.Transformer | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  // Update transformer when selection changes
  useEffect(() => {
    const tr = trRef.current;
    const layer = layerRef.current;
    if (!tr || !layer) return;
    if (selectedId) {
      const node = layer.findOne("#" + selectedId);
      tr.nodes(node ? [node] : []);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  const handleDragEnd = useCallback((el: AnyEl, e: any) => {
    let nx = e.target.x();
    let ny = e.target.y();
    if (snapEnabled) { nx = snapVal(nx); ny = snapVal(ny); }
    const isCircle = el.type === "circle";
    onChange(el.id, {
      x: isCircle ? nx - el.width / 2 : nx,
      y: isCircle ? ny - el.height / 2 : ny,
    });
    // Snap back node position
    if (snapEnabled) { e.target.x(nx); e.target.y(ny); }
  }, [onChange, snapEnabled]);

  const handleTransformEnd = useCallback((el: AnyEl, e: any) => {
    const node = e.target;
    const sx = node.scaleX();
    const sy = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const w = Math.max(4, el.width * sx);
    const h = Math.max(4, el.height * sy);
    const patch: any = { width: w, height: h, rotation: node.rotation() };
    if (el.type === "circle") {
      patch.x = node.x() - w / 2;
      patch.y = node.y() - h / 2;
    } else {
      patch.x = node.x();
      patch.y = node.y();
    }
    if (el.type === "text") patch.fontSize = (el as any).fontSize * sy;
    onChange(el.id, patch);
  }, [onChange]);

  return (
    <Stage
      ref={stageRef as any}
      width={width * scale}
      height={height * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={e => { if (e.target === e.target.getStage()) onSelect(null); }}
      style={{ display: "block" }}
    >
      <Layer ref={layerRef}>
        {/* White background */}
        <Rect x={0} y={0} width={width} height={height} fill="#ffffff" listening={false} />

        {/* Zone guides */}
        {showZoneGuides && [
          <Line key="z1" points={[width * 0.28, 0, width * 0.28, height]} stroke="#7c3aed" strokeWidth={0.5} dash={[4, 4]} opacity={0.5} listening={false} />,
          <Line key="z2" points={[width * 0.70, 0, width * 0.70, height]} stroke="#7c3aed" strokeWidth={0.5} dash={[4, 4]} opacity={0.5} listening={false} />,
        ]}

        {/* Elements */}
        {elements.map(el => {
          const isCircle = el.type === "circle";
          const common: any = {
            id: el.id,
            x: isCircle ? el.x + el.width / 2 : el.x,
            y: isCircle ? el.y + el.height / 2 : el.y,
            width: el.width,
            height: el.height,
            rotation: el.rotation ?? 0,
            opacity: el.opacity ?? 1,
            draggable: !el.locked,
            shadowColor: el.shadowColor,
            shadowBlur: el.shadowBlur,
            shadowOffsetX: el.shadowOffsetX,
            shadowOffsetY: el.shadowOffsetY,
            onClick: () => onSelect(el.id),
            onTap: () => onSelect(el.id),
            onDragEnd: (e: any) => handleDragEnd(el, e),
            onTransformEnd: (e: any) => handleTransformEnd(el, e),
          };
          return <NodeFor key={el.id} el={el} common={common} />;
        })}

        {/* Transformer */}
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio={false}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#7c3aed"
          anchorStroke="#7c3aed"
          anchorFill="#ffffff"
          borderDash={[3, 3]}
        />
      </Layer>
    </Stage>
  );
}

export { PX_PER_CM };
