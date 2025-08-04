"use client";

import type { ReactNode } from "react";
import { useOptionalCube } from "./CubeProvider";
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
  const cube = useOptionalCube();

  return async function navigate(loader: () => Promise<ReactNode | void>) {
    const ref = cube?.cubeRef.current;
    if (!ref) {
      await loader();
      return;
    }

    let current = ref.getCurrentFace();
    let loaded = false;
    let content: ReactNode | undefined;
    loader().then((c) => {
      if (c !== undefined) {
        content = c;
      }
      loaded = true;
    });

    while (!loaded) {
      const next = randomFace(current);
      current = next;
      await ref.rotateToFace(next, false);
    }

    if (content !== undefined) {
      const finalFace = randomFace(current);
      ref.setFaceContent(finalFace, { content });
      await ref.rotateToFace(finalFace);
    }
  };
}
