import React, { useState } from "react";
import { Image } from "react-konva";
import useImage from "use-image";

const DraggableImage = ({ imageUrl, x, y, scale, rotation, setPosition }) => {
  const [image] = useImage(imageUrl, "anonymous");
  const [orientation] = useState("portrait");
  return (
    <Image
      image={image}
      x={x}
      y={y}
      draggable
      offsetX={orientation === "portrait" ? 185 : 185} // Half of the width
      offsetY={orientation === "portrait" ? 110 : 90}  // Half of the height
      onDragMove={(e) => {
        setPosition({ x: e.target.x(), y: e.target.y() });
      }}
      scaleX={scale}
      scaleY={scale}
      rotation={rotation}
      width={orientation === "portrait" ? 370 : 340} // Landscape
      height={orientation === "portrait" ? 220 : 200} // Landscape
    />
  );
};

export default DraggableImage;
