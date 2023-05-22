import React, { useMemo } from "react";
import { Layer, Image } from "react-konva";
import { Size } from "./constants";

const BackgroundImage = ({
  backgroundImageUrl,
  size
}: {
  backgroundImageUrl: string;
  size: Size;
}) => {
  const image = useMemo(() => {
    const imageObj = new window.Image();
    imageObj.src = backgroundImageUrl;
    return imageObj;
  }, [backgroundImageUrl]);

  return (
    <Layer>
      <Image image={image} />
    </Layer>
  );
};

export default BackgroundImage;
