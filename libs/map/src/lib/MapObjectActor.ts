/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MapObjectBase, MapObjectOptions } from './MapObjectBase';
import * as THREE from 'three';

export class MapObjectActor extends MapObjectBase {
  protected headingArrow: THREE.ArrowHelper | null = null;
  protected shipArrowX: THREE.ArrowHelper | null = null;
  protected shipArrowY: THREE.ArrowHelper | null = null;
  protected objectProjectionLine: THREE.Line;

  constructor(color: string | null = null, options: MapObjectOptions) {
    super(options);

    if (!this.options.orientation) {
      this.options.orientation = false;
    }

    if (!color) {
      color = 'lime';
    }

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: color })
    );

    if (this.options.orientation) {
      this.headingArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 0),
        10,
        'blue'
      );

      this.shipArrowX = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        10,
        'red'
      );

      this.shipArrowY = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0),
        10,
        'green'
      );
    }

    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(0, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    this.objectProjectionLine = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: color })
    );

    // TODO: Old Code, check what id did and if it needs to be
    // added to the new code
    // this.objectProjectionLine.geometry.dynamic = true;
  }

  setPosition(x: number, y: number, z: number) {
    super.setPosition(x, y, z);

    if (this.options.orientation) {
      this.headingArrow!.position.set(x, y, z);
      this.shipArrowX!.position.set(x, y, z);
      this.shipArrowY!.position.set(x, y, z);
    }

    this.objectProjectionLine.geometry.attributes.position.setXYZ(0, x, 0, z);
    this.objectProjectionLine.geometry.attributes.position.setXYZ(1, x, y, z);
    this.objectProjectionLine.geometry.attributes.position.needsUpdate = true;
  }

  setHeading(x: number, y: number, z: number) {
    if (this.options.orientation) {
      this.headingArrow!.setDirection(new THREE.Vector3(x, y, z));
    }
  }

  setShipX(x: number, y: number, z: number) {
    if (this.options.orientation) {
      this.shipArrowX!.setDirection(new THREE.Vector3(x, y, z));
    }
  }

  setShipY(x: number, y: number, z: number) {
    if (this.options.orientation) {
      this.shipArrowY!.setDirection(new THREE.Vector3(x, y, z));
    }
  }

  scale(size: number) {
    super.scale(size);

    if (this.options.orientation) {
      this.headingArrow!.scale.x =
        this.shipArrowX!.scale.x =
        this.shipArrowY!.scale.x =
          size;
      this.headingArrow!.scale.y =
        this.shipArrowX!.scale.y =
        this.shipArrowY!.scale.y =
          size;
      this.headingArrow!.scale.z =
        this.shipArrowX!.scale.y =
        this.shipArrowY!.scale.y =
          size;
    }
  }

  setScene(scene: THREE.Scene) {
    super.setScene(scene);

    scene.add(this.objectProjectionLine);
    if (this.options.orientation) {
      scene.add(this.headingArrow!);
      scene.add(this.shipArrowX!);
      scene.add(this.shipArrowY!);
    }
  }
}
