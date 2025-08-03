'use client';

import { ReactNode, useEffect } from 'react';
import { useCube } from './CubeProvider';
import type { FaceName } from './Cube';

interface CubePageProps {
  children: ReactNode;
  face?: FaceName;
}

/**
 * Renders `children` on the given cube face while keeping the cube mounted.
 * The component itself renders nothing, allowing pages to optionally render
 * additional content outside the cube.
 */
export default function CubePage({ children, face = 'front' }: CubePageProps) {
  const { cubeRef } = useCube();

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.setFaceContent(face, { content: children });
    void cube.rotateToFace(face);
  }, [cubeRef, children, face]);

  return null;
}
