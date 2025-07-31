'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CubeFace from './CubeFace';
import ControlPanel from './ControlPanel';

interface FaceMesh extends THREE.Mesh {
  originalPosition?: THREE.Vector3;
  originalRotation?: THREE.Quaternion;
  originalMatrix?: THREE.Matrix4;
}

function FrameUpdater({
  currentFaceIndex,
  unfoldProgress,
  facesRef,
  unfoldConfigs,
}: {
  currentFaceIndex: number;
  unfoldProgress: React.MutableRefObject<number[]>;
  facesRef: React.MutableRefObject<FaceMesh[]>;
  unfoldConfigs: Record<string, { pivot: [number, number, number]; axis: [number, number, number] }>;
}) {
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
        const matrix = T.multiply(R).multiply(Tinv);
        face.matrix.copy(face.originalMatrix!).premultiply(matrix);
        face.matrix.decompose(face.position, face.quaternion, face.scale);
      } else {
        face.position.copy(face.originalPosition!);
        face.quaternion.copy(face.originalRotation!);
      }
    });
  });
  return null;
}

export default function CubeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const facesRef = useRef<FaceMesh[]>([]);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const unfoldProgress = useRef<number[]>(new Array(6).fill(0));

  const faceData: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
    label: string;
  }> = [
    { position: [0, 0, 1], rotation: [0, 0, 0], label: 'Front' },
    { position: [1, 0, 0], rotation: [0, Math.PI / 2, 0], label: 'Right' },
    { position: [0, 0, -1], rotation: [0, Math.PI, 0], label: 'Back' },
    { position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0], label: 'Left' },
    { position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0], label: 'Top' },
    { position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0], label: 'Bottom' },
  ];

  const targetRotations: Record<number, [number, number, number]> = {
    0: [0, 0, 0],
    1: [0, -Math.PI / 2, 0],
    2: [0, Math.PI, 0],
    3: [0, Math.PI / 2, 0],
    4: [Math.PI / 2, 0, 0],
    5: [-Math.PI / 2, 0, 0],
  };

  const adjacencies: Record<number, { south: number; east: number }> = {
    0: { south: 5, east: 1 },
    1: { south: 5, east: 2 },
    2: { south: 5, east: 3 },
    3: { south: 5, east: 0 },
    4: { south: 0, east: 1 },
    5: { south: 2, east: 1 },
  };

  const unfoldConfigs: Record<string, { pivot: [number, number, number]; axis: [number, number, number] }> = {
    '0-5': { pivot: [0, -1, 1], axis: [1, 0, 0] },
    '0-1': { pivot: [1, 0, 1], axis: [0, 1, 0] },
    '1-5': { pivot: [1, -1, 0], axis: [0, 0, 1] },
    '1-2': { pivot: [1, 0, -1], axis: [0, 1, 0] },
    '2-5': { pivot: [0, -1, -1], axis: [1, 0, 0] },
    '2-3': { pivot: [-1, 0, -1], axis: [0, 1, 0] },
    '3-5': { pivot: [-1, -1, 0], axis: [0, 0, 1] },
    '3-0': { pivot: [-1, 0, 1], axis: [0, 1, 0] },
    '4-0': { pivot: [0, 1, 1], axis: [1, 0, 0] },
    '4-1': { pivot: [1, 1, 0], axis: [0, 0, 1] },
    '5-2': { pivot: [0, -1, -1], axis: [1, 0, 0] },
    '5-1': { pivot: [1, -1, 0], axis: [0, 0, 1] },
  };

  // Responsive scaling
  useEffect(() => {
    const updateScale = () => {
      if (groupRef.current) {
        const scale = Math.min(window.innerWidth, window.innerHeight) / 600;
        groupRef.current.scale.set(scale, scale, scale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Store original transforms
  useEffect(() => {
    facesRef.current.forEach((face) => {
      if (face) {
        face.updateMatrix();
        face.originalPosition = face.position.clone();
        face.originalRotation = face.quaternion.clone();
        face.originalMatrix = face.matrix.clone();
      }
    });
  }, []);

  // Rotate to a specific face
  const rotateTo = (newIndex: number) => {
    if (newIndex === currentFaceIndex) return;
    setCurrentFaceIndex(newIndex);

    const group = groupRef.current!;
    const camera = cameraRef.current!;
    const startPosition = camera.position.clone();
    const zoomOutPosition = startPosition.clone().multiplyScalar(1.5);
    const startQuaternion = group.quaternion.clone();
    const targetRotation = targetRotations[newIndex];
    const endQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotation));

    new TWEEN.Tween(camera.position)
      .to(zoomOutPosition, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()
      .onComplete(() => {
        new TWEEN.Tween({ t: 0 })
          .to({ t: 1 }, 1000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(({ t }) => {
            group.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
          })
          .start()
          .onComplete(() => {
            new TWEEN.Tween(camera.position)
              .to(startPosition, 500)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start();
          });
      });
  };

  // Unfold right or bottom face
  const toggleUnfold = (preferred: 'right' | 'bottom') => {
    let dir = preferred;
    const landscape = window.innerWidth > window.innerHeight;
    if (preferred === 'right' && !landscape) dir = 'bottom';
    if (preferred === 'bottom' && landscape) dir = 'right';
    const key = dir === 'right' ? 'east' : 'south';
    const adjacentIndex = adjacencies[currentFaceIndex][key];
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

  // Reset cube
  const resetCube = () => {
    unfoldProgress.current = new Array(6).fill(0);
    rotateTo(0);
  };

  return (
    <div className="relative w-screen h-screen bg-gray-100">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera as THREE.PerspectiveCamera;
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <group ref={groupRef}>
          {faceData.map((data, index) => (
            <CubeFace
              key={index}
              position={data.position}
              rotation={data.rotation}
              content={data.label}
              ref={(el) => {
                facesRef.current[index] = el as FaceMesh;
              }}
            />
          ))}
        </group>
        <FrameUpdater
          currentFaceIndex={currentFaceIndex}
          unfoldProgress={unfoldProgress}
          facesRef={facesRef}
          unfoldConfigs={unfoldConfigs}
        />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <ControlPanel onRotate={rotateTo} onUnfold={toggleUnfold} onReset={resetCube} />
    </div>
  );
}
