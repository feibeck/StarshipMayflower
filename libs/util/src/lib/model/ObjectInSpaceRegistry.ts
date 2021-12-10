import { ObjectInSpace } from './ObjectInSpace';
import { EventEmitter } from 'events';
import { Vector } from 'sylvester-es6';

let INDEX = 1;
function newIndex(): string {
  return `${INDEX++}`;
}

export class ObjectInSpaceRegistry extends EventEmitter {
  protected _dirty = true;
  protected _hashtable: Record<string, ObjectInSpace> = {};
  protected _list: ObjectInSpace[] = [];

  push(object: ObjectInSpace): ObjectInSpaceRegistry {
    if (!object.getId()) {
      object.setId(this.createId());
    }
    this._hashtable[object.getId()] = object;
    this._dirty = true;
    this.emit('update');

    return this;
  }

  /*
   * Backwards compatibility
   * @deprecated
   */
  addObject(object: ObjectInSpace): ObjectInSpaceRegistry {
    return this.push(object);
  }

  updateObject(object: ObjectInSpace) {
    if (!this._hashtable[object.getId()]) {
      this.push(object);
    }
    this._hashtable[object.getId()] = object;
    this._dirty = true;
    this.emit('update');
  }

  getAllObjects() {
    return this._getList();
  }

  getObject(id: string): ObjectInSpace | null {
    if (!this._hashtable[id]) {
      return null;
    }
    return this._hashtable[id];
  }

  /**
   * Determine all objects whose positions lie within a sphere of given radius
   * around a given origin.
   */
  getSurroundings(origin: Vector, radius: number): ObjectInSpace[] {
    const list = this._getList();
    const surroundings: ObjectInSpace[] = [];

    list.forEach((o: ObjectInSpace) => {
      if (origin.subtract(o.getPosition()).modulus() < radius) {
        surroundings.push(o);
      }
    });

    return surroundings;
  }

  createId(): string {
    return newIndex();
  }

  _getList() {
    if (this._dirty) {
      this._list = [];
      Object.keys(this._hashtable).forEach((id: string) => {
        this._list.push(this._hashtable[id]);
      });

      this._dirty = false;
    }

    return this._list;
  }
}
