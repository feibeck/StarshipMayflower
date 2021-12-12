import { MapData, ObjectInSpace } from '@starship-mayflower/util';

/**
 * Space station model
 */
export class Station extends ObjectInSpace {
  protected _size: { x: number; y: number; z: number };
  protected _model: string;

  constructor(protected _name: string) {
    super();

    this._size = {
      x: 2.793,
      y: 3.0,
      z: 2.793,
    };

    this._model = 'SpaceStation01';
  }

  /**
   * Returns the ships name
   */
  getName(): string {
    return this._name;
  }

  /**
   * Returns data neede for showing the ship on a map
   */
  serializeMapData(): MapData {
    const heading = this.getHeading();

    return {
      name: this.getName(),
      id: this.getId(),
      position: {
        x: this.position.e(1),
        y: this.position.e(2),
        z: this.position.e(3),
      },
      speed: this.getVelocity(),
      heading: {
        x: heading.e(1),
        y: heading.e(2),
        z: heading.e(3),
      },
      orientation: this.orientation.elements,
      size: this._size,
      model: this._model,
    };
  }
}
