"use client";
import SmoothCube, { defaultFaces } from '@/components/SmoothCube';

const faces = defaultFaces.map((face, idx) => ({
  ...face,
  content: (
    <div className="p-4">Face {idx + 1}</div>
  ),
}));

export default function CubePage() {
  return <SmoothCube faces={faces} />;
}