'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CubeFace from './CubeFace';
import ControlPanel from './ControlPanel';

const size = 2;

const faceData = [
  { position: [0, 0, size / 2], rotation: [0, 0, 0], label: 'Front' },
  { position: [size / 2, 0, 0], rotation: [0, Math.PI / 2, 0], label: 'Right' },
  { position: [0, 0, -size / 2], rotation: [0, Math.PI, 0], label: 'Back' },
  { position: [-size / 2, 0, 0], rotation: [0, -Math.PI / 2, 0], label: 'Left' },
  { position: [0, size / 2, 0], rotation: [-Math.PI / 2, 0, 0], label: 'Top' },
  { position: [0, -size / 2, 0], rotation: [Math.PI / 2, 0, 0], label: 'Bottom' },
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
  '0-5': { pivot: [0, -size / 2, size / 2], axis: [1, 0, 0] },
  '0-1': { pivot: [size / 2, 0, size / 2], axis: [0, 1, 0] },
  '1-5': { pivot: [size / 2, -size / 2, 0], axis: [0, 0, 1] },
  '1-2': { pivot: [size / 2, 0, -size / 2], axis: [0, 1, 0] },
  '2-5': { pivot: [0, -size / 2, -size / 2], axis: [1, 0, 0] },
  '2-3': { pivot: [-size / 2, 0, -size / 2], axis: [0, 1, 0] },
  '3-5': { pivot: [-size / 2, -size / 2, 0], axis: [0, 0, 1] },
  '3-0': { pivot: [-size / 2, 0, size / 2], axis: [0, 1, 0] },
  '4-0': { pivot: [0, size / 2, size / 2], axis: [1, 0, 0] },
  '4-1': { pivot: [size / 2, size / 2, 0], axis: [0, 0, 1] },
  '5-2': { pivot: [0, -size / 2, -size / 2], axis: [1, 0, 0] },
  '5-1': { pivot: [size / 2, -size / 2, 0], axis: [0, 0, 1] },
};

export default function CubeScene() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const facesRef = useRef<THREE.Mesh[]>([]);
  const unfoldProgress = useRef<number[]>(new Array(6).fill(0));
  const [history, setHistory] = useState<number[]>([0]);

  const currentFace = history[history.length - 1];

  useEffect(() => {
    facesRef.current.forEach((face) => {
      if (face) {
        face.updateMatrix();
        (face as any).originalMatrix = face.matrix.clone();
      }
    });
  }, []);

  const rotateToFace = (index: number, complex = false) => {
    const group = groupRef.current!;
    const camera = cameraRef.current!;
    const startPos = camera.position.clone();
    const zoomOut = startPos.clone().multiplyScalar(1.5);
    const startQuat = group.quaternion.clone();
    const targetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...targetRotations[index])
    );

    const rotateSequence = () => {
      new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(({ t }) => {
          group.quaternion.slerpQuaternions(startQuat, targetQuat, t);
        })
        .onComplete(() => {
          new TWEEN.Tween(camera.position)
            .to(startPos, 500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        })
        .start();
    };

    new TWEEN.Tween(camera.position)
      .to(zoomOut, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        if (complex) {
          const randomQuat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
              Math.random() * Math.PI * 4,
              Math.random() * Math.PI * 4,
              Math.random() * Math.PI * 4
            )
          );
          new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(({ t }) => {
              group.quaternion.slerpQuaternions(startQuat, randomQuat, t);
            })
            .onComplete(() => {
              startQuat.copy(randomQuat);
              rotateSequence();
            })
            .start();
        } else {
          rotateSequence();
        }
      })
      .start();
  };

  const nextSimple = () => {
    const next = (currentFace + 1) % 6;
    setHistory((h) => [...h, next]);
    rotateToFace(next, false);
  };

  const nextComplex = () => {
    let next = currentFace;
    while (next === currentFace) {
      next = Math.floor(Math.random() * 6);
    }
    setHistory((h) => [...h, next]);
    rotateToFace(next, true);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setHistory((h) => h.slice(0, -1));
    rotateToFace(prev, false);
  };

  const toggleUnfold = (dir: 'south' | 'east') => {
    const adjacent = adjacencies[currentFace][dir];
    const progress = unfoldProgress.current[adjacent];
    const target = progress > 0 ? 0 : 1;
    new TWEEN.Tween({ p: progress })
      .to({ p: target }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ p }) => {
        unfoldProgress.current[adjacent] = p;
      })
      .start();
  };

  useFrame(() => {
    TWEEN.update();
    facesRef.current.forEach((face, idx) => {
      if (!face) return;
      const progress = unfoldProgress.current[idx];
      const config = unfoldConfigs[`${currentFace}-${idx}`];
      if (progress > 0 && config) {
        const { pivot, axis } = config;
        const angle = (Math.PI / 2) * progress;
        const R = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(...axis),
          angle
        );
        const T = new THREE.Matrix4().makeTranslation(...pivot);
        const Ti = new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]);
        const m = T.multiply(R).multiply(Ti);
        const orig = (face as any).originalMatrix;
        face.matrix.copy(orig).premultiply(m);
        face.matrix.decompose(face.position, face.quaternion, face.scale);
      } else if ((face as any).originalMatrix) {
        face.matrix.copy((face as any).originalMatrix);
        face.matrix.decompose(face.position, face.quaternion, face.scale);
      }
    });
  });

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
          {faceData.map((f, i) => (
            <CubeFace
              key={i}
              position={f.position as [number, number, number]}
              rotation={f.rotation as [number, number, number]}
              size={size}
              content={<div className="p-2 bg-white/80 rounded">{f.label}</div>}
              ref={(el) => (facesRef.current[i] = el!)}
            />
          ))}
        </group>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
      <ControlPanel
        onNextSimple={nextSimple}
        onNextComplex={nextComplex}
        onBack={goBack}
        onUnfoldBottom={() => toggleUnfold('south')}
        onUnfoldRight={() => toggleUnfold('east')}
      />
    </div>
  );
}
