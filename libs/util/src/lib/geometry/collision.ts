/* eslint-disable @typescript-eslint/no-unused-vars */
import { Vector } from 'sylvester-es6';

import { ObjectInSpace, Sphere } from '../model';

/**
 * Check two objects for collision.
 */
export function collides(o1: ObjectInSpace, o2: ObjectInSpace): boolean {
  let temp;

  if (o2.getVolume().type < o1.getVolume().type) {
    temp = o1;
    o1 = o2;
    o2 = temp;
  }

  switch (o1.getVolume().type) {
    case 'BOX':
      switch (o2.getVolume().type) {
        case 'BOX':
          return collidesBoxBox(o1, o2);

        case 'POINT':
          return collidesBoxPoint(o1, o2);

        case 'SPHERE':
          return collidesBoxSphere(o1, o2);
      }
      break;

    case 'POINT':
      switch (o2.getVolume().type) {
        case 'BOX':
          return collidesBoxPoint(o2, o1);
        case 'POINT':
          return collidesPointPoint(o1, o2);
        case 'SPHERE':
          return collidesPointSphere(o1, o2);
      }
      break;

    case 'SPHERE':
      switch (o2.getVolume().type) {
        case 'BOX':
          return collidesBoxSphere(o2, o1);
        case 'POINT':
          return collidesPointSphere(o2, o1);
        case 'SPHERE':
          return collidesSphereSphere(o1, o2);
      }
      break;
  }

  return false;
}

/**
 * Check for intersection between an object and a straight line.
 *
 * base: Straight line base point
 * direction: Straigt line direction vector (must be normalized)
 */
export function collidesWithLine(
  o: ObjectInSpace,
  base: Vector,
  direction: Vector
): boolean {
  switch (o.getVolume().type) {
    case 'POINT':
      return false;

    case 'SPHERE':
      return sphereCollidesWithLine(o, base, direction);

    case 'BOX':
      return boxCollidesWithLine(o, base, direction);
  }

  return false;
}

function collidesBoxBox(_box1: ObjectInSpace, _box2: ObjectInSpace): boolean {
  throw new Error('box-box collisions not implemented');
}

function collidesBoxPoint(_box: ObjectInSpace, _point: ObjectInSpace): boolean {
  throw new Error('box-point collisions not implemented');
}

function collidesBoxSphere(
  _box: ObjectInSpace,
  _sphere: ObjectInSpace
): boolean {
  throw new Error('box-sphere collisions not implemented');
}

function collidesPointPoint(_p1: ObjectInSpace, _p2: ObjectInSpace): boolean {
  return false;
}

function collidesPointSphere(point: ObjectInSpace, sphere: ObjectInSpace) {
  return (
    point.getPosition().subtract(sphere.getPosition()).modulus() <
    (sphere.getVolume() as Sphere).getRadius()
  );
}

function collidesSphereSphere(sphere1: ObjectInSpace, sphere2: ObjectInSpace) {
  return (
    sphere1.getPosition().subtract(sphere2.getPosition()).modulus() <
    (sphere1.getVolume() as Sphere).getRadius() +
      (sphere2.getVolume() as Sphere).getRadius()
  );
}

function sphereCollidesWithLine(
  sphere: ObjectInSpace,
  base: Vector,
  direction: Vector
) {
  const pos = sphere.getPosition(),
    d = pos.subtract(base),
    dproj = d.dot(direction),
    mod2 = d.dot(d) - dproj * dproj;

  return mod2 > 0
    ? Math.sqrt(mod2) < (sphere.getVolume() as Sphere).getRadius()
    : true;
}

function boxCollidesWithLine(
  _sphere: ObjectInSpace,
  _base: Vector,
  _direction: Vector
): boolean {
  throw new Error('collisions line - box not implemented');
}
