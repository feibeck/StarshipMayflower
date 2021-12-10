import { MapObject } from './MapObject';

export class MapObjectTable {
  private _hashtable: Record<number, MapObject> = {};
  private _id = 1;

  getId(): number {
    return this._id++;
  }

  set(id: number, object: MapObject) {
    this._hashtable[id] = object;
    return this;
  }

  add(object: MapObject) {
    const id = this.getId();

    this.set(id, object);
    return id;
  }

  get(id: number) {
    return this._hashtable[id];
  }
}
