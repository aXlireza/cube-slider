"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import Cube, { CubeHandle, FaceName } from "./Cube";
import CubeControls from "./CubeControls";

export default function CubeScene() {
  const cubeRef = useRef<CubeHandle>(null);

  const handleRotate = (face: FaceName) => cubeRef.current?.rotateTo(face);
  const handleRight = () => cubeRef.current?.toggleRight();
  const handleBottom = () => cubeRef.current?.toggleBottom();
  const handleReset = () => cubeRef.current?.reset();

  return (
    <div className="relative w-screen h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Cube ref={cubeRef} />
        </Suspense>
      </Canvas>
      <CubeControls
        onRotate={handleRotate}
        onUnfoldRight={handleRight}
        onUnfoldBottom={handleBottom}
        onReset={handleReset}
      />
    </div>
  );
}
