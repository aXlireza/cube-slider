'use client';

import { ReactNode, useEffect } from 'react';
import { useOptionalCube } from './CubeProvider';
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
  const cube = useOptionalCube();

  useEffect(() => {
    const ref = cube?.cubeRef.current;
    if (!ref) return;
    ref.setFaceContent(face, { content: children });
    void ref.rotateToFace(face);
  }, [cube, children, face]);

  return null;
}
