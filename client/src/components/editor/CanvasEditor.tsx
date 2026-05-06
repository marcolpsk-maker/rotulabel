import { useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer, Line, Path, TextPath, Group } from 'react-konva';
import { useEditorStore, CanvasElement, CM_TO_PX, MM_TO_PX } from '../../store/editorStore';
import Konva from 'konva';
import useImage from 'use-image';

// ---------- helpers ----------
function applyVisualProps(node: Konva.Node, el: CanvasElement) {
  // Blend mode
  // @ts-expect-error - Konva supports globalCompositeOperation
  node.globalCompositeOperation(el.blendMode || 'source-over');

  // Filters (only on cached nodes)
  const f = el.filters || {};
  const filters: any[] = [];
  if (f.blur) filters.push(Konva.Filters.Blur);
  if (f.brightness !== undefined) filters.push(Konva.Filters.Brighten);
  if (f.contrast !== undefined) filters.push(Konva.Filters.Contrast);
  if (f.saturation !== undefined) filters.push(Konva.Filters.HSL);
  if (f.grayscale) filters.push(Konva.Filters.Grayscale);
  if (f.invert) filters.push(Konva.Filters.Invert);

  if (filters.length) {
    node.cache();
    // @ts-expect-error
    node.filters(filters);
    // @ts-expect-error
    if (f.blur) node.blurRadius(f.blur);
    // @ts-expect-error
    if (f.brightness !== undefined) node.brightness(f.brightness);
    // @ts-expect-error
    if (f.contrast !== undefined) node.contrast(f.contrast);
    // @ts-expect-error
    if (f.saturation !== undefined) node.saturation(f.saturation);
  } else {
    node.clearCache();
    // @ts-expect-error
    node.filters([]);
  }
  node.getLayer()?.batchDraw();
}

function gradientProps(el: CanvasElement) {
  if (!el.gradient || !el.gradient.colors?.length) return {};
  const w = el.width || 100;
  const h = el.height || 100;
  const angle = ((el.gradient.direction ?? 135) * Math.PI) / 180;
  const colorStops = el.gradient.colors.flatMap((c, i) => [
    i / (el.gradient!.colors.length - 1 || 1),
    c,
  ]);
  if (el.gradient.type === 'radial') {
    return {
      fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientEndRadius: Math.max(w, h) / 2,
      fillRadialGradientColorStops: colorStops,
      fillPriority: 'radial-gradient',
    };
  }
  return {
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: Math.cos(angle) * w, y: Math.sin(angle) * h },
    fillLinearGradientColorStops: colorStops,
    fillPriority: 'linear-gradient',
  };
}

interface RProps {
  element: CanvasElement;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<CanvasElement>) => void;
  onCommit: () => void;
}

function ImageElement({ element, onSelect, onChange, onCommit }: RProps) {
  const [image] = useImage(element.src || element.imageData || '');
  const ref = useRef<Konva.Image>(null);

  useEffect(() => {
    if (ref.current && image) applyVisualProps(ref.current, element);
  }, [element, image]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onChange(element.id, { x: e.target.x(), y: e.target.y() });
    onCommit();
  }, [element.id, onChange, onCommit]);

  const handleTransformEnd = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    onChange(element.id, {
      x: node.x(), y: node.y(),
      width: Math.max(5, (element.width || 100) * node.scaleX()),
      height: Math.max(5, (element.height || 100) * node.scaleY()),
      rotation: node.rotation(),
    });
    node.scaleX(1); node.scaleY(1);
    onCommit();
  }, [element, onChange, onCommit]);

  return (
    <KonvaImage
      ref={ref}
      id={element.id}
      image={image}
      x={element.x} y={element.y}
      width={element.width || 100}
      height={element.height || 100}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      visible={element.visible !== false}
      draggable={!element.locked}
      listening={!element.locked}
      shadowBlur={element.shadowBlur || 0}
      shadowColor={element.shadowColor || 'rgba(0,0,0,0.3)'}
      shadowOffsetX={element.shadowOffsetX || 0}
      shadowOffsetY={element.shadowOffsetY || 0}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  );
}

