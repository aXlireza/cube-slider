import React, { forwardRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface CubeFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  content: React.ReactNode;
  size?: number;
}

const CubeFace = forwardRef<THREE.Mesh, CubeFaceProps>(
  ({ position, rotation, content, size = 1 }, ref) => {
    return (
      <mesh position={position} rotation={rotation} ref={ref}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        <Html transform>{content}</Html>
      </mesh>
    );
  }
);

CubeFace.displayName = 'CubeFace';
export default CubeFace;
