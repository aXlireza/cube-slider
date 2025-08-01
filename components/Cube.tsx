'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export type FaceName = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom';

export interface FaceConfig {
  color?: string;
  content?: React.ReactNode;
}

interface CubeProps {
  faces?: Partial<Record<FaceName, FaceConfig>>;
  zoomIdle?: number;
  zoomActive?: number;
  speed?: number; // animation speed multiplier
  position?: [number, number];
  scale?: number;
}

export interface CubeHandle {
  rotateToFace: (face: FaceName) => void;
  unfold: (dir: 'right' | 'bottom') => void;
  fold: (dir: 'right' | 'bottom') => void;
  undo: () => void;
  setFaceContent: (face: FaceName, config: FaceConfig) => void;
}

interface FaceMesh extends THREE.Mesh {
  userData: {
    originalMatrix: THREE.Matrix4;
  };
}

const faceOrder: FaceName[] = ['front', 'right', 'back', 'left', 'top', 'bottom'];

const faceInfo: Record<FaceName, { position: [number, number, number]; rotation: [number, number, number] }> = {
  front: { position: [0, 0, 1], rotation: [0, 0, 0] },
  right: { position: [1, 0, 0], rotation: [0, Math.PI / 2, 0] },
  back: { position: [0, 0, -1], rotation: [0, Math.PI, 0] },
  left: { position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  top: { position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0] },
  bottom: { position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0] },
};

const targetRotations: Record<FaceName, [number, number, number]> = {
  front: [0, 0, 0],
  right: [0, -Math.PI / 2, 0],
  back: [0, Math.PI, 0],
  left: [0, Math.PI / 2, 0],
  top: [Math.PI / 2, 0, 0],
  bottom: [-Math.PI / 2, 0, 0],
};

const adjacents: Record<FaceName, { right: FaceName; bottom: FaceName }> = {
  front: { right: 'right', bottom: 'bottom' },
  right: { right: 'back', bottom: 'bottom' },
  back: { right: 'left', bottom: 'bottom' },
  left: { right: 'front', bottom: 'bottom' },
  top: { right: 'right', bottom: 'front' },
  bottom: { right: 'right', bottom: 'back' },
};

const unfoldConfigs: Record<string, { pivot: [number, number, number]; axis: [number, number, number] }> = {
  'front-bottom': { pivot: [0, -1, 1], axis: [1, 0, 0] },
  'front-right': { pivot: [1, 0, 1], axis: [0, 1, 0] },
  'right-back': { pivot: [1, 0, -1], axis: [0, 1, 0] },
  'right-bottom': { pivot: [1, -1, 0], axis: [0, 0, 1] },
  'back-left': { pivot: [-1, 0, -1], axis: [0, 1, 0] },
  'back-bottom': { pivot: [0, -1, -1], axis: [1, 0, 0] },
  'left-front': { pivot: [-1, 0, 1], axis: [0, 1, 0] },
  'left-bottom': { pivot: [-1, -1, 0], axis: [0, 0, 1] },
  'top-right': { pivot: [1, 1, 0], axis: [0, 0, 1] },
  'top-front': { pivot: [0, 1, 1], axis: [1, 0, 0] },
  'bottom-right': { pivot: [1, -1, 0], axis: [0, 0, 1] },
  'bottom-back': { pivot: [0, -1, -1], axis: [1, 0, 0] },
};

function TweenUpdater() {
  useFrame(() => TWEEN.update());
  return null;
}

