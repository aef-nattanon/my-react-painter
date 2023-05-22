import React, { useState, useRef, useMemo } from "react";
import { Cropper } from "./cropper";
import "cropperjs/dist/cropper.css";
import { Step } from "./step";
import { ReactCropperElement } from "react-cropper";
import { Resizer } from "./resizer";
import { KonvaDrawer } from "./KonvaDrawer";
import { string } from "prop-types";

interface Props {
  onSave: (base64: string, drawings: string) => void;
}

enum Steps {
  UPLOAD,
  CROP,
  RESIZE,
  DRAW
}

const ImageEditor: React.FC<Props> = ({ onSave }) => {
  const [image, setImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState("");
  const [resizedImage, setResizedImage] = useState("");
  const [drawing, setDrawing] = useState<{
    base64: string;
    json: string;
  } | null>(null);
  const [step, setStep] = useState(Steps.UPLOAD);

  const cropperRef = useRef<ReactCropperElement>(null);
  console.log("cropperRef", cropperRef.current);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImage(event.target.files[0]);
    }
  };

  // const handleDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   const canvas = event.currentTarget;
  //   const ctx = canvas.getContext("2d")!;
  //   const x = event.nativeEvent.offsetX;
  //   const y = event.nativeEvent.offsetY;
  //   const size = 10;
  //   const color = "#ff0000";

  //   ctx.fillStyle = color;
  //   ctx.fillRect(x - size / 2, y - size / 2, size, size);

  //   const key = Date.now().toString();
  //   setDrawings((prevDrawings) => ({
  //     ...prevDrawings,
  //     [key]: { x, y, size, color }
  //   }));
  // };

  const handleSave = () => {
    onSave(croppedImage, JSON.stringify(drawing));
  };

  const imageSrc = useMemo(
    () => (image ? URL.createObjectURL(image) : undefined),
    [image]
  );

  return (
    <div>
      <Step
        onNext={() => setStep(Steps.CROP)}
        title="Upload image"
        onNextDisabled={!image}
        step={Steps.UPLOAD}
        currentStep={step}
      >
        <input type="file" onChange={handleImageUpload} />
        {image && (
          <>
            Preview
            <img src={imageSrc} alt="" />
          </>
        )}
      </Step>
      <Step
        onNext={() => setStep(Steps.RESIZE)}
        onPrev={() => setStep(Steps.UPLOAD)}
        title="Resize image"
        onNextDisabled={false}
        step={Steps.CROP}
        currentStep={step}
      >
        <Cropper
          image={imageSrc}
          onCrop={(dataUrl) => setCroppedImage(dataUrl)}
        />
      </Step>
      <Step
        title="Resize"
        onPrev={() => setStep(Steps.CROP)}
        onNext={() => setStep(Steps.DRAW)}
        step={Steps.RESIZE}
        currentStep={step}
      >
        <Resizer
          croppedImage={croppedImage}
          resizedImage={resizedImage}
          resizeImage={(imageUrl) => setResizedImage(imageUrl)}
        />
      </Step>
      <Step
        title="Draw"
        onPrev={() => setStep(Steps.RESIZE)}
        onNext={() => {
          console.log("Should save the drawing here...");
        }}
        step={Steps.DRAW}
        currentStep={step}
      >
        <KonvaDrawer
          backgroundImageUrl={resizedImage}
          onSave={(result: { base64: string; json: string }) =>
            setDrawing(result)
          }
        />
      </Step>
      {/* <Step
        title="" */}
      {/* <button onClick={handleSave}>Save</button> */}

      <KonvaDrawer
        onSave={(result: { base64: string; json: string }) =>
          setDrawing(result)
        }
      />
      {drawing && (
        <>
          <img src={drawing.base64} alt="bla" />
          <div style={{ whiteSpace: "pre", display: "block", width: "100%" }}>
            <pre
              style={{
                background: "#f4f4f4",
                border: "1px solid #ddd",
                borderLeft: "3px solid #f36d33",
                color: "#666",
                pageBreakInside: "avoid",
                fontFamily: "monospace",
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: "1.6em",
                maxWidth: "100%",
                overflow: "auto",
                padding: "1em 1.5em",
                display: "block",
                wordWrap: "break-word"
              }}
            >
              {JSON.stringify(JSON.parse(drawing.json), null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageEditor;
