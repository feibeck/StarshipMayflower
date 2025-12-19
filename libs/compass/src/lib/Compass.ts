import * as paper from 'paper';
import { Point } from 'paper/dist/paper-core';

export class Compass {
  private domElement: HTMLCanvasElement;
  private outerRingSize = 35;
  private radius = 0;
  private currentRoll = 0;
  private currentYaw = 0;

  private currentPitchVector: paper.Point;
  private xzGroup: paper.Group | null = null;
  private xyGroup: paper.Group | null = null;
  private scope: paper.PaperScope;
  private clippingCircle: paper.Path.Circle | null = null;

  constructor() {
    this.domElement = document.createElement('canvas');
    this.domElement.width = 200;
    this.domElement.height = 200;

    this.radius = Math.min(this.domElement.width, this.domElement.height);

    this.scope = new paper.PaperScope();
    this.scope.setup(this.domElement);

    this.createPitchDisplay();
    this.createRollDisplay();
    this.createYawDisplay();

    this.currentPitchVector = new paper.Point(0, 0);

    this.scope.view.update();
  }

  getDomElement() {
    return this.domElement;
  }

  pitch(angle: number) {
    let moveAngle = this.currentRoll + 90;
    if (angle < 0) {
      moveAngle += 180;
    }

    const length = this.degreeToPixel() * angle;

    const moveVector = new paper.Point({
      length: length,
      angle: moveAngle,
    });

    if (this.xyGroup) {
      this.xyGroup.position = this.xyGroup.position.subtract(
        this.currentPitchVector,
      );
      this.xyGroup.position = this.xyGroup.position.add(moveVector);
    }

    this.currentPitchVector = moveVector;

    if (this.xyGroup) {
      this.xyGroup.pivot = this.scope.view.center;
    }
    if (this.clippingCircle) {
      this.clippingCircle.position = this.scope.view.center;
    }
  }

  draw() {
    this.scope.view.update();
  }

  degreeToPixel() {
    const range = this.radius - 2 * this.outerRingSize;
    const pixelPerDegree = range / 90;

    return pixelPerDegree;
  }

  yaw(angle: number) {
    if (!this.xzGroup) {
      return;
    }
    this.xzGroup.pivot = this.scope.view.center;
    this.xzGroup.rotate(-this.currentYaw);
    this.currentYaw = angle + 180;
    this.xzGroup.rotate(this.currentYaw);
  }

  createPitchDisplay() {
    const xyScale = [];

    this.clippingCircle = new paper.Path.Circle({
      center: this.scope.view.center,
      radius: this.radius / 2 - this.outerRingSize,
    });
    xyScale.push(this.clippingCircle);

    const pixelPerDegree = this.degreeToPixel();

    for (let i = -90; i <= 90; i += 10) {
      if (i === 0) {
        continue;
      }
      let color = 'blue';
      if (i > 0) {
        color = 'brown';
      }
      xyScale.push(
        new paper.Path({
          segments: [
            [
              this.scope.view.center.x - 10,
              this.scope.view.center.y + i * pixelPerDegree,
            ],
            [
              this.scope.view.center.x + 10,
              this.scope.view.center.y + i * pixelPerDegree,
            ],
          ],
          strokeColor: color,
        }),
      );

      if (i % 20 === 0) {
        xyScale.push(
          new paper.PointText({
            point: [
              this.scope.view.center.x + 15,
              this.scope.view.center.y + i * pixelPerDegree + 3,
            ],
            content: -i + '°',
            fillColor: color,
            fontSize: 9,
          }),
        );
      }
    }

    xyScale.push(
      new paper.Path({
        segments: [
          [this.scope.view.center.x - 100, this.scope.view.center.y],
          [this.scope.view.center.x + 100, this.scope.view.center.y],
        ],
        strokeColor: '#c0c0c0',
      }),
    );

    this.xyGroup = new paper.Group({
      children: xyScale,
      clipped: true,
    });
  }

  createRollDisplay() {
    const redLine = new paper.Path({
      strokeColor: 'red',
    });
    redLine.add(
      new Point(this.scope.view.center.x - 15, this.scope.view.center.y),
      new Point(this.scope.view.center.x - 5, this.scope.view.center.y),
      new Point(this.scope.view.center.x, this.scope.view.center.y + 5),
      new Point(this.scope.view.center.x + 5, this.scope.view.center.y),
      new Point(this.scope.view.center.x + 15, this.scope.view.center.y),
    );
  }

  createYawDisplay() {
    const r = this.radius / 2 - this.outerRingSize;

    const xzScale = [];

    for (let i = 0; i < 360; i += 10) {
      const a = i * (Math.PI / 180);

      let length = 8;
      if (i === 0 || i === 90 || i === 180 || i === 270) {
        length = 12;
      }

      let color = '#c0c0c0';
      if (i === 0 || i === 90 || i === 180 || i === 270) {
        color = 'red';
      }

      const px1 = this.scope.view.center.x + Math.sin(a) * r;
      const py1 = this.scope.view.center.y + Math.cos(a) * r;
      const px2 = this.scope.view.center.x + Math.sin(a) * (r + length);
      const py2 = this.scope.view.center.y + Math.cos(a) * (r + length);

      xzScale.push(
        new paper.Path({
          segments: [
            [px1, py1],
            [px2, py2],
          ],
          strokeColor: color,
        }),
      );

      if (i % 20 === 0) {
        const text = new paper.PointText({
          content: i + '°',
          fillColor: '#c0c0c0',
          fontFamily: 'Arial',
          fontSize: 9,
        });
        text.rotate(90 - i);

        text.pivot = text.bounds.leftCenter;

        const px3 = this.scope.view.center.x + Math.sin(a) * (r + length + 3);
        const py3 = this.scope.view.center.y + Math.cos(a) * (r + length + 3);

        text.position = new paper.Point(px3, py3);
        xzScale.push(text);
      }
    }

    this.xzGroup = new paper.Group({
      children: xzScale,
    });
  }
}
