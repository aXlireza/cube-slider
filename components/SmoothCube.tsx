'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { useRef, useState, useEffect, forwardRef, useMemo } from 'react';

const SIZE = 2;

const faceData = [
  { position: [0, 0, 1], rotation: [0, 0, 0], label: 'Front' },
  { position: [1, 0, 0], rotation: [0, Math.PI / 2, 0], label: 'Right' },
  { position: [0, 0, -1], rotation: [0, Math.PI, 0], label: 'Back' },
  { position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0], label: 'Left' },
  { position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0], label: 'Top' },
  { position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0], label: 'Bottom' },
];

const faceColors = ['#ffcccc', '#ccffcc', '#ccccff', '#ffffcc', '#ffccff', '#ccffff'];

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

function getUnfoldConfigs(size: number) {
  const p = (x: number, y: number, z: number) => [x * size, y * size, z * size] as [number, number, number];
  return {
    '0-5': { pivot: p(0, -0.5, 0.5), axis: [1, 0, 0] },
    '0-1': { pivot: p(0.5, 0, 0.5), axis: [0, 1, 0] },
    '1-5': { pivot: p(0.5, -0.5, 0), axis: [0, 0, 1] },
    '1-2': { pivot: p(0.5, 0, -0.5), axis: [0, 1, 0] },
    '2-5': { pivot: p(0, -0.5, -0.5), axis: [1, 0, 0] },
    '2-3': { pivot: p(-0.5, 0, -0.5), axis: [0, 1, 0] },
    '3-5': { pivot: p(-0.5, -0.5, 0), axis: [0, 0, 1] },
    '3-0': { pivot: p(-0.5, 0, 0.5), axis: [0, 1, 0] },
    '4-0': { pivot: p(0, 0.5, 0.5), axis: [1, 0, 0] },
    '4-1': { pivot: p(0.5, 0.5, 0), axis: [0, 0, 1] },
    '5-2': { pivot: p(0, -0.5, -0.5), axis: [1, 0, 0] },
    '5-1': { pivot: p(0.5, -0.5, 0), axis: [0, 0, 1] },
  } as Record<string, { pivot: [number, number, number]; axis: [number, number, number] }>;
}

