import * as THREE from 'three';

export function createCube(size = 2) {
  const group = new THREE.Group();
  const geometry = new THREE.PlaneGeometry(size, size);
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]; // Right, Left, Top, Bottom, Front, Back

  const faceConfigs = [
    { pos: [size / 2, 0, 0], rot: [0, Math.PI / 2, 0] }, // Right
    { pos: [-size / 2, 0, 0], rot: [0, -Math.PI / 2, 0] }, // Left
    { pos: [0, size / 2, 0], rot: [-Math.PI / 2, 0, 0] }, // Top
    { pos: [0, -size / 2, 0], rot: [Math.PI / 2, 0, 0] }, // Bottom
    { pos: [0, 0, size / 2], rot: [0, 0, 0] }, // Front
    { pos: [0, 0, -size / 2], rot: [0, Math.PI, 0] }, // Back
  ];

  const faces: THREE.Mesh[] = faceConfigs.map(({ pos, rot }, idx) => {
    const mat = new THREE.MeshBasicMaterial({ color: colors[idx], side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.userData = { folded: true };
    group.add(mesh);
    return mesh;
  });

  return { group, faces };
}
