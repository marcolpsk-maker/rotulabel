import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer, Line } from 'react-konva';
import { useEditorStore, CanvasElement, CM_TO_PX } from '../../store/editorStore';
import Konva from 'konva';
import useImage from 'use-image';

interface ElementRendererProps {
  element: CanvasElement;
  onSelect: (id: string | null) => void;
  onChange: (id: string, attrs: Partial<CanvasElement>) => void;
  onCommit: () => void;
}

function ImageElement({ element, onSelect, onChange, onCommit }: ElementRendererProps) {
  const [image] = useImage(element.src || element.imageData || '');
  const shapeRef = useRef<Konva.Image>(null);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onChange(element.id, { x: e.target.x(), y: e.target.y() });
    onCommit();
  }, [element.id, onChange, onCommit]);

  const handleTransformEnd = useCallback(() => {
    const node = shapeRef.current;
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
      ref={shapeRef}
      id={element.id}
      image={image}
      x={element.x} y={element.y}
      width={element.width || 100}
      height={element.height || 100}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      visible={element.visible !== false}
      draggable
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  );
}

function ElementRenderer({ element, onSelect, onChange, onCommit }: ElementRendererProps) {
  const shapeRef = useRef<Konva.Shape>(null);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onChange(element.id, { x: e.target.x(), y: e.target.y() });
    onCommit();
  }, [element.id, onChange, onCommit]);

  const handleTransformEnd = useCallback(() => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    onChange(element.id, {
      x: node.x(), y: node.y(),
      width: Math.max(5, (element.width || 100) * scaleX),
      height: Math.max(5, (element.height || 100) * scaleY),
      rotation: node.rotation(),
    });
    node.scaleX(1); node.scaleY(1);
    onCommit();
  }, [element, onChange, onCommit]);

  const commonProps = {
    id: element.id,
    x: element.x, y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    visible: element.visible !== false,
    draggable: true,
    onClick: () => onSelect(element.id),
    onTap: () => onSelect(element.id),
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  if (element.type === 'text' || element.type === 'badge') {
    return (
      <Text
        ref={shapeRef as React.RefObject<Konva.Text>}
        {...commonProps}
        text={element.text || 'Texto'}
        fontSize={element.fontSize || 16}
        fontFamily={element.fontFamily || 'Inter'}
        fontStyle={element.fontStyle || 'normal'}
        align={element.align || 'left'}
        fill={element.fill || '#0f172a'}
        width={element.width}
        wrap="word"
      />
    );
  }

  if (element.type === 'rect') {
    return (
      <Rect
        ref={shapeRef as React.RefObject<Konva.Rect>}
        {...commonProps}
        width={element.width || 100}
        height={element.height || 50}
        fill={element.fillEnabled !== false ? (element.fill || '#6366f1') : 'transparent'}
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
        ref={shapeRef as React.RefObject<Konva.Circle>}
        {...commonProps}
        x={element.x + r}
        y={element.y + r}
        radius={r}
        fill={element.fillEnabled !== false ? (element.fill || '#6366f1') : 'transparent'}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth || 0}
      />
    );
  }

  if (element.type === 'line') {
    return (
      <Line
        ref={shapeRef as React.RefObject<Konva.Line>}
        {...commonProps}
        points={[0, 0, element.width || 100, 0]}
        stroke={element.stroke || '#0f172a'}
        strokeWidth={element.strokeWidth || 2}
      />
    );
  }

  return null;
}

// Grid rendered via HTML canvas (not Konva) to avoid polluting the Konva layer
function DotGrid({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
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
  const { project, selectedId, zoom, showGrid, selectElement, updateElement, commitHistory } = useEditorStore();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const widthPx = project.widthCm * CM_TO_PX;
  const heightPx = project.heightCm * CM_TO_PX;
  const scaledW = widthPx * zoom;
  const scaledH = heightPx * zoom;

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
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f1f5f9] overflow-auto p-8">
      <div className="relative">
        {/* Dimension label */}
        <div className="absolute -top-7 left-0 right-0 flex items-center justify-center text-xs text-gray-400 font-medium">
          {project.widthCm} × {project.heightCm} cm
        </div>

        {/* Label canvas container */}
        <div
          className="relative bg-white shadow-xl"
          style={{
            width: scaledW,
            height: scaledH,
            border: '1.5px dashed #cbd5e1',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Dot grid (HTML canvas, not Konva) */}
          {showGrid && <DotGrid width={scaledW} height={scaledH} />}

          {/* Konva Stage - only elements */}
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
              {/* Background */}
              <Rect
                x={0} y={0}
                width={widthPx}
                height={heightPx}
                fill={project.backgroundColor}
                listening={false}
              />

              {/* Elements */}
              {project.elements.map((el) => {
                if (el.type === 'image') {
                  return (
                    <ImageElement
                      key={el.id}
                      element={el}
                      onSelect={selectElement}
                      onChange={updateElement}
                      onCommit={commitHistory}
                    />
                  );
                }
                return (
                  <ElementRenderer
                    key={el.id}
                    element={el}
                    onSelect={selectElement}
                    onChange={updateElement}
                    onCommit={commitHistory}
                  />
                );
              })}

              {/* Transformer */}
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
                rotateEnabled={true}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
