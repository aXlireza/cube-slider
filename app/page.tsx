"use client";

import { useRef, useState } from "react";
import Cube, { CubeHandle } from "@/components/Cube";

export default function CubePage() {
  const cubeRef = useRef<CubeHandle>(null);
  const [zoomOut, setZoomOut] = useState(7);
  const [zoomIn, setZoomIn] = useState(5);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Cube
        ref={cubeRef}
        zoomActive={zoomOut}
        zoomIdle={zoomIn}
        speed={speed}
        faces={{
          front: { color: "#ff8a80", content: <div>Front</div> },
          back: { color: "#80d8ff", content: <div>Back</div> },
          right: { color: "#ccff90", content: <div>Right</div> },
          left: { color: "#ffd180", content: <div>Left</div> },
          top: { color: "#b388ff", content: <div>Top</div> },
          bottom: { color: "#ffff8d", content: <div>Bottom</div> },
        }}
      />
      <div className="flex flex-wrap justify-center gap-2">
        {(["front", "right", "back", "left", "top", "bottom"] as const).map((f) => (
          <button
            key={f}
            className="px-2 py-1 bg-gray-800 text-white rounded"
            onClick={() => cubeRef.current?.rotateToFace(f)}
          >
            {`Face ${f}`}
          </button>
        ))}
        <button
          className="px-2 py-1 bg-red-600 text-white rounded"
          onClick={() => cubeRef.current?.undo()}
        >
          Undo
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="px-2 py-1 bg-blue-600 text-white rounded"
          onClick={() => cubeRef.current?.unfold("right")}
        >
          Unfold Right
        </button>
        <button
          className="px-2 py-1 bg-blue-600 text-white rounded"
          onClick={() => cubeRef.current?.fold("right")}
        >
          Fold Right
        </button>
        <button
          className="px-2 py-1 bg-green-600 text-white rounded"
          onClick={() => cubeRef.current?.unfold("bottom")}
        >
          Unfold Bottom
        </button>
        <button
          className="px-2 py-1 bg-green-600 text-white rounded"
          onClick={() => cubeRef.current?.fold("bottom")}
        >
          Fold Bottom
        </button>
        <button
          className="px-2 py-1 bg-purple-600 text-white rounded"
          onClick={() =>
            cubeRef.current?.setFaceContent("right", {
              content: <div>Loaded at {new Date().toLocaleTimeString()}</div>,
            })
          }
        >
          Load Right Content
        </button>
      </div>
      <div className="flex flex-col gap-2 w-64">
        <label className="flex items-center gap-2">
          <span className="w-32">Zoom Out</span>
          <input
            type="range"
            min={4}
            max={10}
            step={0.1}
            value={zoomOut}
            onChange={(e) => setZoomOut(parseFloat(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-32">Zoom In</span>
          <input
            type="range"
            min={3}
            max={8}
            step={0.1}
            value={zoomIn}
            onChange={(e) => setZoomIn(parseFloat(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-32">Speed</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

