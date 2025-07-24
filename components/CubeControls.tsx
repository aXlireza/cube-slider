import React, { useContext, useCallback } from 'react';
import { CubeContext } from './CubeScene';
import { unfoldConfigs, adjacencies } from '../utils/cubeConfig';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export function CubeControls() {
  const {
    camera,
    faces,
    isAnimating,
    setIsAnimating,
    size,
    animationDuration,
  } = useContext(CubeContext);

  const getCurrentFace = useCallback(() => {
    const camPos = camera.current.position.clone().normalize();
    const normals = faces.current.map(face =>
      new THREE.Vector3(0, 0, 1).applyQuaternion(face.quaternion)
    );
    return normals
      .map(normal => normal.dot(camPos))
      .indexOf(Math.max(...normals.map(n => n.dot(camPos))));
  }, [camera, faces]);

  const toggleFold = useCallback(
    (faceIdx, baseIdx) => {
      if (isAnimating) return;
      setIsAnimating(true);
      const face = faces.current[faceIdx];
      const folded = face.userData.folded;
      const config = unfoldConfigs[`${baseIdx}-${faceIdx}`];
      if (!config) return;

      const { pivot, axis } = config;
      const p = new THREE.Vector3(...pivot);
      const d = new THREE.Vector3(...axis).normalize();
      const orig = face.matrix.clone();

      const start = folded ? 0 : Math.PI / 2;
      const end = folded ? Math.PI / 2 : 0;

      new TWEEN.Tween({ theta: start })
        .to({ theta: end }, animationDuration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(({ theta }) => {
          const R = new THREE.Matrix4().makeRotationAxis(d, theta);
          const T = new THREE.Matrix4().makeTranslation(p.x, p.y, p.z);
          const Ti = new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z);
          face.matrix.copy(orig).premultiply(T.multiply(R).multiply(Ti));
          face.matrix.decompose(face.position, face.quaternion, face.scale);
        })
        .onComplete(() => {
          face.userData.folded = !folded;
          setIsAnimating(false);
        })
        .start();
    },
    [isAnimating]
  );

  const handleClick = (dir) => {
    const current = getCurrentFace();
    const target = adjacencies[current][dir];
    if (target !== undefined) toggleFold(target, current);
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {['Top', 'Bottom', 'Left', 'Right'].map((label, idx) => (
        <button
          key={label}
          className={`px-4 py-2 bg-black text-white rounded-lg ${isAnimating ? 'opacity-50' : ''}`}
          onClick={() => handleClick(idx)}
          disabled={isAnimating}
        >
          {`Unfold ${label}`}
        </button>
      ))}
    </div>
  );
}