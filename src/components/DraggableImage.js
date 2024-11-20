import React, { useState } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

const DraggableImage = ({ imageUrl, x, y, rectWidth, rectHeight, scale, rotation, setPosition }) => {
  const [image] = useImage(imageUrl, "anonymous");

  if (!image) return null; // Wait until the image is loaded

  const imageAspectRatio = image.width / image.height;
  const rectAspectRatio = rectWidth / rectHeight;

  // Dynamically calculate image dimensions to fit within the Rect
  let displayWidth, displayHeight;

  if (imageAspectRatio > rectAspectRatio) {
    // Image is wider; scale by width
    displayWidth = rectWidth;
    displayHeight = rectWidth / imageAspectRatio;
  } else {
    // Image is taller or same aspect ratio; scale by height
    displayHeight = rectHeight;
    displayWidth = rectHeight * imageAspectRatio;
  }

  return (
    <Image
      image={image}
      x={x}
      y={y}
      draggable
      offsetX={displayWidth / 2}
      offsetY={displayHeight / 2}
      onDragMove={(e) => {
        setPosition({ x: e.target.x(), y: e.target.y() });
      }}
      scaleX={scale}
      scaleY={scale}
      rotation={rotation}
      width={displayWidth}
      height={displayHeight}
    />
  );
};

export default DraggableImage;
