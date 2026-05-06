import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer, Star, Line } from 'react-konva';
import { useEditorStore, CanvasElement } from '../../store/editorStore';
import Konva from 'konva';

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, attrs: Partial<CanvasElement>) => void;
  onCommit: () => void;
}

function getFillConfig(element: CanvasElement): Partial<Konva.ShapeConfig> {
  if (element.gradient && element.width && element.height) {
    const { gradient } = element;
    if (gradient.type === 'linear') {
      const rad = ((gradient.direction || 135) * Math.PI) / 180;
      const w = element.width || 100;
      const h = element.height || 60;
      const x1 = w / 2 - (Math.cos(rad) * w) / 2;
      const y1 = h / 2 - (Math.sin(rad) * h) / 2;
      const x2 = w / 2 + (Math.cos(rad) * w) / 2;
      const y2 = h / 2 + (Math.sin(rad) * h) / 2;
      return {
        fillLinearGradientStartPoint: { x: x1, y: y1 },
        fillLinearGradientEndPoint: { x: x2, y: y2 },
        fillLinearGradientColorStops: [0, gradient.colors[0], 1, gradient.colors[1]],
        fill: undefined,
      };
    } else if (gradient.type === 'radial') {
      const w = element.width || 100;
      const h = element.height || 60;
      return {
        fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
        fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: Math.max(w, h) / 2,
        fillRadialGradientColorStops: [0, gradient.colors[0], 1, gradient.colors[1]],
        fill: undefined,
      };
    }
  }
  return { fill: element.fill || '#7c3aed' };
}

function CanvasElementRenderer({ element, isSelected, onSelect, onChange, onCommit }: CanvasElementRendererProps) {
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
      x: node.x(),
      y: node.y(),
      width: Math.max(5, (element.width || 100) * scaleX),
      height: Math.max(5, (element.height || 100) * scaleY),
      rotation: node.rotation(),
      scaleX: 1,
      scaleY: 1,
    });
    node.scaleX(1);
    node.scaleY(1);
    onCommit();
  }, [element, onCommit]);

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    draggable: element.draggable !== false,
    onClick: () => onSelect(element.id),
    onTap: () => onSelect(element.id),
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    shadowBlur: element.shadowBlur || 0,
    shadowColor: element.shadowColor || '#000000',
    shadowOffsetX: element.shadowOffsetX || 0,
    shadowOffsetY: element.shadowOffsetY || 0,
  };

  const fillConfig = getFillConfig(element);

  if (element.type === 'rect') {
    return (
      <Rect
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Rect>}
        width={element.width || 100}
        height={element.height || 60}
        {...fillConfig}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        cornerRadius={element.cornerRadius || 0}
      />
    );
  }

  if (element.type === 'circle') {
    const circleFill = element.gradient ? undefined : (element.fill || '#7c3aed');
    return (
      <Circle
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Circle>}
        radius={element.radius || 40}
        fill={circleFill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
      />
    );
  }

  if (element.type === 'text') {
    return (
      <Text
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Text>}
        text={element.text || 'Texto'}
        fontSize={element.fontSize || 20}
        fontFamily={element.fontFamily || 'Montserrat'}
        fill={element.fill || '#ffffff'}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        align="center"
        offsetX={(element.width || 200) / 2}
        width={element.width || 200}
      />
    );
  }

  if (element.type === 'star') {
    return (
      <Star
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Star>}
        numPoints={5}
        innerRadius={(element.radius || 40) * 0.5}
        outerRadius={element.radius || 40}
        fill={element.fill || '#d97706'}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
      />
    );
  }

  if (element.type === 'triangle') {
    const r = element.radius || 40;
    return (
      <Line
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Line>}
        points={[0, -r, r * 0.866, r * 0.5, -r * 0.866, r * 0.5]}
        closed
        fill={element.fill || '#ef4444'}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
      />
    );
  }

  if (element.type === 'line') {
    return (
      <Line
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Line>}
        points={[0, 0, element.width || 200, 0]}
        stroke={element.stroke || element.fill || '#7c3aed'}
        strokeWidth={element.strokeWidth || 2}
      />
    );
  }

  if (element.type === 'image' && element.src) {
    const img = new window.Image();
    img.src = element.src;
    img.crossOrigin = 'anonymous';
    return (
      <KonvaImage
        {...commonProps}
        ref={shapeRef as React.RefObject<Konva.Image>}
        image={img}
        width={element.width || 100}
        height={element.height || 100}
        cornerRadius={element.cornerRadius || 0}
      />
    );
  }

  return null;
}

export default function CanvasEditor() {
  const { project, selectedId, zoom, selectElement, updateElement, commitHistory, showGrid } = useEditorStore();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

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
  }, [selectedId]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  const scaledW = project.width * zoom;
  const scaledH = project.height * zoom;

  return (
    <div className="flex-1 flex items-center justify-center bg-[#141414] overflow-auto">
      <div
        className="relative shadow-2xl"
        style={{
          width: scaledW,
          height: scaledH,
          background: project.backgroundGradient || project.backgroundColor,
          borderRadius: 4,
        }}
      >
        <Stage
          ref={stageRef}
          width={scaledW}
          height={scaledH}
          scaleX={zoom}
          scaleY={zoom}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={project.width}
              height={project.height}
              fill={project.backgroundColor}
              listening={false}
            />

            {/* Grid */}
            {showGrid && Array.from({ length: Math.floor(project.width / 20) }).map((_, i) => (
              <Line
                key={`vg${i}`}
                points={[(i + 1) * 20, 0, (i + 1) * 20, project.height]}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                listening={false}
              />
            ))}
            {showGrid && Array.from({ length: Math.floor(project.height / 20) }).map((_, i) => (
              <Line
                key={`hg${i}`}
                points={[0, (i + 1) * 20, project.width, (i + 1) * 20]}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
                listening={false}
              />
            ))}

            {/* Elements */}
            {project.elements.map((el) => (
              <CanvasElementRenderer
                key={el.id}
                element={el}
                isSelected={selectedId === el.id}
                onSelect={selectElement}
                onChange={updateElement}
                onCommit={commitHistory}
              />
            ))}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
              borderStroke="#7c3aed"
              anchorStroke="#7c3aed"
              anchorFill="#ffffff"
              anchorSize={8}
              rotateAnchorOffset={20}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
