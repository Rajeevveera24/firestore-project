import React, { useState } from "react";

import ItemDetails from "./itemDisplay";

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
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${scale})`,
          transition: "transform 0.2s ease-out",
        }}
      />
    </div>
  );
};

const ResizableBox = ({ imageUrl, title, app, user }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #333",
        padding: "3px",
        borderRadius: "3px",
        flex: 1,
        height: "100%",
      }}
    >
      <div
        style={{
          width: "250px",
          height: "300px",
          border: "1px solid #ccc",
          margin: "1px",
          position: "relative",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            margin: "5px 0",
            fontWeight: "bold",
            fontSize: "1.1em",
          }}
        >
          {title.charAt(0).toUpperCase() + title.slice(1)}
        </p>
        <div
          style={{
            width: "40%",
            height: "40%",
            minWidth: "100px",
            minHeight: "100px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ImageDisplay imageUrl={imageUrl} />
        </div>
        <div
          style={{
            flex: 1,
            padding: "10px",
            textAlign: "left",
          }}
        >
          <ItemDetails title={title} app={app} user={user} />
          {/* {title === "bedframes" ? (
            <ItemDetails title={title} app={app} />
          ) : (
            <>
              <p style={{ fontWeight: "bold", textAlign: "center" }}>{title}</p>
              <p>Current Bid: $0</p>
              <p>Time Left: 2h 30m</p>
              <p>Description: Sample item description goes here...</p>
            </>
          )} */}
        </div>
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
    const imageName = key.replace(/^\.\//, "").replace(/\.[^/.]+$/, "");
    const imagePath = `/images${key.replace(".", "")}`;
    images[imageName] = imagePath;
  });

  return images;
};

const Panel = ({ app, user }) => {
  const images = loadImages();
  const imageUrls = Object.values(images);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
        height: "100%",
        gap: "5px",
        padding: "5px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          gap: "5px",
          flex: 1,
          minHeight: "90%",
        }}
      >
        <ResizableBox
          imageUrl={imageUrls[0]}
          title={Object.keys(images)[0]}
          app={app}
          user={user}
        />
        <ResizableBox
          imageUrl={imageUrls[1]}
          title={Object.keys(images)[1]}
          app={app}
          user={user}
        />
        <ResizableBox
          imageUrl={imageUrls[2]}
          title={Object.keys(images)[2]}
          app={app}
          user={user}
        />
        <ResizableBox
          imageUrl={imageUrls[3]}
          title={Object.keys(images)[3]}
          app={app}
          user={user}
        />
      </div>
    </div>
  );
};

export default Panel;
