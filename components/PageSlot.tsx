'use client';

import { ReactNode, useEffect } from 'react';
import { useCube } from './CubeProvider';

export default function PageSlot({ children }: { children: ReactNode }) {
  const { cubeRef } = useCube();

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.setFaceContent('front', { content: children });
    void cube.rotateToFace('front');
  }, [cubeRef, children]);

  return <div style={{ display: 'none' }}>{children}</div>;
}
