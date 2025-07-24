import React, { useEffect, useContext } from 'react';
import * as THREE from 'three';
import { CubeContext } from './CubeScene';

export function Face({ index, color, position, rotation }) {
  const { group, faces } = useContext(CubeContext);

  useEffect(() => {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.userData = { folded: true };

    group.current.add(mesh);
    faces.current[index] = mesh;

    return () => {
      group.current.remove(mesh);
      faces.current[index] = null;
    };
  }, []);

  return null;
}