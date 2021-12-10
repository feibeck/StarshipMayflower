export interface MapObjectOptions {
  orientation?: boolean;
}

export class MapObjectBase {
  protected options: MapObjectOptions = {};
  protected mesh: any = null;

  constructor(options: MapObjectOptions) {
    this.options = options;
  }

  setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
  }

  scale(size: number) {
    this.mesh.scale.x = size;
    this.mesh.scale.y = size;
    this.mesh.scale.z = size;
  }

  setScene(scene: any) {
    scene.add(this.mesh);
  }
}
