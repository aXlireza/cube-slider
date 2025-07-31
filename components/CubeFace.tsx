'use client';

import { forwardRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface CubeFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  content: string;
}

const CubeFace = forwardRef<THREE.Mesh, CubeFaceProps>(
  ({ position, rotation, content }, ref) => {
    return (
      <mesh position={position} rotation={rotation} ref={ref}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        <Html center>{content}</Html>
      </mesh>
    );
  }
);

CubeFace.displayName = 'CubeFace';

export default CubeFace;
