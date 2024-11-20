import React, { useState, useRef, useEffect, useMemo } from "react";
import DraggableImage from "@/components/DraggableImage";
// import { Rect, Text } from "react-konva";
import Image from "next/image";

import dynamic from "next/dynamic";



// Dynamically import react-konva components
const Stage = dynamic(() => import("react-konva").then((mod) => mod.Stage), { ssr: false });
const Layer = dynamic(() => import("react-konva").then((mod) => mod.Layer), { ssr: false });
const Rect = dynamic(() => import("react-konva").then((mod) => mod.Rect), { ssr: false });
const Text = dynamic(() => import("react-konva").then((mod) => mod.Text), { ssr: false });


const PhotoIDMergeTool = () => {
  const [isKonvaLoaded, setIsKonvaLoaded] = useState(false);

  useEffect(() => {
    const loadKonva = async () => {
      await import("react-konva");
      setIsKonvaLoaded(true);
    };
    loadKonva();
  }, []);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontImageScale, setFrontImageScale] = useState(1);
  const [backImageScale, setBackImageScale] = useState(1);
  const [frontImageRotation, setFrontImageRotation] = useState(0);
  const [backImageRotation, setBackImageRotation] = useState(0);
  const [stageWidth, setStageWidth] = useState(0);
  const [imageFormat, setImageFormat] = useState("image/jpeg"); // Default to JPG

  const [orientation, setOrientation] = useState("portrait");

  useEffect(() => {
    const storedOrientation = localStorage.getItem("orientation");
    if (storedOrientation) {
      setOrientation(storedOrientation);
    }
  }, []);

  
  
  const handleOrientationChange = (value) => {
    setOrientation(value);
    localStorage.setItem("orientation", value); // Save to localStorage
  };
  const [showLabels, setShowLabels] = useState(true); // Toggle labels and borders

  const containerRef = useRef(null);
  const stageRef = useRef(null);

  

const stageHeight = stageWidth * (orientation === "portrait" ? 1.375 : 0.6);


const frontImageDefaultPosition = useMemo(() => ({
  x: orientation === "portrait"
    ? (stageWidth - stageWidth * 0.1) / 2
    : stageWidth * 0.08 + stageWidth * 0.4 / 2, // Center horizontally within left half for landscape
  y: orientation === "portrait"
    ? (stageHeight * 0.6 - stageHeight * 0.42) / 2 + stageHeight * 0.3 / 2 // Center vertically in top half for portrait
    : (stageHeight - stageHeight * 0.55) / 2 + stageHeight * 0.42 / 2, // Center vertically for landscape
}), [orientation, stageWidth, stageHeight]);

const backImageDefaultPosition = useMemo(() => ({
  x: orientation === "portrait"
    ? (stageWidth - stageWidth * 0.9) / 2 + stageWidth * 0.8 / 2 // Center horizontally for portrait
    : stageWidth * 0.6 + stageWidth * 0.4 / 2, // Center horizontally within right half for landscape
  y: orientation === "portrait"
    ? stageHeight / 2 + (stageHeight * 0.40) / 2 // Center vertically in bottom half for portrait
    : (stageHeight - stageHeight * 0.55) / 2 + stageHeight * 0.42 / 2, // Center vertically for landscape
}), [orientation, stageWidth, stageHeight]);

useEffect(() => {
  setFrontImagePosition(frontImageDefaultPosition);
  setBackImagePosition(backImageDefaultPosition);
}, [frontImageDefaultPosition, backImageDefaultPosition]);

const [frontImagePosition, setFrontImagePosition] = useState(frontImageDefaultPosition);
const [backImagePosition, setBackImagePosition] = useState(backImageDefaultPosition);  

