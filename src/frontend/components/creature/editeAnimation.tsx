import React, { useState } from "react";

const SvgEditor = () => {
  const mainColor = "#F9F3E0";

  const [selectedObject, setSelectedObject] = useState(null);
  const [objects, setObjects] = useState([
    {
      id: 1,
      type: "path",
      x: 0,
      y: 0,
      w: 347,
      h: 398,
      angle: 0,
      d: "M195.292 0C254.635 0 307.795 26.9715 343.612 69.5399C346.902 76.7754 347.248 83.9238 345.087 90.096C342.965 96.1591 338.102 101.041 332.35 104.722C326.602 108.401 320.003 110.857 314.48 112.084C313.463 112.31 312.118 112.185 310.485 111.73C308.859 111.277 306.986 110.507 304.93 109.484C302.777 108.412 300.437 107.067 297.985 105.53C272.733 76.4389 235.809 58.093 194.674 58.093C118.56 58.0931 56.8575 120.903 56.8575 198.382C56.8576 275.862 118.56 338.671 194.674 338.671C210.851 338.671 226.376 335.831 240.796 330.619C241.706 330.906 242.65 331.282 243.56 331.7C244.971 332.349 246.283 333.09 247.237 333.742C247.715 334.068 248.094 334.366 248.347 334.611C248.474 334.733 248.56 334.835 248.611 334.911C248.67 334.996 248.654 335.008 248.654 334.963C248.654 335.166 248.773 335.307 248.849 335.379C248.933 335.457 249.037 335.521 249.139 335.574C249.345 335.681 249.629 335.784 249.964 335.884C250.64 336.087 251.6 336.297 252.755 336.501C255.068 336.909 258.212 337.298 261.546 337.53C264.878 337.763 268.414 337.841 271.509 337.626C274.583 337.413 277.297 336.909 278.931 335.928C281.179 334.58 283.867 335.474 286.442 337.345C288.994 339.2 291.282 341.91 292.604 343.844L292.645 343.903L292.703 343.945C294.156 344.983 296.61 346.597 299.261 348.078C301.903 349.554 304.779 350.919 307.064 351.427C308.358 351.714 309.256 352.384 309.752 353.291C310.251 354.204 310.372 355.407 310.005 356.799C309.454 358.897 307.803 361.379 304.814 363.782C303.533 364.668 302.242 365.539 300.94 366.395C295.749 369.448 289.167 373.33 283.242 376.555C281.204 377.665 279.245 378.693 277.449 379.584C275.856 380.338 274.251 381.071 272.635 381.782C271.329 382.303 268.757 383.438 268.757 383.438C246.079 392.827 221.278 398 195.292 398C87.4352 398 0 308.905 0 199C0 89.0954 87.4352 0.000131467 195.292 0Z",
      fill: mainColor,
    },
    {
      id: 2,
      type: "circle",
      x: 237.458,
      y: 165.712,
      w: 136.963,
      h: 136.963,
      angle: 0,
      fill: mainColor,
    },
    {
      id: 3,
      type: "circle",
      x: 251.569,
      y: 179.538,
      w: 109.57,
      h: 109.57,
      angle: 0,
      fill: "white",
    },
    {
      id: 4,
      type: "circle",
      x: 269.711,
      y: 197.68,
      w: 73.213,
      h: 73.213,
      angle: 0,
      fill: "#024B6D",
    },
    {
      id: 5,
      type: "circle",
      x: 296.925,
      y: 225.901,
      w: 17.432,
      h: 17.432,
      angle: 0,
      fill: "#FFFFF3",
    },
    {
      id: 6,
      type: "rect",
      x: 303.98,
      y: 131.42,
      w: 4.483,
      h: 31.377,
      angle: 0,
      fill: mainColor,
    },
    {
      id: 7,
      type: "path",
      x: 296.205,
      y: 302.502,
      w: 18.28,
      h: 42.41,
      angle: 0,
      d: "M18.28 0C16.89 3.688 14.626 10.705 15.27 15.865C15.74 19.622 17.291 21.36 18.083 25.048C18.84 28.571 20.163 30.743 19.288 34.231C17.237 42.41 2.051 42.41 0 34.231C0.875 30.743 1.449 28.571 2.206 25.048C2.998 21.36 4.549 19.622 5.018 15.865C5.659 10.741 3.429 3.785 2.037 0.077C4.767 0.445 7.552 0.636 10.383 0.636C13.404 0.636 16.375 0.418 18.28 0Z",
      fill: mainColor,
    },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const updateObject = (id, updates) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id === id) {
          const newObj = { ...obj, ...updates };
          if (obj.type === "circle") {
            if (updates.w !== undefined) newObj.h = updates.w;
            else if (updates.h !== undefined) newObj.w = updates.h;
          }
          return newObj;
        }
        return obj;
      }),
    );
  };

  const duplicateObject = (id) => {
    const obj = objects.find((o) => o.id === id);
    if (obj) {
      const newObj = { ...obj, id: Date.now(), x: obj.x + 20, y: obj.y + 20 };
      setObjects((prev) => [...prev, newObj]);
    }
  };

  const deleteObject = (id) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id));
    if (selectedObject === id) setSelectedObject(null);
  };

  const handleMouseDown = (e, id) => {
    setSelectedObject(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedObject) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    updateObject(selectedObject, {
      x: objects.find((o) => o.id === selectedObject).x + deltaX * 0.5,
      y: objects.find((o) => o.id === selectedObject).y + deltaY * 0.5,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderSvgElement = (obj) => {
    const transform = `translate(${obj.x}, ${obj.y}) rotate(${obj.angle})`;

    switch (obj.type) {
      case "circle":
        return (
          <circle
            key={obj.id}
            cx={obj.w / 2}
            cy={obj.h / 2}
            r={obj.w / 2}
            fill={obj.fill}
            transform={transform}
            onMouseDown={(e) => handleMouseDown(e, obj.id)}
            style={{ cursor: "move" }}
          />
        );
      case "rect":
        return (
          <rect
            key={obj.id}
            width={obj.w}
            height={obj.h}
            fill={obj.fill}
            transform={transform}
            onMouseDown={(e) => handleMouseDown(e, obj.id)}
            style={{ cursor: "move" }}
          />
        );
      case "path":
        return (
          <path
            key={obj.id}
            d={obj.d}
            fill={obj.fill}
            transform={transform}
            onMouseDown={(e) => handleMouseDown(e, obj.id)}
            style={{ cursor: "move" }}
          />
        );
      default:
        return null;
    }
  };

  const selectedObj = objects.find((o) => o.id === selectedObject);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <svg
          width="400"
          height="500"
          viewBox="0 0 434 398"
          className="border bg-white"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {objects.map(renderSvgElement)}
        </svg>
      </div>

      <div className="w-80 bg-white p-4 border-l overflow-y-auto">
        <h3 className="font-bold mb-4">Objects</h3>

        {objects.map((obj) => (
          <div
            key={obj.id}
            className={`p-3 mb-2 border rounded cursor-pointer ${
              selectedObject === obj.id
                ? "bg-blue-100 border-blue-500"
                : "bg-gray-50"
            }`}
            onClick={() => setSelectedObject(obj.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {obj.type} #{obj.id}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateObject(obj.id);
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                >
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteObject(obj.id);
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              X: {obj.x.toFixed(1)} Y: {obj.y.toFixed(1)} W: {obj.w.toFixed(1)}{" "}
              H: {obj.h.toFixed(1)} A: {obj.angle}°
            </div>
          </div>
        ))}

        {selectedObj && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-bold mb-3">
              Edit {selectedObj.type} #{selectedObj.id}
            </h4>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1">X</label>
                <input
                  type="number"
                  value={selectedObj.x.toFixed(1)}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      x: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Y</label>
                <input
                  type="number"
                  value={selectedObj.y.toFixed(1)}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      y: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">W</label>
                <input
                  type="number"
                  value={selectedObj.w.toFixed(1)}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      w: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">H</label>
                <input
                  type="number"
                  value={selectedObj.h.toFixed(1)}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      h: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
            </div>

            {selectedObj.type !== "circle" && (
              <div className="mb-2">
                <label className="block text-xs font-medium mb-1">Angle</label>
                <input
                  type="number"
                  value={selectedObj.angle}
                  onChange={(e) =>
                    updateObject(selectedObj.id, {
                      angle: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-1 border rounded text-xs"
                />
              </div>
            )}

            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">Fill</label>
              <input
                type="color"
                value={selectedObj.fill}
                onChange={(e) =>
                  updateObject(selectedObj.id, { fill: e.target.value })
                }
                className="w-full p-1 border rounded"
              />
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-bold mb-2">Export Data</h4>
          <textarea
            value={JSON.stringify(objects, null, 2)}
            readOnly
            className="w-full h-32 p-2 text-xs border rounded font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export default SvgEditor;
