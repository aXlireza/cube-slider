import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class CameraManager {
  private camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  async rotateToFace(targetQuaternion: THREE.Quaternion): Promise<void> {
    return new Promise(resolve => {
      const startQuat = this.camera.quaternion.clone();
      new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(({ t }) => {
          THREE.Quaternion.slerp(startQuat, targetQuaternion, this.camera.quaternion, t);
        })
        .onComplete(() => resolve())
        .start();
    });
  }

  async zoomTo(distance: number): Promise<void> {
    return new Promise(resolve => {
      const startZ = this.camera.position.z;
      new TWEEN.Tween({ z: startZ })
        .to({ z: distance }, 500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(({ z }) => {
          this.camera.position.z = z;
        })
        .onComplete(() => resolve())
        .start();
    });
  }
}
