import React, { useState } from "react";

const ImageDisplay = ({ imageUrl }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);

  const handleClick = () => {
    setIsZoomed(!isZoomed);
    setScale(1);
  };

  const handleWheel = (e) => {
    if (isZoomed) {
      e.preventDefault();
      const newScale = scale - e.deltaY * 0.001;
      setScale(Math.min(Math.max(0.1, newScale), 3));
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isZoomed ? "zoom-out" : "zoom-in",
        overflow: "hidden",
      }}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <img
        src={imageUrl}
        alt="Resizable Image"
        style={{
          maxWidth: isZoomed ? "none" : "100%",
          maxHeight: isZoomed ? "none" : "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
          transition: "transform 0.2s ease-out",
        }}
      />
    </div>
  );
};

const ResizableBox = ({ imageUrl, title }) => {
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setDimensions({
        width: e.clientX - e.target.offsetLeft,
        height: e.clientY - e.target.offsetTop,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "2px solid #333",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <div style={{ marginBottom: "5px", fontSize: "12px" }}>{title}</div>
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          border: "2px solid #ccc",
          margin: "10px",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          style={{
            border: "2px solid #666",
            width: "100%",
            height: "100%",
          }}
        >
          <ImageDisplay imageUrl={imageUrl} />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "20px",
            height: "20px",
            cursor: "se-resize",
          }}
        />
      </div>
    </div>
  );
};

const loadImages = () => {
  const imageContext = require.context(
    "../public/images",
    false,
    /\.(png|jpe?g|svg)$/
  );
  const images = {};

  imageContext.keys().forEach((key) => {
    // Remove the './' from the beginning and file extension from the end
    const imageName = key.replace(/^\.\//, "").replace(/\.[^/.]+$/, "");
    // Create the full path
    const imagePath = `/images${key.replace(".", "")}`;
    images[imageName] = imagePath;
  });

  return images;
};

const Panel = () => {
  const images = loadImages();
  const imageUrls = Object.values(images);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ResizableBox imageUrl={imageUrls[0]} title={Object.keys(images)[0]} />
        <ResizableBox imageUrl={imageUrls[1]} title={Object.keys(images)[1]} />
        <ResizableBox imageUrl={imageUrls[2]} title={Object.keys(images)[2]} />
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ResizableBox imageUrl={imageUrls[3]} title={Object.keys(images)[3]} />
        <ResizableBox imageUrl={imageUrls[4]} title={Object.keys(images)[4]} />
        <ResizableBox imageUrl={imageUrls[5]} title={Object.keys(images)[5]} />
      </div>
    </div>
  );
};

export default Panel;
