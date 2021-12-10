import { Vector } from 'sylvester-es6';
import { Ship } from './Ship';

describe('Ship model', () => {
  it('Constructor', () => {
    const ship = new Ship('HMS Foo');
    expect(ship.getName()).toEqual('HMS Foo');
  });

  it('Starts at position 0', () => {
    const ship = new Ship('HMS Foo');
    const pos = new Vector([0, 0, 0]);
    expect(ship.getPosition().x).toEqual(pos.x);
    //expect(ship.getPosition().y).toEqual(pos.y);
    //expect(ship.getPosition().z).toEqual(pos.z);
  });

  it('Starts without speed', () => {
    const ship = new Ship('HMS Foo');
    expect(ship.getVelocity()).toEqual(0);
  });

  it('Has a default heading', () => {
    const ship = new Ship('HMS Foo');
    const heading = new Vector([0, 0, 1]);
    expect(ship.getHeading().x).toEqual(heading.x);
    //expect(ship.getHeading().y).toEqual(heading.y);
    //expect(ship.getHeading().z).toEqual(heading.z);
  });

  it('ID property', () => {
    const ship = new Ship('HMS Foo');
    ship.setId('ship23');
    expect(ship.getId()).toEqual('ship23');
  });

  it('Velocity property', () => {
    const ship = new Ship('HMS Foo');
    ship.setVelocity(23);
    expect(ship.getVelocity()).toEqual(23);
  });

  it('Position property', () => {
    const ship = new Ship('HMS Foo');
    const point = new Vector([0, 0, 0]);
    ship.setPosition(point);
    expect(ship.getPosition()).toBe(point);
  });

  it('LastMove property', () => {
    const ship = new Ship('HMS Foo');
    ship.setLastMove(18);
    expect(ship.getLastMove()).toEqual(18);
  });

  it('Creator property', () => {
    const ship = new Ship('HMS Foo');
    ship.setCreator('foo');
    expect(ship.getCreator()).toEqual('foo');
  });
});
