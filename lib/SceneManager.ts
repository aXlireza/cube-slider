import * as THREE from 'three';

export default class SceneManager {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 6;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Resize Handling
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    const { clientWidth, clientHeight } = this.container;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  render = () => {
    this.renderer.render(this.scene, this.camera);
  }

  cleanup() {
    window.removeEventListener('resize', this.handleResize);
    this.container.removeChild(this.renderer.domElement);
  }
}
