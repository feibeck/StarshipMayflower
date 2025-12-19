import { ObjectInSpace } from '@starship-mayflower/util';

/**
 * Registry for space objects (planets, stations, etc.)
 */
export class ObjectRegistry {
  private objects: Record<string, ObjectInSpace> = {};
  private idCounter = 1;

  /**
   * Create a new unique ID
   */
  createId(): string {
    return String(this.idCounter++);
  }

  /**
   * Add an object to the registry
   */
  addObject(object: ObjectInSpace): ObjectInSpace {
    if (!object.getId()) {
      object.setId(this.createId());
    }
    this.objects[object.getId()] = object;
    return object;
  }

  /**
   * Get an object by ID
   */
  getObject(id: string): ObjectInSpace | undefined {
    return this.objects[id];
  }

  /**
   * Get all objects
   */
  getAllObjects(): ObjectInSpace[] {
    return Object.values(this.objects);
  }

  /**
   * Remove an object
   */
  removeObject(id: string) {
    delete this.objects[id];
  }
}
