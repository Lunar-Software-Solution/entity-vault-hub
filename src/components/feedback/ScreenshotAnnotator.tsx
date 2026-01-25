import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Square,
  ArrowUpRight,
  Undo2,
  Check,
  X,
  Highlighter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = "pencil" | "rectangle" | "arrow" | "highlighter";

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  tool: Tool;
  color: string;
  points: Point[];
  endPoint?: Point;
}

interface ScreenshotAnnotatorProps {
  screenshotDataUrl: string;
  onSave: (annotatedDataUrl: string, blob: Blob) => void;
  onCancel: () => void;
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
];

const ScreenshotAnnotator = ({
  screenshotDataUrl,
  onSave,
  onCancel,
}: ScreenshotAnnotatorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Load the screenshot image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      
      // Calculate canvas size to fit container while maintaining aspect ratio
      const container = containerRef.current;
      if (container) {
        const maxWidth = container.clientWidth - 16;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        setCanvasSize({
          width: Math.max(img.width * ratio, 500),
          height: Math.max(img.height * ratio, 350),
        });
      }
      setImageLoaded(true);
    };
    img.src = screenshotDataUrl;
  }, [screenshotDataUrl]);

  // Redraw canvas whenever actions change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    // Clear and draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all actions
    const allActions = currentAction ? [...actions, currentAction] : actions;
    
    allActions.forEach((action) => {
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.tool === "highlighter" ? 20 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (action.tool === "highlighter") {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1;
      }

      if (action.tool === "pencil" || action.tool === "highlighter") {
        if (action.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
      } else if (action.tool === "rectangle" && action.endPoint) {
        const start = action.points[0];
        const end = action.endPoint;
        ctx.strokeRect(
          start.x,
          start.y,
          end.x - start.x,
          end.y - start.y
        );
      } else if (action.tool === "arrow" && action.endPoint) {
        const start = action.points[0];
        const end = action.endPoint;
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 15;
        
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;
  }, [actions, currentAction]);

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [imageLoaded, redrawCanvas]);

  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setCurrentAction({
      tool,
      color,
      points: [point],
    });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentAction) return;
    e.preventDefault();

    const point = getCanvasPoint(e);

    if (tool === "pencil" || tool === "highlighter") {
      setCurrentAction({
        ...currentAction,
        points: [...currentAction.points, point],
      });
    } else {
      setCurrentAction({
        ...currentAction,
        endPoint: point,
      });
    }
  };

  const handleEnd = () => {
    if (currentAction) {
      // Only add action if it has meaningful content
      if (
        currentAction.points.length > 1 ||
        currentAction.endPoint
      ) {
        setActions((prev) => [...prev, currentAction]);
      }
    }
    setIsDrawing(false);
    setCurrentAction(null);
  };

  const handleUndo = () => {
    setActions((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a full-resolution canvas for export
    const exportCanvas = document.createElement("canvas");
    const img = imageRef.current;
    if (!img) return;

    exportCanvas.width = img.width;
    exportCanvas.height = img.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Scale factor for annotations
    const scaleX = img.width / canvas.width;
    const scaleY = img.height / canvas.height;

    // Draw base image at full resolution
    ctx.drawImage(img, 0, 0);

    // Draw all actions scaled up
    actions.forEach((action) => {
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = (action.tool === "highlighter" ? 20 : 3) * scaleX;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (action.tool === "highlighter") {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1;
      }

      if (action.tool === "pencil" || action.tool === "highlighter") {
        if (action.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x * scaleX, action.points[0].y * scaleY);
          action.points.forEach((point) => {
            ctx.lineTo(point.x * scaleX, point.y * scaleY);
          });
          ctx.stroke();
        }
      } else if (action.tool === "rectangle" && action.endPoint) {
        const start = action.points[0];
        const end = action.endPoint;
        ctx.strokeRect(
          start.x * scaleX,
          start.y * scaleY,
          (end.x - start.x) * scaleX,
          (end.y - start.y) * scaleY
        );
      } else if (action.tool === "arrow" && action.endPoint) {
        const start = action.points[0];
        const end = action.endPoint;

        ctx.beginPath();
        ctx.moveTo(start.x * scaleX, start.y * scaleY);
        ctx.lineTo(end.x * scaleX, end.y * scaleY);
        ctx.stroke();

        const angle = Math.atan2(
          (end.y - start.y) * scaleY,
          (end.x - start.x) * scaleX
        );
        const headLength = 15 * scaleX;

        ctx.beginPath();
        ctx.moveTo(end.x * scaleX, end.y * scaleY);
        ctx.lineTo(
          end.x * scaleX - headLength * Math.cos(angle - Math.PI / 6),
          end.y * scaleY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x * scaleX, end.y * scaleY);
        ctx.lineTo(
          end.x * scaleX - headLength * Math.cos(angle + Math.PI / 6),
          end.y * scaleY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;

    const dataUrl = exportCanvas.toDataURL("image/png");
    exportCanvas.toBlob((blob) => {
      if (blob) {
        onSave(dataUrl, blob);
      }
    }, "image/png", 0.9);
  };

  const tools = [
    { id: "pencil" as Tool, icon: Pencil, label: "Pencil" },
    { id: "highlighter" as Tool, icon: Highlighter, label: "Highlighter" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "arrow" as Tool, icon: ArrowUpRight, label: "Arrow" },
  ];

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {tools.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant={tool === t.id ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              <t.icon className="h-4 w-4" />
            </Button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                color === c ? "border-foreground scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={actions.length === 0}
          className="text-foreground"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
        {imageLoaded && (
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="cursor-crosshair touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="text-foreground border-border"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          <Check className="h-4 w-4 mr-1" />
          Done
        </Button>
      </div>
    </div>
  );
};

export default ScreenshotAnnotator;
