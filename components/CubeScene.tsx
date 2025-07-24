'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

export default function CubeExperiment() {
  const groupRef = useRef(null);
  const cameraRef = useRef(null);
  const facesRef = useRef([]);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0); // Tracks current face (0-5)
  const unfoldProgress = useRef(new Array(6).fill(0)); // Unfolding state per face

  // Face definitions: position, rotation, and content identifier
  const faceData = [
    { position: [0, 0, 1], rotation: [0, 0, 0], label: 'Front' }, // 0
    { position: [1, 0, 0], rotation: [0, Math.PI / 2, 0], label: 'Right' }, // 1
    { position: [0, 0, -1], rotation: [0, Math.PI, 0], label: 'Back' }, // 2
    { position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0], label: 'Left' }, // 3
    { position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0], label: 'Top' }, // 4
    { position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0], label: 'Bottom' }, // 5
  ];

  // Target rotations to bring each face to the front
  const targetRotations = {
    0: [0, 0, 0], // Front
    1: [0, -Math.PI / 2, 0], // Right
    2: [0, Math.PI, 0], // Back
    3: [0, Math.PI / 2, 0], // Left
    4: [Math.PI / 2, 0, 0], // Top
    5: [-Math.PI / 2, 0, 0], // Bottom
  };

  // Adjacency mapping for bottom (south) and right (east) faces
  const adjacencies = {
    0: { south: 5, east: 1 }, // Front: Bottom, Right
    1: { south: 5, east: 2 }, // Right: Bottom, Back
    2: { south: 5, east: 3 }, // Back: Bottom, Left
    3: { south: 5, east: 0 }, // Left: Bottom, Front
    4: { south: 0, east: 1 }, // Top: Front, Right
    5: { south: 2, east: 1 }, // Bottom: Back, Right
  };

  // Unfolding configurations: pivot point and rotation axis for each base-adjacent pair
  const unfoldConfigs = {
    '0-5': { pivot: [0, -1, 1], axis: [1, 0, 0] }, // Front to Bottom
    '0-1': { pivot: [1, 0, 1], axis: [0, 1, 0] }, // Front to Right
    '1-5': { pivot: [1, -1, 0], axis: [0, 0, 1] }, // Right to Bottom
    '1-2': { pivot: [1, 0, -1], axis: [0, 1, 0] }, // Right to Back
    '2-5': { pivot: [0, -1, -1], axis: [1, 0, 0] }, // Back to Bottom
    '2-3': { pivot: [-1, 0, -1], axis: [0, 1, 0] }, // Back to Left
    '3-5': { pivot: [-1, -1, 0], axis: [0, 0, 1] }, // Left to Bottom
    '3-0': { pivot: [-1, 0, 1], axis: [0, 1, 0] }, // Left to Front
    '4-0': { pivot: [0, 1, 1], axis: [1, 0, 0] }, // Top to Front
    '4-1': { pivot: [1, 1, 0], axis: [0, 0, 1] }, // Top to Right
    '5-2': { pivot: [0, -1, -1], axis: [1, 0, 0] }, // Bottom to Back
    '5-1': { pivot: [1, -1, 0], axis: [0, 0, 1] }, // Bottom to Right
  };

  // Store original face transforms
  useEffect(() => {
    facesRef.current.forEach((face) => {
      if (face) {
        face.originalPosition = face.position.clone();
        face.originalRotation = face.rotation.clone();
        face.originalMatrix = face.matrix.clone();
      }
    });
  }, []);

  // Creative navigation: zoom out, rotate, zoom in
  const navigate = (direction) => {
    const totalFaces = 6;
    const newIndex = (currentFaceIndex + direction + totalFaces) % totalFaces;
    setCurrentFaceIndex(newIndex);

    const group = groupRef.current;
    const camera = cameraRef.current;
    const startPosition = camera.position.clone();
    const zoomOutPosition = startPosition.clone().multiplyScalar(1.5); // Zoom out by 50%
    const startQuaternion = group.quaternion.clone();
    const targetRotation = targetRotations[newIndex];
    const endQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotation));

    // Zoom out
    new TWEEN.Tween(camera.position)
      .to(zoomOutPosition, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onComplete(() => {
        // Rotate cube
        new TWEEN.Tween({ t: 0 })
          .to({ t: 1 }, 1000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(({ t }) => {
            group.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
          })
          .start()
          .onComplete(() => {
            // Zoom in
            new TWEEN.Tween(camera.position)
              .to(startPosition, 500)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start();
          });
      });
  };

  // Toggle unfolding of bottom or right face
  const toggleUnfold = (direction) => {
    const adjacentIndex = adjacencies[currentFaceIndex][direction];
    if (adjacentIndex === undefined) return;

    const currentProgress = unfoldProgress.current[adjacentIndex];
    const targetProgress = currentProgress > 0 ? 0 : 1;

    new TWEEN.Tween({ progress: currentProgress })
      .to({ progress: targetProgress }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ progress }) => {
        unfoldProgress.current[adjacentIndex] = progress;
      })
      .start();
  };

  // Apply unfolding transformations
  useFrame(() => {
    TWEEN.update();
    facesRef.current.forEach((face, index) => {
      if (!face) return;
      const progress = unfoldProgress.current[index];
      const config = unfoldConfigs[`${currentFaceIndex}-${index}`];
      if (progress > 0 && config) {
        const { pivot, axis } = config;
        const angle = (Math.PI / 2) * progress;
        const R = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(...axis), angle);
        const T = new THREE.Matrix4().makeTranslation(...pivot);
        const Tinv = new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]);
        const unfoldingMatrix = T.multiply(R).multiply(Tinv);
        face.matrix.copy(face.originalMatrix).premultiply(unfoldingMatrix);
        face.matrix.decompose(face.position, face.quaternion, face.scale);
      } else {
        face.position.copy(face.originalPosition);
        face.quaternion.copy(face.originalRotation);
      }
    });
  });

  return (
    <div className="relative w-screen h-screen bg-gray-100">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} onCreated={({ camera }) => (cameraRef.current = camera)}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <group ref={groupRef}>
          {faceData.map((data, index) => (
            <CubeFace
              key={index}
              position={data.position}
              rotation={data.rotation}
              content={data.label}
              ref={(el) => (facesRef.current[index] = el)}
            />
          ))}
        </group>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <ControlPanel onNavigate={navigate} onUnfold={toggleUnfold} />
    </div>
  );
}