import { useRef } from "react";
import { Cropper as ReactCropper, ReactCropperElement } from "react-cropper";

interface ICropper {
  image?: string;
  onCrop(dataUrl: string): void;
}
export const Cropper = ({ image, onCrop }: ICropper) => {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleImageCrop = () => {
    if (cropperRef.current) {
      const cropper = cropperRef.current?.cropper;
      onCrop(cropper.getCroppedCanvas().toDataURL());
    }
  };

  if (!image) return null;
  return (
    <>
      <div>
        <button onClick={() => cropperRef.current?.cropper.rotate(90)}>
          rotate left 90deg
        </button>
        <button onClick={() => cropperRef.current?.cropper.rotate(-90)}>
          rotate right 90deg
        </button>
      </div>
      <ReactCropper
        src={image}
        style={{ height: "60vh", width: "100%" }}
        crop={handleImageCrop}
        ref={cropperRef}
        responsive
        scalable
        rotatable
        zoomable
        draggable
        viewMode={1}
        dragMode={"move"}
        guides={false}
      />
    </>
  );
};
