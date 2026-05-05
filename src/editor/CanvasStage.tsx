import { useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Image as KImage, Transformer, Group } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { AnyEl, PX_PER_CM } from "./types";

function ImgNode({ el, ...rest }: any) {
  const [img] = useImage(el.src, "anonymous");
  return <KImage image={img} {...rest}/>;
}

function NodeFor({ el, common }: { el: AnyEl; common: any }) {
  switch (el.type) {
    case "text": {
      const t = el as any;
      return <Text {...common} text={t.text} fontSize={t.fontSize} fontFamily={t.fontFamily}
        fontStyle={t.fontStyle ?? "normal"} align={t.align ?? "left"}
        letterSpacing={t.letterSpacing ?? 0} lineHeight={t.lineHeight ?? 1.2}
        fill={el.fill ?? "#111"} width={el.width} wrap="word"/>;
    }
    case "rect":
      return <Rect {...common} cornerRadius={(el as any).cornerRadius ?? 0} fill={el.fill ?? "#7c3aed"} stroke={el.stroke} strokeWidth={el.strokeWidth ?? 0}/>;
    case "circle":
      return <Circle {...common} x={el.x + el.width/2} y={el.y + el.height/2} radius={Math.min(el.width, el.height)/2} fill={el.fill ?? "#06b6d4"} stroke={el.stroke} strokeWidth={el.strokeWidth ?? 0}/>;
    case "line": {
      // Support vertical lines: if height > width, draw vertically
      const isVert = (el.height ?? 0) > (el.width ?? 0);
      const pts = isVert ? [0, 0, 0, el.height] : [0, 0, el.width, 0];
      return <Line {...common} points={pts} stroke={el.stroke ?? "#111"} strokeWidth={el.strokeWidth ?? 2}/>;
    }
    case "image":
    case "barcode":
    case "nutrition":
      return <ImgNode el={el} {...common}/>;
    default:
      return null;
  }
}

export default function CanvasStage({
  width, height, scale, elements, selectedId, onSelect, onChange,
  stageRef, showZoneGuides = false,
}: {
  width: number; height: number; scale: number;
  elements: AnyEl[]; selectedId: string | null;
  onSelect: (id: string|null) => void;
  onChange: (id: string, patch: Partial<AnyEl>) => void;
  stageRef: React.MutableRefObject<Konva.Stage | null>;
  showZoneGuides?: boolean;
}) {
  const trRef = useRef<Konva.Transformer | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  useEffect(() => {
    const tr = trRef.current; const layer = layerRef.current;
    if (!tr || !layer) return;
    if (selectedId) {
      const node = layer.findOne("#" + selectedId);
      tr.nodes(node ? [node] : []);
    } else { tr.nodes([]); }
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  return (
    <Stage
      ref={stageRef as any}
      width={width * scale}
      height={height * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => { if (e.target === e.target.getStage()) onSelect(null); }}
      style={{ background: "white", boxShadow: "var(--shadow-lg)", borderRadius: 6 }}
    >
      <Layer ref={layerRef}>
        <Rect x={0} y={0} width={width} height={height} fill="#fff"/>
        {/* Zone guides */}
        {showZoneGuides && [
          <Line key="z1" points={[width*0.28, 0, width*0.28, height]} stroke="#7c3aed" strokeWidth={0.5} dash={[4,4]} opacity={0.4}/>,
          <Line key="z2" points={[width*0.70, 0, width*0.70, height]} stroke="#7c3aed" strokeWidth={0.5} dash={[4,4]} opacity={0.4}/>,
        ]}
        {elements.map(el => {

          const common: any = {
            id: el.id,
            x: el.type === "circle" ? el.x : el.x,
            y: el.type === "circle" ? el.y : el.y,
            width: el.width, height: el.height,
            rotation: el.rotation ?? 0,
            opacity: el.opacity ?? 1,
            draggable: true,
            onClick: () => onSelect(el.id),
            onTap: () => onSelect(el.id),
            onDragEnd: (e: any) => onChange(el.id, { x: e.target.x() - (el.type === "circle" ? el.width/2 : 0), y: e.target.y() - (el.type === "circle" ? el.height/2 : 0) }),
            onTransformEnd: (e: any) => {
              const node = e.target;
              const sx = node.scaleX(); const sy = node.scaleY();
              node.scaleX(1); node.scaleY(1);
              const w = Math.max(8, el.width * sx); const h = Math.max(8, el.height * sy);
              const patch: any = { width: w, height: h, rotation: node.rotation() };
              if (el.type === "circle") {
                patch.x = node.x() - w/2; patch.y = node.y() - h/2;
              } else {
                patch.x = node.x(); patch.y = node.y();
              }
              if (el.type === "text") patch.fontSize = (el as any).fontSize * sy;
              onChange(el.id, patch);
            },
          };
          return <NodeFor key={el.id} el={el} common={common}/>;
        })}
        <Transformer ref={trRef} rotateEnabled={true} anchorSize={8} borderStroke="#7c3aed" anchorStroke="#7c3aed" anchorFill="#fff"/>
      </Layer>
    </Stage>
  );
}

export { PX_PER_CM };