function TextElement({ element, onSelect, onChange, onCommit }: RProps) {
  const textRef = useRef<Konva.Text>(null);
  const pathRef = useRef<Konva.TextPath>(null);

  useEffect(() => {
    const node = textRef.current || pathRef.current;
    if (node) applyVisualProps(node as any, element);
  }, [element]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onChange(element.id, { x: e.target.x(), y: e.target.y() });
    onCommit();
  }, [element.id, onChange, onCommit]);

  const handleTransformEnd = useCallback(() => {
    const node = textRef.current || pathRef.current;
    if (!node) return;
    onChange(element.id, {
      x: node.x(), y: node.y(),
      width: Math.max(5, (element.width || 100) * (node as any).scaleX()),
      rotation: node.rotation(),
    });
    (node as any).scaleX(1); (node as any).scaleY(1);
    onCommit();
  }, [element, onChange, onCommit]);

  const common = {
    id: element.id,
    x: element.x, y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    visible: element.visible !== false,
    draggable: !element.locked,
    listening: !element.locked,
    onClick: () => onSelect(element.id),
    onTap: () => onSelect(element.id),
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    shadowBlur: element.shadowBlur || 0,
    shadowColor: element.shadowColor || 'transparent',
    shadowOffsetX: element.shadowOffsetX || 0,
    shadowOffsetY: element.shadowOffsetY || 0,
  };

  // Curved text via TextPath
  if (element.curve && Math.abs(element.curve) > 1) {
    const w = element.width || 200;
    const r = w / (Math.PI * (Math.abs(element.curve) / 180)); // approx radius
    const sweep = element.curve > 0 ? 1 : 0;
    const data = `M 0 ${r} A ${r} ${r} 0 0 ${sweep} ${w} ${r}`;
    return (
      <TextPath
        ref={pathRef}
        {...common}
        data={data}
        text={element.text || 'Texto'}
        fontSize={element.fontSize || 16}
        fontFamily={element.fontFamily || 'Inter'}
        fontStyle={element.fontStyle || 'normal'}
        fill={element.fill || '#0f172a'}
        stroke={element.textStroke}
        strokeWidth={element.textStrokeWidth || 0}
      />
    );
  }

  return (
    <Text
      ref={textRef}
      {...common}
      text={element.text || 'Texto'}
      fontSize={element.fontSize || 16}
      fontFamily={element.fontFamily || 'Inter'}
      fontStyle={element.fontStyle || 'normal'}
      align={element.align || 'left'}
      fill={element.fill || '#0f172a'}
      width={element.width}
      letterSpacing={element.letterSpacing || 0}
      lineHeight={element.lineHeight || 1.2}
      stroke={element.textStroke}
      strokeWidth={element.textStrokeWidth || 0}
      fillAfterStrokeEnabled
      wrap="word"
    />
  );
}

function ShapeElement({ element, onSelect, onChange, onCommit }: RProps) {
  const ref = useRef<Konva.Shape>(null);

  useEffect(() => {
    if (ref.current) applyVisualProps(ref.current, element);
  }, [element]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onChange(element.id, { x: e.target.x(), y: e.target.y() });
    onCommit();
  }, [element.id, onChange, onCommit]);

  const handleTransformEnd = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    onChange(element.id, {
      x: node.x(), y: node.y(),
      width: Math.max(5, (element.width || 100) * node.scaleX()),
      height: Math.max(5, (element.height || 100) * node.scaleY()),
      rotation: node.rotation(),
    });
    node.scaleX(1); node.scaleY(1);
    onCommit();
  }, [element, onChange, onCommit]);

  const common = {
    id: element.id,
    x: element.x, y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    visible: element.visible !== false,
    draggable: !element.locked,
    listening: !element.locked,
    onClick: () => onSelect(element.id),
    onTap: () => onSelect(element.id),
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    shadowBlur: element.shadowBlur || 0,
    shadowColor: element.shadowColor || 'transparent',
    shadowOffsetX: element.shadowOffsetX || 0,
    shadowOffsetY: element.shadowOffsetY || 0,
    ...gradientProps(element),
  };

  if (element.type === 'rect') {
    return (
      <Rect
        ref={ref as React.RefObject<Konva.Rect>}
        {...common}
        width={element.width || 100}
        height={element.height || 50}
        fill={element.gradient ? undefined : (element.fillEnabled !== false ? (element.fill || '#6366f1') : 'transparent')}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth || 0}
        cornerRadius={element.cornerRadius || 0}
      />
    );
  }
  if (element.type === 'circle') {
    const r = (element.width || 60) / 2;
    return (
      <Circle
        ref={ref as React.RefObject<Konva.Circle>}
        {...common}
        x={element.x + r}
        y={element.y + r}
        radius={r}
        fill={element.gradient ? undefined : (element.fillEnabled !== false ? (element.fill || '#6366f1') : 'transparent')}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth || 0}
      />
    );
  }
  if (element.type === 'line') {
    return (
      <Line
        ref={ref as React.RefObject<Konva.Line>}
        {...common}
        points={[0, 0, element.width || 100, 0]}
        stroke={element.stroke || '#0f172a'}
        strokeWidth={element.strokeWidth || 2}
      />
    );
  }
  return null;
}

