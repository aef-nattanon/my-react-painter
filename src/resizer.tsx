import { useEffect } from "react";
import { formatBytes, byteSize, resizeFile } from "./utils";

interface IResizer {
  croppedImage: string;
  resizedImage: string;
  resizeImage(imageUrl: string): void;
}

export const Resizer = ({
  croppedImage,
  resizedImage,
  resizeImage
}: IResizer) => {
  useEffect(() => {
    const f = async () => {
      const blob = await (await fetch(croppedImage)).blob();
      const resized = await resizeFile(blob);
      resizeImage(resized);
    };
    f();
  }, [croppedImage, resizeImage]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
        Cropped image
        <img src={croppedImage} alt="" />
        Size: {formatBytes(byteSize(croppedImage))}
      </div>
      <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
        Resized image
        <img src={resizedImage} alt="" />
        Size: {formatBytes(byteSize(resizedImage))}
      </div>
    </div>
  );
};
