import * as THREE from 'three';

export function getCurrentFace(camera: THREE.Camera, faces: THREE.Mesh[]): number {
  const viewDir = new THREE.Vector3();
  camera.getWorldDirection(viewDir);

  let maxDot = -Infinity;
  let bestFaceIndex = -1;

  faces.forEach((face, i) => {
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(face.quaternion);
    const dot = normal.dot(viewDir.negate());
    if (dot > maxDot) {
      maxDot = dot;
      bestFaceIndex = i;
    }
  });

  return bestFaceIndex;
}
