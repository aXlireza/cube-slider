'use client';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const faceData = [
  { position: [0, 0, 1], rotation: [0, 0, 0], label: 'Front' },
  { position: [1, 0, 0], rotation: [0, Math.PI / 2, 0], label: 'Right' },
  { position: [0, 0, -1], rotation: [0, Math.PI, 0], label: 'Back' },
  { position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0], label: 'Left' },
  { position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0], label: 'Top' },
  { position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0], label: 'Bottom' },
] as const;

type Direction = 'south' | 'east';

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

export default function SmoothCube() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const facesRef = useRef<THREE.Mesh[]>([]);

  const [currentFace, setCurrentFace] = useState(0);
  const historyRef = useRef<number[]>([]);
  const unfold = useRef<number[]>(new Array(6).fill(0));


  const animateToFace = (index: number, complex: boolean) => {
    const group = groupRef.current;
    const camera = cameraRef.current;
    if (!group || !camera) return;

    const startQuat = group.quaternion.clone();
    const endQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotations[index]));
    const startPos = camera.position.clone();
    const zoomPos = startPos.clone().multiplyScalar(1.5);
    const randomQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2));

    const tl = gsap.timeline();

    if (complex) tl.to(camera.position, { duration: 0.5, x: zoomPos.x, y: zoomPos.y, z: zoomPos.z, ease: 'power2.inOut' });

    const rot1 = { t: 0 };
    tl.to(rot1, {
      duration: complex ? 0.8 : 1,
      t: 1,
      ease: 'power2.inOut',
      onUpdate: () => {
        const q = new THREE.Quaternion();
        if (complex) {
          q.slerpQuaternions(startQuat, randomQuat, rot1.t);
        } else {
          q.slerpQuaternions(startQuat, endQuat, rot1.t);
        }
        group.quaternion.copy(q);
      },
    });

    if (complex) {
      const rot2 = { t: 0 };
      tl.to(rot2, {
        duration: 0.8,
        t: 1,
        ease: 'power2.inOut',
        onUpdate: () => {
          const q = new THREE.Quaternion();
          q.slerpQuaternions(randomQuat, endQuat, rot2.t);
          group.quaternion.copy(q);
        },
      });
    }

    if (complex) tl.to(camera.position, { duration: 0.5, x: startPos.x, y: startPos.y, z: startPos.z, ease: 'power2.inOut' });
  };

  const nextSimple = () => {
    const newIndex = (currentFace + 1) % 6;
    historyRef.current.push(currentFace);
    setCurrentFace(newIndex);
    animateToFace(newIndex, false);
  };

  const nextComplex = () => {
    let newIndex = currentFace;
    while (newIndex === currentFace) newIndex = Math.floor(Math.random() * 6);
    historyRef.current.push(currentFace);
    setCurrentFace(newIndex);
    animateToFace(newIndex, true);
  };

  const goBack = () => {
    const prev = historyRef.current.pop();
    if (prev !== undefined) {
      setCurrentFace(prev);
      animateToFace(prev, false);
    }
  };

  const toggleUnfold = (direction: Direction) => {
    const target = adjacencies[currentFace][direction];
    const progress = unfold.current[target];
    const targetProgress = progress > 0 ? 0 : 1;
    const obj = { p: progress };
    gsap.to(obj, {
      duration: 1,
      p: targetProgress,
      ease: 'power2.inOut',
      onUpdate: () => {
        unfold.current[target] = obj.p;
      },
    });
  };

  const CubeGroup = () => {
    useEffect(() => {
      facesRef.current.forEach((face) => {
        if (face) {
          face.userData.originalPosition = face.position.clone();
          face.userData.originalQuaternion = face.quaternion.clone();
          face.userData.originalMatrix = face.matrix.clone();
        }
      });
    }, []);

    useFrame(() => {
      facesRef.current.forEach((face, idx) => {
        if (!face) return;
        const progress = unfold.current[idx];
        const config = unfoldConfigs[`${currentFace}-${idx}`];
        if (progress > 0 && config) {
          const { pivot, axis } = config;
          const angle = (Math.PI / 2) * progress;
          const R = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(...axis), angle);
          const T = new THREE.Matrix4().makeTranslation(...pivot);
          const Ti = new THREE.Matrix4().makeTranslation(-pivot[0], -pivot[1], -pivot[2]);
          const matrix = new THREE.Matrix4().multiplyMatrices(T, R).multiply(Ti);
          face.matrix.copy(face.userData.originalMatrix).premultiply(matrix);
          face.matrix.decompose(face.position, face.quaternion, face.scale);
        } else {
          face.position.copy(face.userData.originalPosition);
          face.quaternion.copy(face.userData.originalQuaternion);
        }
      });
    });

    return (
      <group ref={groupRef}>
        {faceData.map((face, idx) => (
          <mesh
            key={idx}
            ref={(el: THREE.Mesh | null) => {
              if (el) facesRef.current[idx] = el;
            }}
            position={face.position as [number, number, number]}
            rotation={face.rotation as [number, number, number]}
          >
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial color={`hsl(${idx * 60},70%,60%)`} side={THREE.DoubleSide} />
            <Html transform center>
              <div className="bg-white/80 p-4 rounded-lg text-black w-32 h-32 flex items-center justify-center">
                {face.label}
              </div>
            </Html>
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <div className="relative w-screen h-screen bg-gray-100">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} onCreated={({ camera }) => { cameraRef.current = camera as THREE.PerspectiveCamera; }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <CubeGroup />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button className="px-3 py-1 bg-black text-white rounded" onClick={goBack}>Back</button>
        <button className="px-3 py-1 bg-black text-white rounded" onClick={nextSimple}>Next Simple</button>
        <button className="px-3 py-1 bg-black text-white rounded" onClick={nextComplex}>Next Fancy</button>
        <button className="px-3 py-1 bg-black text-white rounded" onClick={() => toggleUnfold('south')}>Toggle Bottom</button>
        <button className="px-3 py-1 bg-black text-white rounded" onClick={() => toggleUnfold('east')}>Toggle Right</button>
      </div>
    </div>
  );
}