const CubeFace = forwardRef<THREE.Mesh, { position: number[]; rotation: number[]; label: string; color: string }>(
  ({ position, rotation, label, color }, ref) => (
    <mesh position={position as any} rotation={rotation as any} ref={ref as any}>
      <planeGeometry args={[SIZE, SIZE]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      <Html center distanceFactor={1.1} wrapperClass="pointer-events-none">
        <div className="text-black text-xl font-semibold">{label}</div>
      </Html>
    </mesh>
  )
);
CubeFace.displayName = 'CubeFace';

function ControlPanel({
  simpleNext,
  complexNext,
  goBack,
  toggleBottom,
  toggleRight,
  canGoBack,
}: {
  simpleNext: () => void;
  complexNext: () => void;
  goBack: () => void;
  toggleBottom: () => void;
  toggleRight: () => void;
  canGoBack: boolean;
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <button className="px-3 py-1 bg-black text-white rounded" onClick={goBack} disabled={!canGoBack}>
        Back
      </button>
      <button className="px-3 py-1 bg-black text-white rounded" onClick={simpleNext}>
        Next
      </button>
      <button className="px-3 py-1 bg-black text-white rounded" onClick={complexNext}>
        Fancy Next
      </button>
      <button className="px-3 py-1 bg-black text-white rounded" onClick={toggleBottom}>
        Toggle Bottom
      </button>
      <button className="px-3 py-1 bg-black text-white rounded" onClick={toggleRight}>
        Toggle Right
      </button>
    </div>
  );
}

export default function SmoothCube() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const facesRef = useRef<THREE.Mesh[]>([]);
  const unfoldProgress = useRef<number[]>(new Array(6).fill(0));
  const unfoldConfigs = useMemo(() => getUnfoldConfigs(SIZE), []);

  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);

  const rotateToFace = (index: number, complex: boolean) => {
    const group = groupRef.current!;
    const camera = cameraRef.current!;
    const startPosition = camera.position.clone();
    const zoomOut = startPosition.clone().multiplyScalar(1.5);
    const startQ = group.quaternion.clone();
    const endQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotations[index]));

    if (complex) {
      const randomQ = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(Math.random() * Math.PI * 4, Math.random() * Math.PI * 4, Math.random() * Math.PI * 4)
      );

      new TWEEN.Tween(camera.position)
        .to(zoomOut, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
          new TWEEN.Tween({ t: 0 })
            .to({ t: 1 }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(({ t }) => {
              group.quaternion.slerpQuaternions(startQ, randomQ, t);
            })
            .onComplete(() => {
              new TWEEN.Tween({ t: 0 })
                .to({ t: 1 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(({ t }) => {
                  group.quaternion.slerpQuaternions(randomQ, endQ, t);
                })
                .onComplete(() => {
                  new TWEEN.Tween(camera.position)
                    .to(startPosition, 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                })
                .start();
            })
            .start();
        })
        .start();
    } else {
      new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(({ t }) => {
          group.quaternion.slerpQuaternions(startQ, endQ, t);
        })
        .start();
    }

    setCurrentFaceIndex(index);
  };

  const simpleNext = () => {
    const next = (currentFaceIndex + 1) % 6;
    setHistory((h) => [...h, next]);
    rotateToFace(next, false);
  };

  const complexNext = () => {
    let next = Math.floor(Math.random() * 6);
    if (next === currentFaceIndex) next = (next + 1) % 6;
    setHistory((h) => [...h, next]);
    rotateToFace(next, true);
  };

  const goBack = () => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const newHist = h.slice(0, -1);
      const idx = newHist[newHist.length - 1];
      rotateToFace(idx, false);
      return newHist;
    });
  };

  const toggleUnfold = (dir: 'south' | 'east') => {
    const adjacentIndex = adjacencies[currentFaceIndex][dir];
    const current = unfoldProgress.current[adjacentIndex];
    const target = current > 0 ? 0 : 1;

    new TWEEN.Tween({ p: current })
      .to({ p: target }, 600)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ p }) => {
        unfoldProgress.current[adjacentIndex] = p;
      })
      .start();
  };

  const Scene = () => {
    useEffect(() => {
      facesRef.current.forEach((face) => {
        if (face) {
          (face as any).originalPosition = face.position.clone();
          (face as any).originalRotation = face.quaternion.clone();
          (face as any).originalMatrix = face.matrix.clone();
        }
      });
    }, []);

    useFrame(() => {
      TWEEN.update();
      facesRef.current.forEach((face, idx) => {
        if (!face) return;
        const progress = unfoldProgress.current[idx];
        const config = unfoldConfigs[`${currentFaceIndex}-${idx}`];
        if (progress > 0 && config) {
          const { pivot, axis } = config;
          const angle = (Math.PI / 2) * progress;
          const R = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(...axis), angle);
          const T = new THREE.Matrix4().makeTranslation(...pivot);
          const Ti = new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]);
          const mat = T.multiply(R).multiply(Ti);
          face.matrix.copy((face as any).originalMatrix).premultiply(mat);
          face.matrix.decompose(face.position, face.quaternion, face.scale);
        } else if ((face as any).originalPosition) {
          face.position.copy((face as any).originalPosition);
          face.quaternion.copy((face as any).originalRotation);
        }
      });
    });

    return (
      <>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group ref={groupRef}>
          {faceData.map((data, idx) => (
            <CubeFace
              key={idx}
              position={data.position}
              rotation={data.rotation}
              label={data.label}
              color={faceColors[idx]}
              ref={(el) => (facesRef.current[idx] = el!)}
            />
          ))}
        </group>
        <OrbitControls enableZoom={false} enablePan={false} />
      </>
    );
  };

  return (
    <div className="relative w-screen h-screen bg-gray-100">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={({ camera }) =>
          (cameraRef.current = camera as THREE.PerspectiveCamera)
        }
      >
        <Scene />
      </Canvas>
      <ControlPanel
        simpleNext={simpleNext}
        complexNext={complexNext}
        goBack={goBack}
        toggleBottom={() => toggleUnfold('south')}
        toggleRight={() => toggleUnfold('east')}
        canGoBack={history.length > 1}
      />
    </div>
  );
}