const Cube = forwardRef<CubeHandle, CubeProps>(function Cube(
  {
    faces = {},
    zoomIdle = 5,
    zoomActive = 7,
    speed = 1,
    position = [0, 0],
    scale = 1,
  },
  ref,
) {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const facesRef = useRef<FaceMesh[]>([]);
  const [faceConfigs, setFaceConfigs] = useState<
    Partial<Record<FaceName, FaceConfig>
  >>(faces);
  useEffect(() => setFaceConfigs(faces), [faces]);
  const currentFaceRef = useRef<FaceName>('front');
  const historyRef = useRef<FaceName[]>(['front']);
  const animating = useRef(false);
  const unfoldProgress = useRef<Record<FaceName, number>>({
    front: 0,
    right: 0,
    back: 0,
    left: 0,
    top: 0,
    bottom: 0,
  });

  const [posXVal, posYVal] = position;

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const spd = Math.max(speed, 0.01);
    new TWEEN.Tween(group.position)
      .to({ x: posXVal, y: posYVal, z: 0 }, 600 / spd)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();
  }, [posXVal, posYVal, speed]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const spd = Math.max(speed, 0.01);
    const start = { s: group.scale.x };
    new TWEEN.Tween(start)
      .to({ s: scale }, 600 / spd)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ s }) => group.scale.set(s, s, s))
      .start();
  }, [scale, speed]);

  const faceIndices: Record<FaceName, number> = {
    front: 0,
    right: 1,
    back: 2,
    left: 3,
    top: 4,
    bottom: 5,
  };

  const resetUnfolds = () => {
    faceOrder.forEach((name) => {
      if (unfoldProgress.current[name] > 0) {
        const mesh = facesRef.current[faceIndices[name]];
        const orig = mesh.userData.originalMatrix;
        mesh.matrix.copy(orig);
        mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        unfoldProgress.current[name] = 0;
      }
    });
  };

  const rotateToFace = (face: FaceName, record = true) => {
    if (animating.current || currentFaceRef.current === face) return;
    animating.current = true;
    resetUnfolds();
    const group = groupRef.current!;
    const camera = cameraRef.current!;
    const startQuat = group.quaternion.clone();
    const endQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...targetRotations[face]),
    );

    const spd = Math.max(speed, 0.01);

    new TWEEN.Tween(camera.position)
      .to({ z: zoomActive }, 300 / spd)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        new TWEEN.Tween({ t: 0 })
          .to({ t: 1 }, 700 / spd)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(({ t }) => {
            group.quaternion.slerpQuaternions(startQuat, endQuat, t);
          })
          .onComplete(() => {
            new TWEEN.Tween(camera.position)
              .to({ z: zoomIdle }, 300 / spd)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onComplete(() => {
                currentFaceRef.current = face;
                if (record) historyRef.current.push(face);
                animating.current = false;
              })
              .start();
          })
          .start();
      })
      .start();
  };

  const setFoldState = (dir: 'right' | 'bottom', open: boolean) => {
    if (animating.current) return;
    const base = currentFaceRef.current;
    const adj = adjacents[base][dir];
    const idx = faceIndices[adj];
    const face = facesRef.current[idx];
    const key = `${base}-${adj}`;
    const config = unfoldConfigs[key];
    if (!face || !config) return;
    animating.current = true;
    const orig = face.userData.originalMatrix;
    const pivot = new THREE.Vector3(...config.pivot);
    const axis = new THREE.Vector3(...config.axis).normalize();
    const baseNormal = new THREE.Vector3(...faceInfo[base].position);
    const adjNormal = new THREE.Vector3(...faceInfo[adj].position);
    const plus = adjNormal.clone().applyAxisAngle(axis, Math.PI / 2);
    const minus = adjNormal.clone().applyAxisAngle(axis, -Math.PI / 2);
    const dirSign = plus.dot(baseNormal) > minus.dot(baseNormal) ? 1 : -1;
    const start = unfoldProgress.current[adj];
    const end = open ? 1 : 0;

    const spd = Math.max(speed, 0.01);
    new TWEEN.Tween({ progress: start })
      .to({ progress: end }, 600 / spd)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ progress }) => {
        unfoldProgress.current[adj] = progress;
        const angle = dirSign * (Math.PI / 2) * progress;
        const R = new THREE.Matrix4().makeRotationAxis(axis, angle);
        const T = new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z);
        const Ti = new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z);
        face.matrix.copy(orig).premultiply(T.multiply(R).multiply(Ti));
        face.matrix.decompose(face.position, face.quaternion, face.scale);
      })
      .onComplete(() => {
        animating.current = false;
      })
      .start();
  };

  const undo = () => {
    if (animating.current) return;
    const history = historyRef.current;
    if (history.length <= 1) return;
    history.pop();
    const prev = history[history.length - 1];
    rotateToFace(prev, false);
  };

  useImperativeHandle(ref, () => ({
    rotateToFace,
    unfold: (d) => setFoldState(d, true),
    fold: (d) => setFoldState(d, false),
    undo,
    setFaceContent: (face, cfg) =>
      setFaceConfigs((prev) => ({
        ...prev,
        [face]: { ...prev[face], ...cfg },
      })),
  }));

  return (
    <div className="size-full absolute">
      <Canvas
        camera={{ position: [0, 0, zoomIdle], fov: 50 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera as THREE.PerspectiveCamera;
        }}
      >
        <TweenUpdater />
        <ambientLight intensity={0.5} />
        <group ref={groupRef}>
          {faceOrder.map((name, idx) => (
            <mesh
              key={name}
              ref={(el) => {
                if (el && !facesRef.current[idx]) {
                  const faceMesh = el as FaceMesh;
                  facesRef.current[idx] = faceMesh;
                  faceMesh.matrixAutoUpdate = false;
                  faceMesh.position.set(...faceInfo[name].position);
                  faceMesh.rotation.set(...faceInfo[name].rotation);
                  faceMesh.updateMatrix();
                  faceMesh.userData = { originalMatrix: faceMesh.matrix.clone() };
                }
              }}
            >
              <planeGeometry args={[2, 2]} />
              <meshBasicMaterial
                color={faceConfigs[name]?.color || '#ccc'}
                side={THREE.DoubleSide}
              />
              {faceConfigs[name]?.content && (
                <Html center>{faceConfigs[name]?.content}</Html>
              )}
            </mesh>
          ))}
        </group>
      </Canvas>
    </div>
  );
});

export default Cube;

