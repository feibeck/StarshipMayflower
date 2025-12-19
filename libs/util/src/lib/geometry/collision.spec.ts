import { Vector } from 'sylvester-es6';

import { ObjectInSpace } from '../model/ObjectInSpace';
import { Point } from '../model/volume/Point';
import { Sphere } from '../model/volume/Sphere';

import { collides, collidesWithLine } from './collision';

describe('Collision detection', () => {
  describe('Collisions between objects', () => {
    it('Points never collide', () => {
      const o1 = new ObjectInSpace()
        .setVolume(new Point())
        .setPosition(new Vector([0, 0, 0]));
      const o2 = new ObjectInSpace()
        .setVolume(new Point())
        .setPosition(new Vector([0, 0, 0]));

      expect(collides(o1, o2)).toBe(false);

      o1.setPosition(new Vector([1, 1, 2]));

      expect(collides(o1, o2)).toBe(false);
    });

    it('point - sphere, point inside sphere', () => {
      const o1 = new ObjectInSpace()
        .setVolume(new Point())
        .setPosition(new Vector([0, 0, 0]));
      const o2 = new ObjectInSpace()
        .setVolume(new Sphere(1))
        .setPosition(new Vector([0, 0, 0]));

      expect(collides(o1, o2)).toBe(true);

      o1.setPosition(new Vector([0.5, 0, 0]));

      expect(collides(o1, o2)).toBe(true);
    });

    it('point - sphere, point outside sphere', () => {
      const o1 = new ObjectInSpace()
        .setVolume(new Point())
        .setPosition(new Vector([1, 1, 0]));
      const o2 = new ObjectInSpace()
        .setVolume(new Sphere(1))
        .setPosition(new Vector([0, 0, 0]));

      expect(collides(o1, o2)).toBe(false);
    });

    it('sphere - sphere, no intersection', () => {
      const o1 = new ObjectInSpace()
          .setVolume(new Sphere(1))
          .setPosition(new Vector([2, 2, 2])),
        o2 = new ObjectInSpace()
          .setVolume(new Sphere(1))
          .setPosition(new Vector([0, 0, 0]));

      expect(collides(o1, o2)).toBe(false);
    });

    it('sphere - sphere, intersection', () => {
      const o1 = new ObjectInSpace()
        .setVolume(new Sphere(1))
        .setPosition(new Vector([2, 2, 2]));
      const o2 = new ObjectInSpace()
        .setVolume(new Sphere(5))
        .setPosition(new Vector([1, 1, 1]));

      expect(collides(o1, o2)).toBe(true);
    });
  });

  describe('Collisions with lines', () => {
    it('Points should never collide with lines', () => {
      const o = new ObjectInSpace()
        .setVolume(new Point())
        .setPosition(new Vector([0, 0, 0]));

      expect(
        collidesWithLine(o, new Vector([1, 0, 0]), new Vector([0, 0, 0])),
      ).toBe(false);

      expect(
        collidesWithLine(o, new Vector([1, 0, 0]), new Vector([0, 1, 0])),
      ).toBe(false);
    });

    it('point - sphere, no intersection', () => {
      const collisionTest = (delta: Vector) => {
        const sqrt2 = Math.sqrt(2),
          o = new ObjectInSpace()
            .setVolume(new Sphere(1))
            .setPosition(new Vector([0, 0, 0]).add(delta));

        expect(
          collidesWithLine(
            o,
            new Vector([2, 0, 0]).add(delta),
            new Vector([0, 1, 0]),
          ),
        ).toBe(false);

        expect(
          collidesWithLine(
            o,
            new Vector([2, 0, 0]).add(delta),
            new Vector([1 / sqrt2, 1 / sqrt2, 0]),
          ),
        ).toBe(false);
      };

      collisionTest(new Vector([0, 0, 0]));
      collisionTest(new Vector([0, 0, 1]));
      collisionTest(new Vector([0, 1, 0]));
      collisionTest(new Vector([1, 0, 0]));
    });

    test('point - sphere, intersection', () => {
      const collisionTest = (delta: Vector) => {
        const sqrt2 = Math.sqrt(2),
          o = new ObjectInSpace()
            .setVolume(new Sphere(1))
            .setPosition(new Vector([0, 0, 0]).add(delta));

        expect(
          collidesWithLine(
            o,
            new Vector([0.5, 0, 0]).add(delta),
            new Vector([0, 1, 0]),
          ),
        ).toBe(true);

        expect(
          collidesWithLine(
            o,
            new Vector([0.5, 0, 0]).add(delta),
            new Vector([1 / sqrt2, 0, 1 / sqrt2]),
          ),
        ).toBe(true);
      };

      collisionTest(new Vector([0, 0, 0]));
      collisionTest(new Vector([0, 0, 1]));
      collisionTest(new Vector([0, 1, 0]));
      collisionTest(new Vector([1, 0, 0]));
    });
  });
});
