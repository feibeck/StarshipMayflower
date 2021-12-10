import { MapObjectBase, MapObjectOptions } from './MapObjectBase';
import * as THREE from 'three';

export class MapObjectPicker extends MapObjectBase {
  constructor(id: number, options: MapObjectOptions) {
    super(options);
    if (!this.options.orientation) {
      this.options.orientation = false;
    }

    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 5, 5),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(id) })
    );
  }
}
