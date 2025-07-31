"use client";

import React from "react";
import type { FaceName } from "./Cube";

type Props = {
  onRotate: (face: FaceName) => void;
  onUnfoldRight: () => void;
  onUnfoldBottom: () => void;
  onReset: () => void;
};

const faces: FaceName[] = [
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom",
];

export default function CubeControls({
  onRotate,
  onUnfoldRight,
  onUnfoldBottom,
  onReset,
}: Props) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {faces.map((name) => (
          <button
            key={name}
            onClick={() => onRotate(name)}
            className="px-2 py-1 text-xs rounded bg-white/80 capitalize"
          >
            {name}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        <button
          onClick={onUnfoldRight}
          className="px-2 py-1 text-xs rounded bg-white/80"
        >
          Unfold Right
        </button>
        <button
          onClick={onUnfoldBottom}
          className="px-2 py-1 text-xs rounded bg-white/80"
        >
          Unfold Bottom
        </button>
        <button
          onClick={onReset}
          className="px-2 py-1 text-xs rounded bg-white/80"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
