"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import Cube, { CubeHandle } from "./Cube";

interface CubeContextValue {
  cubeRef: React.RefObject<CubeHandle>;
  zoomOut: number;
  setZoomOut: (v: number) => void;
  zoomIn: number;
  setZoomIn: (v: number) => void;
  speed: number;
  setSpeed: (v: number) => void;
  position: [number, number];
  setPosition: (p: [number, number]) => void;
  scale: number;
  setScale: (v: number) => void;
}

const CubeContext = createContext<CubeContextValue | undefined>(undefined);

export function CubeProvider({ children }: { children: React.ReactNode }) {
  const cubeRef = useRef<CubeHandle>(null);
  const [zoomOut, setZoomOut] = useState(7);
  const [zoomIn, setZoomIn] = useState(5);
  const [speed, setSpeed] = useState(1);
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [scale, setScale] = useState(1);

  const value = useMemo(
    () => ({
      cubeRef,
      zoomOut,
      setZoomOut,
      zoomIn,
      setZoomIn,
      speed,
      setSpeed,
      position,
      setPosition,
      scale,
      setScale,
    }),
    [zoomOut, zoomIn, speed, position, scale],
  );

  return (
    <CubeContext.Provider value={value}>{children}</CubeContext.Provider>
  );
}

export function CubeCanvas() {
  const { cubeRef, zoomOut, zoomIn, speed, position, scale } = useCube();
  return (
    <Cube
      ref={cubeRef}
      zoomActive={zoomOut}
      zoomIdle={zoomIn}
      speed={speed}
      position={position}
      scale={scale}
      faces={{
        front: { color: "#ff8a80", content: <div>Front</div> },
        back: { color: "#80d8ff", content: <div>Back</div> },
        right: { color: "#ccff90", content: <div>Right</div> },
        left: { color: "#ffd180", content: <div>Left</div> },
        top: { color: "#b388ff", content: <div>Top</div> },
        bottom: { color: "#ffff8d", content: <div>Bottom</div> },
      }}
    />
  );
}

export function useCube() {
  const ctx = useContext(CubeContext);
  if (!ctx) throw new Error("useCube must be used within CubeProvider");
  return ctx;
}

