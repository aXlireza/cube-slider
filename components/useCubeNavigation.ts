"use client";

import type { ReactNode } from "react";
import { useCube } from "./CubeProvider";
import type { FaceName } from "./Cube";

const faces: FaceName[] = ["front", "right", "back", "left", "top", "bottom"];

function randomFace(exclude: FaceName): FaceName {
  const options = faces.filter((f) => f !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Rotates the cube to random faces until `loader` resolves. Once content is
 * ready, it is placed on a new random face and the cube settles there.
 */
export function useCubeNavigation() {
  const { cubeRef } = useCube();

  return async function navigate(loader: () => Promise<ReactNode>) {
    const cube = cubeRef.current;
    if (!cube) return;

    let current = cube.getCurrentFace();
    let loaded = false;
    let content: ReactNode = null;
    loader().then((c) => {
      content = c;
      loaded = true;
    });

    while (!loaded) {
      const next = randomFace(current);
      current = next;
      await cube.rotateToFace(next);
    }

    const finalFace = randomFace(current);
    cube.setFaceContent(finalFace, { content });
    await cube.rotateToFace(finalFace);
  };
}
