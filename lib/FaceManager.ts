import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class FaceManager {
  private unfoldConfigs: Record<string, { pivot: number[]; axis: number[] }> = {};
  private faces: THREE.Mesh[];

  constructor(faces: THREE.Mesh[], cubeSize = 2) {
    this.faces = faces;
    this.initUnfoldConfigs(cubeSize);
  }

  private initUnfoldConfigs(cubeSize: number) {
    // Same content as your previous `unfoldConfigs`, trimmed for brevity.
    const cfg = (key: string, p: number[], a: number[]) => {
      this.unfoldConfigs[key] = { pivot: p, axis: a };
    };
    cfg('4-3', [0, -cubeSize / 2, cubeSize / 2], [1, 0, 0]); // Front to Bottom
    cfg('4-0', [cubeSize / 2, 0, cubeSize / 2], [0, 1, 0]); // Front to Right
    // Add all valid folds as needed...
  }

  toggleFold(faceIndex: number, baseFaceIndex: number, onComplete: () => void) {
    const face = this.faces[faceIndex];
    const isFolded = face.userData.folded !== false;
    const config = this.unfoldConfigs[`${baseFaceIndex}-${faceIndex}`];
    if (!config) return;

    const { pivot, axis } = config;
    const p = new THREE.Vector3(...pivot);
    const d = new THREE.Vector3(...axis).normalize();
    const originalMatrix = face.matrix.clone();

    const startTheta = isFolded ? 0 : Math.PI / 2;
    const targetTheta = isFolded ? Math.PI / 2 : 0;

    new TWEEN.Tween({ theta: startTheta })
      .to({ theta: targetTheta }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(({ theta }) => {
        const R = new THREE.Matrix4().makeRotationAxis(d, theta);
        const T = new THREE.Matrix4().makeTranslation(p.x, p.y, p.z);
        const Tinv = new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z);
        const additionalMatrix = T.multiply(R).multiply(Tinv);
        face.matrix.copy(originalMatrix).premultiply(additionalMatrix);
        face.matrix.decompose(face.position, face.quaternion, face.scale);
      })
      .onComplete(() => {
        face.userData.folded = !isFolded;
        onComplete();
      })
      .start();
  }
}
