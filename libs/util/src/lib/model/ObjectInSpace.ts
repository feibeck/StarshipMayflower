import { Point } from './volume/Point';
import { Matrix, Vector } from 'sylvester-es6';
import { Sphere } from './volume/Sphere';
import { Box } from './volume/Box';

export interface MapData {
  name?: string;
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  speed: number;
  heading: {
    x: number;
    y: number;
    z: number;
  };
  orientation: number[][];
  velocity?: number;
  warpLevel?: number;
  warp?: boolean;
  warpSpeed?: number;
  size?: Size;
  model?: string;
}

export interface Size {
  x: number;
  y: number;
  z: number;
}

/**
 * A thing that exists in space and time.
 */
export class ObjectInSpace {
  protected id = '';
  protected position = new Vector([0, 0, 0]);
  protected velocity = 0;
  protected orientation = Matrix.I(3);
  protected INITIAL_HEADING = new Vector([0, 0, 1]);
  protected volume: Point | Sphere | Box = new Point();

  protected warpLevel = 0;
  protected warpSpeed = 1;
  protected warp = false;

  /**
   * Set the objects id
   */
  setId(id: string): ObjectInSpace {
    this.id = id;
    return this;
  }

  /**
   * Returns the objects id
   */
  getId(): string {
    return this.id;
  }

  /**
   * Sets the objects velocity vector
   */
  setVelocity(velocity: number): ObjectInSpace {
    this.velocity = velocity;
    return this;
  }

  /**
   * Returns the objects velocity vector
   */
  getVelocity(): number {
    return this.velocity;
  }

  /**
   * Returns the heading vector of the object
   */
  getHeading() {
    return this.orientation.multiply(this.INITIAL_HEADING);
  }

  /**
   * Set orientation.
   */
  setOrientation(orientation: Matrix): ObjectInSpace {
    this.orientation = orientation;
    return this;
  }

  /**
   * Get orientation
   */
  getOrientation() {
    return this.orientation;
  }

  /**
   * Sets the position of the object
   */
  setPosition(position: Vector): ObjectInSpace {
    this.position = position;
    return this;
  }

  /**
   * Returns the position of the object
   */
  getPosition() {
    return this.position;
  }

  setVolume(volume: Point | Box | Sphere): ObjectInSpace {
    this.volume = volume;
    return this;
  }

  getVolume(): Point | Box | Sphere {
    return this.volume;
  }

  getRealVelocity() {
    if (!this.warp) {
      return this.velocity;
    }
    return this.warpSpeed * 299792.458;
  }

  /**
   * Returns data need for showing the object on a map
   */
  serializeMapData(): MapData {
    const heading = this.getHeading();

    return {
      id: this.getId(),
      position: {
        x: this.position.e(1),
        y: this.position.e(2),
        z: this.position.e(3),
      },
      speed: this.getRealVelocity(),
      orientation: this.orientation.elements,
      heading: {
        x: heading.e(1),
        y: heading.e(2),
        z: heading.e(3),
      },
      velocity: this.velocity,
    };
  }

  fromJson(json: MapData) {
    this.setOrientation(new Matrix(json.orientation));
    this.setPosition(
      new Vector([json.position.x, json.position.y, json.position.z])
    );
    this.setVelocity(json.velocity || 0);
  }
}
