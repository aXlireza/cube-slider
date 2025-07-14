'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export default function CubeExperiment() {
  const mountRef = useRef<HTMLDivElement>(null);
  const facesRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [faceHistory, setFaceHistory] = useState<number[]>([4]); // Start on front face

  const cubeSize = 2;

  const faceRotations = [
    new THREE.Euler(0, -Math.PI / 2, 0), // Right
    new THREE.Euler(0, Math.PI / 2, 0),  // Left
    new THREE.Euler(Math.PI / 2, 0, 0),  // Top
    new THREE.Euler(-Math.PI / 2, 0, 0), // Bottom
    new THREE.Euler(0, 0, 0),            // Front
    new THREE.Euler(0, Math.PI, 0),      // Back
  ];

  const unfoldConfigs: Record<string, { pivot: number[]; axis: number[] }> = {
    '4-3': { pivot: [0, -cubeSize / 2, cubeSize / 2], axis: [1, 0, 0] }, // Front → Bottom
    '4-0': { pivot: [cubeSize / 2, 0, cubeSize / 2], axis: [0, 1, 0] },  // Front → Right
    '0-2': { pivot: [cubeSize / 2, cubeSize / 2, 0], axis: [0, 0, 1] },  // Right → Top
    '0-3': { pivot: [cubeSize / 2, -cubeSize / 2, 0], axis: [0, 0, 1] }, // Right → Bottom
    '1-2': { pivot: [-cubeSize / 2, cubeSize / 2, 0], axis: [0, 0, 1] }, // Left → Top
    '1-3': { pivot: [-cubeSize / 2, -cubeSize / 2, 0], axis: [0, 0, 1] }, // Left → Bottom
    '5-3': { pivot: [0, -cubeSize / 2, -cubeSize / 2], axis: [1, 0, 0] }, // Back → Bottom
    '5-0': { pivot: [cubeSize / 2, 0, -cubeSize / 2], axis: [0, 1, 0] },  // Back → Right
  };

  const rotateToFace = async (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const camera = cameraRef.current!;
    const group = groupRef.current!;
    const startRot = group.rotation.clone();
    const targetRot = faceRotations[index];

    return new Promise<void>((resolve) => {
      new TWEEN.Tween(camera.position)
        .to({ z: 10 }, 400)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      new TWEEN.Tween(startRot)
        .to({ x: targetRot.x, y: targetRot.y, z: targetRot.z }, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          group.rotation.set(startRot.x, startRot.y, startRot.z);
        })
        .onComplete(() => {
          new TWEEN.Tween(camera.position)
            .to({ z: 6 }, 400)
            .easing(TWEEN.Easing.Quadratic.In)
            .onComplete(() => {
              setFaceHistory((prev) => [...prev, index]);
              setIsAnimating(false);
              resolve();
            })
            .start();
        })
        .start();
    });
  };

  const unfoldFace = (baseIndex: number, targetIndex: number) => {
  if (isAnimating) return;
  const face = facesRef.current[targetIndex];
  if (!face) return;

  const config = unfoldConfigs[`${baseIndex}-${targetIndex}`];
  if (!config) return;

  const { pivot, axis } = config;
  const p = new THREE.Vector3(...pivot);
  const d = new THREE.Vector3(...axis).normalize();

  // 🔄 Track fold state
  const isCurrentlyFolded = face.userData.folded !== false;
  const startTheta = isCurrentlyFolded ? 0 : Math.PI / 2;
  const endTheta = isCurrentlyFolded ? Math.PI / 2 : 0;

  face.updateMatrix();
  const originalMatrix = face.matrix.clone();

  setIsAnimating(true);
  new TWEEN.Tween({ theta: startTheta })
    .to({ theta: endTheta }, 1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(({ theta }) => {
      const R = new THREE.Matrix4().makeRotationAxis(d, theta);
      const T = new THREE.Matrix4().makeTranslation(p.x, p.y, p.z);
      const Tinv = new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z);
      const transform = T.multiply(R).multiply(Tinv);

      const result = originalMatrix.clone().premultiply(transform);
      face.matrix.copy(result);
      face.matrix.decompose(face.position, face.quaternion, face.scale);
    })
    .onComplete(() => {
      face.userData.folded = !isCurrentlyFolded;
      setIsAnimating(false);
    })
    .start();
  };



  const handleUnfold = (direction: 'bottom' | 'right') => {
    debugger
    const currentFace = faceHistory[faceHistory.length - 1];
    const targetMap: Record<number, Record<'bottom' | 'right', number>> = {
      4: { bottom: 3, right: 0 },
      0: { bottom: 3, right: 2 },
      1: { bottom: 3, right: 2 },
      5: { bottom: 3, right: 0 },
    };

    const target = targetMap[currentFace]?.[direction];
    if (typeof target === 'number') {
      unfoldFace(currentFace, target);
    }
  };

  const goBack = () => {
    if (isAnimating || faceHistory.length < 2) return;
    const prev = [...faceHistory];
    prev.pop();
    const last = prev[prev.length - 1];
    setFaceHistory(prev);
    rotateToFace(last);
  };

  const goForward = () => {
    const next = (faceHistory.at(-1)! + 1) % 6;
    rotateToFace(next);
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const geometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

    const positions = [
      [cubeSize / 2, 0, 0],   // Right
      [-cubeSize / 2, 0, 0],  // Left
      [0, cubeSize / 2, 0],   // Top
      [0, -cubeSize / 2, 0],  // Bottom
      [0, 0, cubeSize / 2],   // Front
      [0, 0, -cubeSize / 2],  // Back
    ];

    const rotations = [
      [0, Math.PI / 2, 0],  // Right
      [0, -Math.PI / 2, 0], // Left
      [-Math.PI / 2, 0, 0], // Top
      [Math.PI / 2, 0, 0],  // Bottom
      [0, 0, 0],            // Front
      [0, Math.PI, 0],      // Back
    ];

    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...positions[i]);
      mesh.rotation.set(...rotations[i]);
      mesh.userData = { folded: true };
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      group.add(mesh);
      facesRef.current.push(mesh);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <button onClick={goBack} disabled={isAnimating} className="px-4 py-2 bg-gray-700 text-white rounded">◀ Back</button>
        <button onClick={goForward} disabled={isAnimating} className="px-4 py-2 bg-gray-700 text-white rounded">▶ Forward</button>
        <button onClick={() => handleUnfold('bottom')} disabled={isAnimating} className="px-4 py-2 bg-blue-700 text-white rounded">Unfold Bottom</button>
        <button onClick={() => handleUnfold('right')} disabled={isAnimating} className="px-4 py-2 bg-green-700 text-white rounded">Unfold Right</button>
      </div>
    </div>
  );
}
