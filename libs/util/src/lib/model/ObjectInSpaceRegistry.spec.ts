import { ObjectInSpace } from './ObjectInSpace';
import { ObjectInSpaceRegistry } from './ObjectInSpaceRegistry';
import { Vector } from 'sylvester-es6';

const sortObjects = (o: ObjectInSpace[]) => {
  const comparator = (o1: ObjectInSpace, o2: ObjectInSpace) => {
    const i1 = o1.getId(),
      i2 = o2.getId();

    if (i1 === i2) {
      return 0;
    }

    return i1 < i2 ? -1 : 1;
  };

  return o.sort(comparator);
};

const assertObjectListIdentity = (o1: ObjectInSpace[], o2: ObjectInSpace[]) => {
  o1 = sortObjects(o1);
  o2 = sortObjects(o2);

  expect(o1.length).toEqual(o2.length);

  for (let i = 0; i < o1.length; i++) {
    expect(o1[i].getId()).toEqual(o2[i].getId());
  }
};

describe('Object registry', () => {
  it('registering objects', () => {
    const o1 = new ObjectInSpace().setId('ding1'),
      o2 = new ObjectInSpace().setId('ding2'),
      registry = new ObjectInSpaceRegistry();

    registry.push(o1).push(o2);

    expect(registry.getObject('ding1')).toBe(o1);
    expect(registry.getObject('ding2')).toBe(o2);
    expect(registry.getObject('dingsbums')).toBe(null);
  });

  it('object gets an id', () => {
    const o = new ObjectInSpace();
    const registry = new ObjectInSpaceRegistry();
    registry.push(o);
    expect(o.getId()).not.toBeNull();
  });

  it('determining the surroundings', () => {
    const objects = [
        {
          id: 'a',
          pos: [0, 0, 0],
        },
        {
          id: 'b',
          pos: [0, 1, 0],
        },
        {
          id: 'c',
          pos: [0, 2, 0],
        },
        {
          id: 'd',
          pos: [0, 3, 0],
        },
        {
          id: 'e',
          pos: [0, 4, 0],
        },
      ].map(function (def) {
        return new ObjectInSpace()
          .setId(def.id)
          .setPosition(new Vector(def.pos));
      }),
      registry = new ObjectInSpaceRegistry();

    objects.forEach(function (o) {
      registry.push(o);
    });

    assertObjectListIdentity(
      registry.getSurroundings(new Vector([0, 0, 0]), 1),
      [registry.getObject('a') as ObjectInSpace],
    );

    assertObjectListIdentity(
      registry.getSurroundings(new Vector([0, 0, 0]), 2.5),
      [
        registry.getObject('a') as ObjectInSpace,
        registry.getObject('b') as ObjectInSpace,
        registry.getObject('c') as ObjectInSpace,
      ],
    );

    assertObjectListIdentity(
      registry.getSurroundings(new Vector([0, 2, 0]), 1.5),
      [
        registry.getObject('c') as ObjectInSpace,
        registry.getObject('b') as ObjectInSpace,
        registry.getObject('d') as ObjectInSpace,
      ],
    );

    assertObjectListIdentity(
      registry.getSurroundings(new Vector([0, 2.5, 0]), 0.25),
      [],
    );
  });
});
