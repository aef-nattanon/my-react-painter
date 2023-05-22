import { useEffect, useRef, useState } from "react";
import ReactPainter from "react-painter";
import "./drawer.css";

type Size = {
  w: number;
  h: number;
};

export interface IDrawer {
  image: string;
}

export const Drawer = ({ image }: IDrawer) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [size, setSize] = useState<Size | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = (ev) => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setSize({
        w,
        h
      });

      setImg(img);
    };
    img.src = image;
  }, [image]);

  useEffect(() => {
    if (size && img) {
      const canvas = document.getElementById("bgCanvas") as HTMLCanvasElement;
      console.log("canvas", canvas);
      if (canvas) {
        const context = canvas.getContext("2d");
        context?.drawImage(img, 0, 0, size.w, size.h);
      }
    }
  }, [size, img]);

  const [drawn, setDrawn] = useState("");
  const handleSave = (blob: Blob) => {
    setDrawn(URL.createObjectURL(blob));
  };

  if (!size) return null;

  return (
    <>
      <ReactPainter
        width={size.w}
        height={size.h}
        onSave={handleSave}
        render={({
          getCanvasProps,
          triggerSave,
          setLineCap,
          setLineJoin,
          setLineWidth
        }) => {
          const { ref, ...canvasProps } = getCanvasProps({
            ref: (ref) => (canvasRef.current = ref)
          });
          return (
            <div>
              <div>Awesome heading</div>
              <select onChange={(e) => setLineCap(e.target.value)}>
                <option value={"round" as const}>round</option>
                <option value={"butt" as const}>butt</option>
                <option value={"square" as const}>square</option>
              </select>
              <div className="awesomeContainer">
                <canvas
                  id="bgCanvas"
                  width={size.w}
                  height={size.h}
                  {...canvasProps}
                ></canvas>
                <canvas {...canvasProps} ref={ref} />
              </div>
              <button onClick={triggerSave}>Save</button>
            </div>
          );
        }}
      />
      DRAWN:
      <img src={drawn} alt="DRAWN" />
    </>
  );
};
