import React, {
  FC,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import BackgroundImage from "./BackgroundImage";
import { Size, DrawnLine, Point } from "./constants";
import SideButton from "./SideButton";
import { AiOutlineDrag } from "react-icons/ai";
import {
  MdDraw,
  MdUndo,
  MdRedo,
  MdOutlineOpacity,
  MdSave
} from "react-icons/md";
import { FaEraser } from "react-icons/fa";
import { GiPlainCircle } from "react-icons/gi";
import Slider from "./Slider";
import {
  throttledWrite,
  getDistance,
  getCenter,
  getNewPosition
} from "./utils";

Konva.hitOnDragEnabled = true;
Konva.capturePointerEventsEnabled = true;

type KonvaDrawerProps = {
  backgroundImageUrl?: string;
  onSave(result: { base64: string; json: string }): void;
};

const KonvaDrawer: FC<KonvaDrawerProps> = ({ backgroundImageUrl, onSave }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);
  const isPinching = useRef(false);
  const isDragging = useRef(false);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const lastCenter = useRef<Point | null>(null);
  const lastDist = useRef<number | null>(null);
  const [lines, setLines] = useState<DrawnLine[]>([]);
  const [redos, setRedos] = useState<DrawnLine[]>([]);
  const [tool, setTool] = useState("pen");
  const [drawColor, setDrawColor] = useState("#df4b26");
  const [drawWidth, setDrawWidth] = useState(2);
  const [drawOpacity, setDrawOpacity] = useState(1);
  const [size, setSize] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(1);
  const [isScalingDrawWidth, setIsScalingDrawWidth] = useState(true);
  const cursorGhostRef = useRef<HTMLDivElement>(null);
  const [showSizeSlider, setShowSizeSlider] = useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);

  const setDraggable = useCallback(
    (draggable: boolean) => {
      isDragging.current = draggable;
      if (tool !== "move") {
        const stage = stageRef.current?.getStage();
        if (!stage) return;
        stage.draggable(draggable);
      }
    },
    [tool]
  );

  // TODO: Fix responsive
  const handleWindowResize = useCallback(() => {
    const stage = stageRef.current?.getStage();
    if (!stageContainerRef.current || !size || !stage) return;
    const containerWidth = stageContainerRef.current.clientWidth;

    const newScale = containerWidth / size.sceneWidth;
    const newStageWidth = size.sceneWidth * newScale;
    const newStageHeight = size.sceneHeight * newScale;

    const oldPos = stage.getPosition();
    const oldScale = stage.scaleX();

    const center = {
      x: -oldPos.x + size.stageWidth / 2,
      y: -oldPos.y + size.stageHeight / 2
    };

    const centerOffset = {
      x: center.x / oldScale,
      y: center.y / oldScale
    };

    const newCalculatedScale = newScale * zoom;
    const fakePointer = {
      x: centerOffset.x * oldScale + oldPos.x,
      y: centerOffset.y * oldScale + oldPos.y
    };

    const newPos = getNewPosition(
      fakePointer,
      centerOffset,
      size!,
      newScale,
      zoom
    );

    setScale(newScale);
    setSize({
      ...size,
      stageWidth: newStageWidth,
      stageHeight: newStageHeight
    });
    stage.setPosition(newPos);
    stage.width(newStageWidth);
    stage.height(newStageHeight);
    stage.scale({ x: newCalculatedScale, y: newCalculatedScale });
  }, [size, zoom]);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  useEffect(() => {
    if (backgroundImageUrl) {
      const img = new window.Image();
      img.onload = (ev) => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;
        const containerWidth = stageContainerRef.current!.offsetWidth;
        const scale = containerWidth / imageWidth;
        const containerHeight = imageHeight * scale;

        const size: Size = {
          sceneWidth: img.naturalWidth,
          sceneHeight: img.naturalHeight,
          scale,
          stageWidth: containerWidth,
          stageHeight: containerHeight
        };
        setSize(size);
        setScale(size.scale);
      };
      img.src = backgroundImageUrl;
    } else {
      const width = stageContainerRef.current!.clientWidth;
      setSize({
        sceneWidth: width,
        sceneHeight: 400,
        scale: 1,
        stageWidth: width,
        stageHeight: 400
      });
    }
  }, [backgroundImageUrl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      throttledWrite(() => {
        if (!["pen", "eraser"].includes(tool)) {
          return;
        }
        const target = e.target as HTMLElement;
        if (target.tagName === "CANVAS") {
          if (e instanceof MouseEvent) {
            cursorGhostRef.current!.style.opacity = "0.25";
            cursorGhostRef.current!.style.left = e.pageX + "px";
            cursorGhostRef.current!.style.top = e.pageY + "px";
          } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            cursorGhostRef.current!.style.opacity = "0.25";
            cursorGhostRef.current!.style.left = touch.pageX + "px";
            cursorGhostRef.current!.style.top = touch.pageY + "px";
          }
        } else {
          cursorGhostRef.current!.style.opacity = "0";
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleMouseMove);
    };
  }, [tool]);

  useEffect(() => {
    const stage = stageRef.current?.getStage();
    if (!stage) return;

    if (tool === "move") {
      stage.draggable(true);
    } else {
      stage.draggable(false);
    }
  }, [tool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (tool === "move") return;
      if (e.key === "Control" && !isDrawing.current && !isDragging.current) {
        setDraggable(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (tool === "move") return;
      if (e.key === "Control" && isDragging.current) {
        setDraggable(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [tool, setDraggable]);

  const handleUndo = () => {
    let lastLine = lines[lines.length - 1];
    setLines(lines.slice(0, -1));
    setRedos([...redos, lastLine]);
  };

  const handleRedo = () => {
    let nextLine = redos[redos.length - 1];
    setRedos(redos.slice(0, -1));
    setLines([...lines, nextLine]);
  };

  const startDraw = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    if (stage) {
      const pos = stage.getPointerPosition();
      if (pos) {
        const scale = stage.scaleX();
        const pointerOffset: Point = {
          x: (pos.x - stage.x()) / scale,
          y: (pos.y - stage.y()) / scale
        };
        setLines([
          ...lines,
          {
            tool,
            points: [pointerOffset.x, pointerOffset.y],
            color: drawColor,
            width: isScalingDrawWidth ? drawWidth / zoom : drawWidth,
            opacity: drawOpacity
          }
        ]);
        setRedos([]);
      }
    }
  };

  const draw = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    if (stage) {
      const point = stage?.getPointerPosition();
      if (point) {
        let lastLine = lines[lines.length - 1];
        const scale = stage.scaleX();
        const pointerOffset: Point = {
          x: (point.x - stage.x()) / scale,
          y: (point.y - stage.y()) / scale
        };
        lastLine.points = lastLine.points.concat([
          pointerOffset.x,
          pointerOffset.y
        ]);
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
      }
    }
  };

  const endDraw = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isDrawing.current) {
      const stage = e.target.getStage();
      if (stage) {
        const point = stage?.getPointerPosition();
        if (point) {
          let lastLine = lines[lines.length - 1];
          const scale = stage.scaleX();
          const pointerOffset: Point = {
            x: (point.x - stage.x()) / scale,
            y: (point.y - stage.y()) / scale
          };
          lastLine.points = lastLine.points.concat([
            pointerOffset.x,
            pointerOffset.y
          ]);
          lines.splice(lines.length - 1, 1, lastLine);
          setLines(lines.concat());
        }
      }
    }
    isDrawing.current = false;
  };

  const handlePinchZoom = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (stage.isDragging()) {
      stage.stopDrag();
    }

    const p1: Point = {
      x: touch1.clientX,
      y: touch1.clientY
    };
    const p2: Point = {
      x: touch2.clientX,
      y: touch2.clientY
    };

    if (!lastCenter.current) {
      lastCenter.current = getCenter(p1, p2);
      return;
    }
    const newCenter = getCenter(p1, p2);
    const dist = getDistance(p1, p2);

    if (!lastDist.current) {
      lastDist.current = dist;
    }

    const oldScale = stage.scaleX();
    const centerOffset = {
      x: (newCenter.x - stage.x()) / oldScale,
      y: (newCenter.y - stage.y()) / oldScale
    };

    let newZoom = zoom * (dist / lastDist.current);
    if (newZoom < 1) {
      newZoom = 1;
    }

    const newScale = newZoom * scale;
    const newPos = getNewPosition(
      newCenter,
      centerOffset,
      size!,
      scale,
      newZoom
    );

    setZoom(newZoom);
    stage.position(newPos);
    stage.scale({ x: newScale, y: newScale });
    stage.batchDraw();

    lastDist.current = dist;
    lastCenter.current = newCenter;
  };

  const handleMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (isDragging.current) return;
    if (["pen", "eraser"].includes(tool)) {
      startDraw(e);
    }
  };

  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 1) {
      if (["pen", "eraser"].includes(tool)) {
        startDraw(e);
      }
    } else if (touches.length === 3) {
      setDraggable(true);
    }
  };

  const handleMouseUp = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    endDraw(e);
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    handleMouseUp(e);

    lastDist.current = 0;
    lastCenter.current = null;
    setDraggable(false);
  };

  const handleMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    e.evt.preventDefault();
    draw(e);
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    if (e.evt.touches.length === 2) {
      isPinching.current = true;
      isDrawing.current = false;
      handlePinchZoom(e);
    } else if (e.evt.touches.length === 3 && isDragging.current) {
      isPinching.current = false;
      isDrawing.current = false;
    }

    if (isDrawing.current) {
      handleMouseMove(e);
    }
  };

  const handleSave = () => {
    const base64 = stageRef.current!.toDataURL();
    const json = stageRef.current!.toJSON();
    // do something with the base64 and json data

    console.log({
      base64,
      json,
      onSave
    });

    if (onSave) {
      onSave({ base64, json });
    }
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    if (e.evt.shiftKey) {
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const pointerOffset = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale
      };

      const scaleFactor = e.evt.deltaY <= 0 ? 1.2 : 1 / 1.2;
      let newZoom = Math.min(Math.max(zoom * scaleFactor, 0.1), 10);
      if (newZoom < 1) {
        newZoom = 1;
      }

      const newScale = newZoom * scale;
      const newPos = getNewPosition(
        pointer,
        pointerOffset,
        size!,
        scale,
        newZoom
      );

      setZoom(newZoom);
      stage.position(newPos);
      stage.scale({ x: newScale, y: newScale });
      stage.batchDraw();
    } else {
      const change = e.evt.deltaY <= 0 ? 1 : -1;
      let newWidth = drawWidth + change;
      if (newWidth < 1) {
        newWidth = 1;
      }
      setDrawWidth(newWidth);
    }
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const newPosition = stage.position();
    const restrictToSize = (pos: number, size: number) => {
      const offset = size * (1 - zoom);
      if (pos > 0) {
        pos = 0;
      } else if (pos < offset) {
        pos = offset;
      }
      return pos;
    };
    newPosition.x = restrictToSize(newPosition.x, size!.sceneWidth);
    newPosition.y = restrictToSize(newPosition.y, size!.sceneHeight);

    // Update the position of the stage
    stage.position(newPosition);
  };

  const calculatedScale = useMemo(() => {
    return zoom * scale;
  }, [zoom, scale]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        margin: "auto",
        display: "flex",
        flexDirection: "row"
      }}
    >
      <div
        ref={stageContainerRef}
        style={{
          borderRight: "1px solid #ccc",
          width: "100%",
          flex: 1
        }}
      >
        {size && (
          <Stage
            width={size.stageWidth}
            height={size.stageHeight}
            scale={{ x: calculatedScale, y: calculatedScale }}
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onWheel={handleWheel}
            onDragMove={handleDragMove}
          >
            {backgroundImageUrl && (
              <BackgroundImage
                backgroundImageUrl={backgroundImageUrl}
                size={size}
              />
            )}
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.width}
                  opacity={line.opacity}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>
      <div
        style={{
          width: 40,
          flex: "none"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "center",
            padding: 4,
            flexShrink: 0,
            flexGrow: 0
          }}
        >
          <SideButton active={tool === "move"} onClick={() => setTool("move")}>
            <AiOutlineDrag size={24} />
          </SideButton>
          <SideButton active={tool === "pen"} onClick={() => setTool("pen")}>
            <MdDraw size={24} />
          </SideButton>
          <SideButton
            active={tool === "eraser"}
            onClick={() => setTool("eraser")}
          >
            <FaEraser size={20} />
          </SideButton>
          <SideButton disabled={lines.length === 0} onClick={handleUndo}>
            <MdUndo size={20} />
          </SideButton>
          <SideButton disabled={redos.length === 0} onClick={handleRedo}>
            <MdRedo size={20} />
          </SideButton>

          <input
            id="color-picker"
            type="color"
            value={drawColor}
            onChange={(e) => setDrawColor(e.target.value)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              padding: 0
            }}
          />
          {/* OPACITY */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative"
            }}
          >
            <SideButton
              onClick={() => setShowOpacitySlider(!showOpacitySlider)}
            >
              <MdOutlineOpacity size={20} />
            </SideButton>
            {showOpacitySlider && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "-30px",
                  backgroundColor: "#f2f2f2",
                  width: "25px",
                  height: "200px",
                  overflow: "hidden",
                  border: "1px solid #ccc"
                }}
              >
                <Slider
                  value={drawOpacity * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) =>
                    setDrawOpacity(parseInt(e.target.value, 10) / 100)
                  }
                />
              </div>
            )}
          </div>
          {/* WIDTH */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative"
            }}
          >
            <SideButton onClick={() => setShowSizeSlider(!showSizeSlider)}>
              <GiPlainCircle size={20} />
            </SideButton>
            {showSizeSlider && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "-30px",
                  backgroundColor: "#f2f2f2",
                  width: "25px",
                  height: "200px",
                  overflow: "hidden",
                  border: "1px solid #ccc"
                }}
              >
                <Slider
                  value={drawWidth}
                  onChange={(e) => setDrawWidth(parseInt(e.target.value, 10))}
                />
              </div>
            )}
          </div>
          <SideButton onClick={handleSave}>
            <MdSave size={20} />
          </SideButton>
        </div>
      </div>
      <div
        id="cursorGhost"
        ref={cursorGhostRef}
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          height: drawWidth,
          width: drawWidth,
          borderRadius: "50%",
          border: "1px solid black",
          opacity: 0,
          pointerEvents: "none"
        }}
      />
    </div>
  );
};

export default KonvaDrawer;
