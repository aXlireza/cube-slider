"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";

export type FaceName =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom";

export type CubeHandle = {
  rotateTo: (face: FaceName) => void;
  toggleRight: () => void;
  toggleBottom: () => void;
  reset: () => void;
};

const faceRotations: Record<FaceName, [number, number, number]> = {
  front: [0, 0, 0],
  back: [0, Math.PI, 0],
  left: [0, Math.PI / 2, 0],
  right: [0, -Math.PI / 2, 0],
  top: [-Math.PI / 2, 0, 0],
  bottom: [Math.PI / 2, 0, 0],
};

// Basic placeholder colors for faces
const colors: Record<FaceName, string> = {
  front: "#ff6b6b",
  back: "#4ecdc4",
  left: "#ffe66d",
  right: "#1a535c",
  top: "#f7fff7",
  bottom: "#5c3c92",
};

const Cube = forwardRef<CubeHandle>(function Cube(_, ref) {
  const cubeRef = useRef<THREE.Group>(null!);

  // panels that can unfold to the right relative to the viewer
  const rightRef = useRef<THREE.Group>(null!); // original right
  const leftRef = useRef<THREE.Group>(null!); // original left
  const frontRightRef = useRef<THREE.Group>(null!); // front when on the right
  const backRightRef = useRef<THREE.Group>(null!); // back when on the right

  // panels that can unfold downward relative to the viewer
  const bottomRef = useRef<THREE.Group>(null!); // original bottom
  const frontBottomRef = useRef<THREE.Group>(null!); // front when at bottom
  const backBottomRef = useRef<THREE.Group>(null!); // back when at bottom

  const state = useRef({
    face: "front" as FaceName,
    open: {
      right: false,
      left: false,
      front: false,
      back: false,
      bottom: false,
    },
  });
  const { size } = useThree();

  // scale cube relative to viewport (leave surrounding space)
  const scale = Math.min(size.width, size.height) / 6;

  // groups for right-side unfolding
  const rightGroups = {
    right: rightRef,
    left: leftRef,
    front: frontRightRef,
    back: backRightRef,
  } as const;

  // groups for bottom unfolding
  const bottomGroups = {
    bottom: bottomRef,
    front: frontBottomRef,
    back: backBottomRef,
  } as const;

  useImperativeHandle(ref, () => ({
    rotateTo: (face) => {
      state.current.face = face;
      const [x, y, z] = faceRotations[face];
      gsap.to(cubeRef.current.rotation, {
        x,
        y,
        z,
        duration: 1,
        ease: "power2.inOut",
      });
    },
    toggleRight: () => {
      const neighbor: Record<FaceName, keyof typeof rightGroups> = {
        front: "right",
        back: "left",
        left: "front",
        right: "back",
        top: "right",
        bottom: "right",
      };
      const key = neighbor[state.current.face];
      const grp = rightGroups[key];
      const angle: Record<keyof typeof rightGroups, number> = {
        right: -Math.PI / 2,
        left: Math.PI / 2,
        front: -Math.PI / 2,
        back: Math.PI / 2,
      };
      const open = !state.current.open[key];
      state.current.open[key] = open;
      gsap.to(grp.current.rotation, {
        y: open ? angle[key] : 0,
        duration: 1,
        ease: "power2.inOut",
      });
    },
    toggleBottom: () => {
      const neighbor: Record<FaceName, keyof typeof bottomGroups> = {
        front: "bottom",
        back: "bottom",
        left: "bottom",
        right: "bottom",
        top: "back",
        bottom: "front",
      };
      const key = neighbor[state.current.face];
      const grp = bottomGroups[key];
      const angle: Record<keyof typeof bottomGroups, number> = {
        bottom: Math.PI / 2,
        front: Math.PI / 2,
        back: -Math.PI / 2,
      };
      const open = !state.current.open[key];
      state.current.open[key] = open;
      gsap.to(grp.current.rotation, {
        x: open ? angle[key] : 0,
        duration: 1,
        ease: "power2.inOut",
      });
    },
    reset: () => {
      state.current.open = {
        right: false,
        left: false,
        front: false,
        back: false,
        bottom: false,
      };
      gsap.to(cubeRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "power2.inOut",
      });
      Object.values(rightGroups).forEach((g) =>
        gsap.to(g.current.rotation, { y: 0, duration: 1, ease: "power2.inOut" })
      );
      Object.values(bottomGroups).forEach((g) =>
        gsap.to(g.current.rotation, { x: 0, duration: 1, ease: "power2.inOut" })
      );
    },
  }));

  const face = (name: FaceName, props: JSX.IntrinsicElements["mesh"], content: string) => (
    <mesh {...props}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={colors[name]} side={THREE.DoubleSide} />
      <Html center>
        <div className="text-xs font-bold text-black">{content}</div>
      </Html>
    </mesh>
  );

  return (
    <group ref={cubeRef} scale={scale}>
      {/* front face (supports right and bottom unfolding) */}
      <group ref={frontRightRef} position={[-0.5, 0, 0.5]}>
        <group ref={frontBottomRef} position={[0, -0.5, 0]}>
          {face(
            "front",
            { position: [0.5, 0.5, 0] },
            "Front"
          )}
        </group>
      </group>

      {/* back face */}
      <group ref={backRightRef} position={[-0.5, 0, -0.5]}>
        <group ref={backBottomRef} position={[0, -0.5, 0]}>
          {face(
            "back",
            { position: [0.5, 0.5, 0], rotation: [0, Math.PI, 0] },
            "Back"
          )}
        </group>
      </group>

      {/* left and right faces */}
      <group ref={leftRef} position={[-0.5, 0, 0]}>
        {face("left", { position: [0, 0, 0], rotation: [0, Math.PI / 2, 0] }, "Left")}
      </group>
      <group ref={rightRef} position={[0.5, 0, 0]}>
        {face(
          "right",
          { position: [0, 0, 0], rotation: [0, -Math.PI / 2, 0] },
          "Right"
        )}
      </group>

      {/* top face */}
      {face("top", { position: [0, 0.5, 0], rotation: [-Math.PI / 2, 0, 0] }, "Top")}

      {/* bottom face */}
      <group ref={bottomRef} position={[0, -0.5, 0]}>
        {face(
          "bottom",
          { position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0] },
          "Bottom"
        )}
      </group>
    </group>
  );
});

export default Cube;