function DotGrid({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    const spacing = 20;
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [width, height]);
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

export default function CanvasEditor() {
  const { project, selectedId, zoom, showGrid, showGuides, selectElement, updateElement, commitHistory } = useEditorStore();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const widthPx = project.widthCm * CM_TO_PX;
  const heightPx = project.heightCm * CM_TO_PX;
  const scaledW = widthPx * zoom;
  const scaledH = heightPx * zoom;

  const guides = project.guides;
  const bleed = (guides?.bleedMm ?? 3) * MM_TO_PX;
  const safe = (guides?.safeMm ?? 3) * MM_TO_PX;

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (selectedId) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, project.elements]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) selectElement(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-200 dark:bg-neutral-900 overflow-auto p-8">
      <div className="relative">
        <div className="absolute -top-7 left-0 right-0 flex items-center justify-center text-xs text-neutral-500 font-medium">
          {project.widthCm} × {project.heightCm} cm
        </div>

        <div
          className="relative bg-white shadow-2xl"
          style={{
            width: scaledW,
            height: scaledH,
            border: '1px solid #cbd5e1',
            overflow: 'visible',
          }}
        >
          {showGrid && <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <DotGrid width={scaledW} height={scaledH} />
          </div>}

          <Stage
            ref={stageRef}
            width={scaledW}
            height={scaledH}
            scaleX={zoom}
            scaleY={zoom}
            onClick={handleStageClick}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <Layer>
              <Rect
                x={0} y={0}
                width={widthPx}
                height={heightPx}
                fill={project.backgroundColor}
                listening={false}
              />

              {project.elements.map((el) => {
                if (el.type === 'image') {
                  return <ImageElement key={el.id} element={el} onSelect={selectElement} onChange={updateElement} onCommit={commitHistory} />;
                }
                if (el.type === 'text' || el.type === 'badge' || el.type === 'nutritionTable') {
                  return <TextElement key={el.id} element={el} onSelect={selectElement} onChange={updateElement} onCommit={commitHistory} />;
                }
                return <ShapeElement key={el.id} element={el} onSelect={selectElement} onChange={updateElement} onCommit={commitHistory} />;
              })}

              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
                borderStroke="#6366f1"
                anchorStroke="#6366f1"
                anchorFill="#ffffff"
                anchorSize={8}
                rotateEnabled
              />
            </Layer>

            {/* Guides layer (non-exportable when toggled off; remains visible by default) */}
            {showGuides && (
              <Layer listening={false}>
                {/* Bleed (vermelho) - extrapola */}
                <Rect
                  x={-bleed} y={-bleed}
                  width={widthPx + bleed * 2}
                  height={heightPx + bleed * 2}
                  stroke="#ef4444"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
                {/* Cut (preto) */}
                <Rect
                  x={0} y={0}
                  width={widthPx}
                  height={heightPx}
                  stroke="#0f172a"
                  strokeWidth={1}
                />
                {/* Safe area (verde) */}
                <Rect
                  x={safe} y={safe}
                  width={widthPx - safe * 2}
                  height={heightPx - safe * 2}
                  stroke="#22c55e"
                  strokeWidth={1}
                  dash={[6, 4]}
                />
                {/* Vertical panel guides (3 painéis) */}
                {guides?.panels?.map((px, i) => (
                  <Line key={i} points={[px, 0, px, heightPx]} stroke="#3b82f6" strokeWidth={0.8} dash={[2, 4]} />
                ))}
              </Layer>
            )}
          </Stage>
        </div>

        {/* Legenda das guias */}
        {showGuides && (
          <div className="absolute -bottom-6 left-0 flex gap-3 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-red-500" />Sangria</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-neutral-900 dark:bg-white" />Corte</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-green-500" />Segurança</span>
          </div>
        )}
      </div>
    </div>
  );
}
