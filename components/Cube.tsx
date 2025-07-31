"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
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
  const rightRef = useRef<THREE.Group>(null!);
  const bottomRef = useRef<THREE.Group>(null!);
  const state = useRef({ rightOpen: false, bottomOpen: false });
  const { size } = useThree();

  // scale cube relative to viewport
  const scale = Math.min(size.width, size.height) / 4;

  useImperativeHandle(ref, () => ({
    rotateTo: (face) => {
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
      const open = !state.current.rightOpen;
      state.current.rightOpen = open;
      gsap.to(rightRef.current.rotation, {
        y: open ? -Math.PI / 2 : 0,
        duration: 1,
        ease: "power2.inOut",
      });
    },
    toggleBottom: () => {
      const open = !state.current.bottomOpen;
      state.current.bottomOpen = open;
      gsap.to(bottomRef.current.rotation, {
        x: open ? Math.PI / 2 : 0,
        duration: 1,
        ease: "power2.inOut",
      });
    },
    reset: () => {
      state.current.rightOpen = false;
      state.current.bottomOpen = false;
      gsap.to(cubeRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "power2.inOut",
      });
      gsap.to(rightRef.current.rotation, {
        y: 0,
        duration: 1,
        ease: "power2.inOut",
      });
      gsap.to(bottomRef.current.rotation, {
        x: 0,
        duration: 1,
        ease: "power2.inOut",
      });
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
      {face("front", { position: [0, 0, 0.5] }, "Front")}
      {face("back", { position: [0, 0, -0.5], rotation: [0, Math.PI, 0] }, "Back")}
      {face("left", { position: [-0.5, 0, 0], rotation: [0, Math.PI / 2, 0] }, "Left")}
      <group ref={rightRef} position={[0.5, 0, 0]}>
        {face(
          "right",
          { position: [0.5, 0, 0], rotation: [0, -Math.PI / 2, 0] },
          "Right"
        )}
      </group>
      {face("top", { position: [0, 0.5, 0], rotation: [-Math.PI / 2, 0, 0] }, "Top")}
      <group ref={bottomRef} position={[0, -0.5, 0]}>
        {face(
          "bottom",
          { position: [0, -0.5, 0], rotation: [Math.PI / 2, 0, 0] },
          "Bottom"
        )}
      </group>
    </group>
  );
});

export default Cube;