useEffect(() => {
  const updateStageWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const padding = containerWidth * 0.10; // 10% padding on each side
      const newStageWidth = containerWidth - padding; // Reduced width
      if (newStageWidth !== stageWidth) {
        setStageWidth(newStageWidth);
      }
    }
  };

  // Initial calculation
  updateStageWidth();

  // Recalculate on resize
  const handleResize = () => {
    updateStageWidth();
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [orientation, stageWidth]); // Recalculate when orientation changes



  const handleFileChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };
  // Image Remove and Reset the file input
  const backFileInputRef = useRef(null);
  const frontFileInputRef = useRef(null);
  if (frontFileInputRef.current) {
    frontFileInputRef.current.value = "";
  }
  if (backFileInputRef.current) {
    backFileInputRef.current.value = "";
  }



  const handleDownload = () => {
    try {
      // Ensure Konva and react-konva are fully loaded
      if (typeof window === 'undefined' || typeof window.Konva === 'undefined') {
        console.error('Konva is not loaded');
        return;
      }

      // Set consistent dimensions for export
      const width = stageWidth * 1.2;
      const height = stageHeight;

  
      // Wait for a moment to ensure all components are rendered
      setTimeout(() => {
        // Try multiple methods to get the stage
        let stage = null;
  
        // Method 1: Try to use the ref directly
        if (stageRef.current && typeof stageRef.current.getStage === 'function') {
          stage = stageRef.current.getStage();
        }
  
        // Method 2: Find stage via DOM query
        if (!stage) {
          const stageElements = document.querySelectorAll('.konvajs-content');
          if (stageElements.length > 0) {
            // Try to get the first stage element
            const stageElement = stageElements[0];
            stage = stageElement.__react_konva_instance__;
          }
        }
  
        // Method 3: Fallback to Konva global stages
        if (!stage && window.Konva && window.Konva.stages && window.Konva.stages.length > 0) {
          stage = window.Konva.stages[0];
        }
  
        if (!stage) {
          console.error('Could not find Konva stage through any method');
          return;
        }
  
        // Temporarily hide labels and borders
        setShowLabels(false);
  
        setTimeout(() => {
          try {
            // Create a white background rectangle
            const backgroundRect = new window.Konva.Rect({
              x: 0,
              y: 0,
              width: width,
              height: height,
              fill: "white",
            });
  
            // Get the first layer
            const layer = stage.getLayers()[0];
  
            if (!layer) {
              console.error('No layer found in the stage');
              setShowLabels(true);
              return;
            }
  
            // Add the background rectangle and ensure it's rendered below everything
            layer.add(backgroundRect);
            backgroundRect.moveToBottom();
            layer.batchDraw();
  
            // Ensure all images are loaded before rendering
            Promise.all(
              layer.children
                ?.filter(child => child instanceof window.Konva.Image)
                .map(child => {
                  if (child.image() && !child.image().complete) {
                    return new Promise((resolve) => {
                      child.image().onload = resolve;
                    });
                  }
                  return Promise.resolve();
                }) || []
            ).then(() => {
              // Generate the data URL for the stage
              const dataURL = stage.toDataURL({ mimeType: imageFormat });
  
              // Clean up
              backgroundRect.destroy();
              layer.batchDraw(); // Redraw the layer without the background
              setShowLabels(true);
  
              // Trigger the download
              const link = document.createElement("a");
              link.download = `merged-image.${imageFormat === "image/png" ? "png" : "jpg"}`;
              link.href = dataURL;
              link.click();
            }).catch(error => {
              console.error('Error in image loading:', error);
              setShowLabels(true);
            });
          } catch (layerError) {
            console.error('Error in layer processing:', layerError);
            setShowLabels(true);
          }
        }, 200); // Increased delay to ensure full rendering
      }, 100);
    } catch (error) {
      console.error("Error in download process:", error);
      setShowLabels(true);
    }
  };
  
  return (
    <div className="min-h-screen sm:bg-gray-100 py-8">
  <div className="max-w-4xl mx-auto bg-white shadow-lg border border-teal-500 rounded-lg py-6 px-3 sm:px-8">
    <div className="flex items-center justify-between mb-6">
      {/* H1 on the left */}
      <h1 className="text-4xl font-bold text-teal-600">
        ID Card Front and Back Merger Tool
      </h1>
      {/* Image on the right */}
      <div className="relative w-32 h-28"> {/* Wrapper to set the width/height */}
        <Image
          src="/merge-image.png" // Path to the image in the public folder
          alt="Merge Tool"
          layout="fill" // Ensures the image fills the parent container
          objectFit="contain" // Keeps the aspect ratio of the image
          priority // Ensures the image loads quickly
        />
      </div>
    </div>
        <p className="text-1xl text-center text-gray-500 mb-10">
        Effortlessly combine the front and back sides of your ID card into a single page. This tool allows you to upload, scale, rotate, and position images with ease, making it perfect for creating professional-looking ID card layouts. Simplify your workflow and get your ID cards ready in no time!</p>
        
        <div className="flex items-center justify-center space-x-4 mb-4">
        <label
            htmlFor="canvas-orientation"
            className="text-xl text-teal-700 font-semibold mb-1 text-center"
          >
            Select Canvas
          </label>
          <div className="relative inline-block">
            <select
              id="canvas-orientation"
              value={orientation}
              onChange={(e) => handleOrientationChange(e.target.value)}
              className="appearance-none border border-teal-500 text-teal-700 bg-white rounded-lg pl-4 pr-6 py-1 font-semibold shadow-md hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>



  
        {/* Dynamic Layout for Portrait or Landscape */}
        <div
          className={`${
            orientation === "portrait"
              ? "grid grid-cols-1 lg:grid-cols-[40%,60%]"
              : "flex flex-col space-y-8"
          } gap-5 mt-2`}
        >
          {/* Upload Section */}
          <div
              className={`${
                orientation === "landscape" ? "flex justify-between gap-6" : "space-y-6"
              }`}
            >
              {/* Front Image Upload */}
              <div className="flex-1">
                <label className="block text-teal-700 font-semibold my-2">
                  Upload Front Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    className="hidden"
                    id="front-upload"
                    ref={frontFileInputRef} // Attach the ref to reset input
                    onChange={(e) => handleFileChange(e, setFrontImage)}
                  />
                  <label
                    htmlFor="front-upload"
                    className="border-2 border-dashed border-teal-400 rounded-lg h-52 mx-auto flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-600 relative"
                  >
                    {frontImage ? (
                      <>
                        <img
                          src={frontImage}
                          alt="Front"
                          className="h-full object-contain rounded-md mx-auto"
                        />
                        {/* Hover overlay with remove button */}
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default button behavior
                              setFrontImage(null); // Clear the image
                              if (frontFileInputRef.current) {
                                frontFileInputRef.current.value = ""; // Reset the file input
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src="/image-upload-icon.png" // Path to the icon in the public folder
                          alt="Upload Icon"
                          className="w-12 h-12 mb-2" // Adjust size of the icon
                        />
                        <span>Click to upload front image</span>
                      </>
                    )}
                  </label>
                </div>


                <div className="mt-4">
                  <label className="block text-sm text-gray-600">Scale</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={frontImageScale}
                    onChange={(e) => setFrontImageScale(parseFloat(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <button
                    className="mt-2 px-10 py-1 bg-teal-500 text-white rounded shadow hover:bg-teal-400"
                    onClick={() => setFrontImageRotation((prev) => prev + 90)}
                  >
                    Rotate
                  </button>
                </div>
              </div>

              {/* Back Image Upload */}
              <div className="flex-1">
                <label className="block text-teal-700 font-semibold my-2">
                  Upload Back Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    className="hidden"
                    id="back-upload"
                    ref={backFileInputRef} // Attach a ref to reset the input
                    onChange={(e) => handleFileChange(e, setBackImage)}
                  />
                  <label
                    htmlFor="back-upload"
                    className="border-2 border-dashed border-teal-400 rounded-lg h-52 mx-auto flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-600 relative"
                  >
                    {backImage ? (
                      <>
                        <img
                          src={backImage}
                          alt="Back"
                          className="h-full object-contain rounded-md mx-auto"
                        />
                        {/* Hover overlay with remove button */}
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default button behavior
                              setBackImage(null); // Clear the image
                              if (backFileInputRef.current) {
                                backFileInputRef.current.value = ""; // Reset the file input
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src="/image-upload-icon.png" // Path to the icon in the public folder
                          alt="Upload Icon"
                          className="w-12 h-12 mb-2" // Adjust size of the icon
                        />
                        <span>Click to upload back image</span>
                      </>
                    )}
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-600">Scale</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={backImageScale}
                    onChange={(e) => setBackImageScale(parseFloat(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <button
                    className="mt-2 px-10 py-1 bg-teal-500 text-white rounded shadow hover:bg-teal-400"
                    onClick={() => setBackImageRotation((prev) => prev + 90)}
                  >
                    Rotate
                  </button>
                </div>
              </div>
            </div>
  
          {/* Preview Section */}
          <div
            className={`${
              orientation === "landscape" ? "mt-8 w-full" : "px-4"
            }`}
            ref={containerRef}
          >
            <div className="flex justify-between items-center px-3 mb-4">
              <h2 className="block text-xl font-medium uppercase text-teal-600">
                Preview Merge
              </h2>
              <button
                onClick={() => {
                  setFrontImagePosition(frontImageDefaultPosition);
                  setBackImagePosition(backImageDefaultPosition);
                }}
                className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300 transition duration-200"
              >
                Reset Position
              </button>
            </div>

            <div className="w-full bg-white shadow-lg border-4">
              {stageWidth > 0 && (
               <Stage
                width={stageWidth * 1.1}
                height={stageHeight}
                className="konvajs-content" // Add this class
                ref={(node) => {
                  // Directly assign the Konva stage to the ref if possible
                  stageRef.current = node;
                }}
                >

                    <Layer>
                      {/* Conditionally Render Front Side Label and Border */}
                      {showLabels && (
                        <>
                          <Rect
                            x={
                              orientation === "portrait"
                                ? (stageWidth - stageWidth * 0.75) / 2 // Center horizontally for portrait
                                : stageWidth * 0.08 + (stageWidth * 0.4 - (stageWidth * 0.4)) / 2 // Center in left half for landscape
                            }
                            y={
                              orientation === "portrait"
                                ? (stageHeight * 0.6 - stageHeight * 0.42) / 2 // Center in top half for portrait
                                : (stageHeight - stageHeight * 0.55) / 2 // Vertically centered for landscape
                            }
                            width={orientation === "portrait" ? stageWidth * 0.8 : stageWidth * 0.44} // Set Border Box Width
                            height={orientation === "portrait" ? stageHeight * 0.3 : stageHeight * 0.42} // Set Border Box Height
                            stroke="#d3d3d3"
                            strokeWidth={0.7}
                          />
                          <Text
                            text="FRONT SIDE"
                            x={
                              orientation === "portrait"
                                ? (stageWidth - stageWidth * 0.8) / 2 // Center horizontally for portrait
                                : (stageWidth * 0.08 + stageWidth * 0.5) / 2 - (stageWidth * 0.4) / 2 // Center horizontally within left half for landscape
                            }
                            y={
                              orientation === "portrait"
                                ? (stageHeight * 0.75 - stageHeight * 0.42) / 2 + stageHeight * 0.05 // Adjust to vertically align within the rectangle
                                : stageHeight * 1.2 / 2 - stageHeight * 0.33 / 2 - 10 // Center vertically for landscape
                            }
                            width={orientation === "portrait" ? stageWidth * 0.8 : stageWidth * 0.4} // Adjust width for portrait and landscape
                            align="center"
                            fontSize={20}
                            fill="#d3d3d3"
                          />
                          <Rect
                            x={
                              orientation === "portrait"
                                ? (stageWidth - stageWidth * 0.75) / 2 // Center horizontally for portrait
                                : stageWidth * 0.6 + (stageWidth * 0.4 - (stageWidth * 0.4)) / 2 // Center in right half for landscape
                            }
                            y={
                              orientation === "portrait"
                                ? stageHeight / 2 + (stageHeight * 0.05) // Center in bottom half for portrait
                                : (stageHeight - stageHeight * 0.55) / 2 // Vertically centered for landscape
                            }
                            width={orientation === "portrait" ? stageWidth * 0.8 : stageWidth * 0.44} // Set Border Box Width
                            height={orientation === "portrait" ? stageHeight * 0.3 : stageHeight * 0.42} // Set Border Box Height
                            stroke="#d3d3d3"
                            strokeWidth={0.7}
                          />
                          <Text
                            text="BACK SIDE"
                            x={
                              orientation === "portrait"
                                ? (stageWidth - stageWidth * 0.8) / 2 // Center horizontally for portrait
                                : stageWidth * 0.60 + (stageWidth * 0.4 - (stageWidth * 0.35)) / 2
                            }
                            y={
                              orientation === "portrait"
                                ? stageHeight / 2 + (stageHeight * 0.42) / 2 - 20 // Adjust to center vertically in bottom half for portrait
                                : stageHeight * 1.2 / 2 - stageHeight * 0.33 / 2 - 10 // Center vertically for landscape
                            }
                            width={orientation === "portrait" ? stageWidth * 0.8 : stageWidth * 0.4}
                            align="center"
                            fontSize={20}
                            fill="#d3d3d3"
                          />
                        </>
                      )}

                      {/* Front Image */}
                      {frontImage && (
                        <DraggableImage
                          imageUrl={frontImage}
                          x={frontImagePosition.x}
                          y={frontImagePosition.y}
                          scale={frontImageScale}
                          rotation={frontImageRotation}
                          setPosition={setFrontImagePosition}
                        />
                      )}

                      {/* Back Image */}
                      {backImage && (
                        <DraggableImage
                          imageUrl={backImage}
                          x={backImagePosition.x}
                          y={backImagePosition.y}
                          scale={backImageScale}
                          rotation={backImageRotation}
                          setPosition={setBackImagePosition}
                        />
                      )}
                    </Layer>
                </Stage>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl text-teal-600 my-6">
          Save and Download Image
        </h2>
  
        {/* Format Selection and Download Button */}
        <div className="mt-8 flex items-center justify-between">
          {/* Dropdown with Custom Arrow */}
          <div className="relative inline-block">
            <select
              value={imageFormat}
              onChange={(e) => setImageFormat(e.target.value)}
              className="appearance-none border border-teal-500 text-teal-700 bg-white rounded-lg pl-4 pr-8 py-2 text-center font-semibold shadow-md hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
            >
              <option value="image/jpeg">JPG (Default)</option>
              <option value="image/png">PNG</option>

            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="ml-4 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-200"
          >
            Download Image
          </button>
        </div>

      </div>
    </div>
  );  
};



export default PhotoIDMergeTool;

