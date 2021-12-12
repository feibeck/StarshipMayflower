import { MapData, ObjectInSpace } from '@starship-mayflower/util';

/**
 * Space station model
 */
export class Planet extends ObjectInSpace {
  constructor(private name: string, private size: any, private model: any) {
    super();
  }

  /**
   * Returns the planets name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Returns data neede for showing the planet on a map
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
      size: this.size,
      model: this.model,
    };
  }
}
