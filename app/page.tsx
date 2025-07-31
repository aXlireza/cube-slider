"use client";

import { useRef } from "react";
import Cube, { CubeHandle } from "@/components/Cube";

export default function CubePage() {
  const cubeRef = useRef<CubeHandle>(null);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Cube
        ref={cubeRef}
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
      </div>
    </div>
  );
}

