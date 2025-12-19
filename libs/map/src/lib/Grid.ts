import * as THREE from 'three';

const AU = 149597870.7;

export const drawGrid = (): THREE.Object3D => {
  const object3d = new THREE.Object3D();

  const axisHelper = new THREE.AxesHelper(AU * 2);
  object3d.add(axisHelper);

  const material = new THREE.LineBasicMaterial({
    color: 0xc0c0c0,
  });

  const line = (
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
  ) => {
    const points = [];
    points.push(new THREE.Vector3(x1, y1, z1));
    points.push(new THREE.Vector3(x2, y2, z2));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return new THREE.Line(geometry, material);
  };

  // Grid X-Z
  object3d.add(line(AU, 0, 0, AU, 0, AU * 2));
  object3d.add(line(AU * 2, 0, 0, AU * 2, 0, AU * 2));

  object3d.add(line(0, 0, AU, AU * 2, 0, AU));
  object3d.add(line(0, 0, AU * 2, AU * 2, 0, AU * 2));

  // Grid Z-Y
  object3d.add(line(0, AU, 0, 0, AU, AU * 2));
  object3d.add(line(0, AU * 2, 0, 0, AU * 2, AU * 2));

  object3d.add(line(0, 0, AU, 0, AU * 2, AU));
  object3d.add(line(0, 0, AU * 2, 0, AU * 2, AU * 2));

  // Grid X-Y
  object3d.add(line(AU, 0, 0, AU, AU * 2, 0));
  object3d.add(line(AU * 2, 0, 0, AU * 2, AU * 2, 0));

  object3d.add(line(0, AU, 0, AU * 2, AU, 0));
  object3d.add(line(0, AU * 2, 0, AU * 2, AU * 2, 0));

  return object3d;
};
