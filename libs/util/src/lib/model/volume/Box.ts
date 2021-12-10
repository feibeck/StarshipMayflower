import { Vector } from 'sylvester-es6';
import { Volume } from './Volume';

/**
 * Describes a bounding box.
 */
export class Box extends Volume {
  /*
   * Corner vector, relative to object position.
   */
  protected extend: Vector;

  type = 'BOX';

  constructor(extend: Vector) {
    super();
    this.extend = extend;
  }

  getExtend(): Vector {
    return this.extend;
  }

  setExtend(extend: Vector) {
    this.extend = extend;
  }
}
