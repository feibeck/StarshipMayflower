import { Volume } from './Volume';

/**
 * Describes a bounding sphere.
 */
export class Sphere extends Volume {
  protected radius = 0;

  type = 'SPHERE';

  constructor(radius: number) {
    super();
    this.radius = radius;
  }

  getRadius(): number {
    return this.radius;
  }

  setRadius(radius: number): Sphere {
    this.radius = radius;

    return this;
  }
}
