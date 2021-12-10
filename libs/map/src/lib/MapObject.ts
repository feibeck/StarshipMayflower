import { MapObjectActor } from './MapObjectActor';
import { MapObjectOptions } from './MapObjectBase';
import { MapObjectPicker } from './MapObjectPicker';

export class MapObject {
  private _id;
  private actor;
  private picker;

  constructor(color: string, id: number, options: MapObjectOptions) {
    this._id = id;
    this.actor = new MapObjectActor(color, options);
    this.picker = new MapObjectPicker(id, options);
  }

  setPosition(x: number, y: number, z: number) {
    this.actor.setPosition(x, y, z);
    this.picker.setPosition(x, y, z);
  }

  scale(scale: number) {
    this.actor.scale(scale);
    this.picker.scale(scale);
  }

  setHeading(x: number, y: number, z: number) {
    this.actor.setHeading(x, y, z);
  }

  setShipX(x: number, y: number, z: number) {
    this.actor.setShipX(x, y, z);
  }

  setShipY(x: number, y: number, z: number) {
    this.actor.setShipY(x, y, z);
  }

  setRenderScene(scene: THREE.Scene) {
    this.actor.setScene(scene);
  }

  setPickingScene(scene: THREE.Scene) {
    this.picker.setScene(scene);
  }

  getId() {
    return this._id;
  }
}
