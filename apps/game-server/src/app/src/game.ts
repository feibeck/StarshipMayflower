import { ObjectInSpaceRegistry, Ship } from '@starship-mayflower/util';
import { ActionManager } from './action/actionManager';
import { Channel } from './channel';
import { Planet } from './models/Planet';
import { Station } from './models/Station';
import { getRandomPosition, AU } from './world';
import { ShipRegistry } from './world/ShipRegistry';
import { Vector } from 'sylvester-es6';
import { run } from './timer';
import { moveShip as moveShipPhysics } from './physics';

const channel = new Channel();

let running = false;

const shipRegistry = new ShipRegistry();
const objectRegistry = new ObjectInSpaceRegistry();
const actionManager = new ActionManager();

const spaceStationOne = new Station('Space Station One');
spaceStationOne.setPosition(getRandomPosition());
objectRegistry.addObject(spaceStationOne);

const spaceStationTwo = new Station('Space Station Two');
spaceStationTwo.setPosition(getRandomPosition());
objectRegistry.addObject(spaceStationTwo);

const sun = new Planet(
  'Sun',
  {
    x: 1392684,
    y: 1392684,
    z: 1392684,
  },
  'Sun'
);
sun.setPosition(new Vector([AU, AU, AU]));
objectRegistry.addObject(sun);

export function getShipRegistry() {
  return shipRegistry;
}

export function start() {
  if (!running) {
    run(actionManager);
    running = true;
  }
}

export function isRunning() {
  return running;
}

export function getActionManager() {
  return actionManager;
}

export function moveShips() {
  shipRegistry.getAllShips().forEach((ship) => {
    moveShip(ship);
  });
}

export function getObjectRegistry() {
  return objectRegistry;
}

export function moveShip(ship: Ship) {
  const lastMove = ship.getLastMove();
  const seconds = (Date.now() - lastMove) / 1000;

  moveShipPhysics(ship, seconds);
  ship.setLastMove(Date.now());

  channel.pushToShip(ship, 'ShipUpdate', ship.serialize());
}

export function sendUpdates() {
  shipRegistry.getAllShips().forEach((ship) => {
    sendKnownWorld(ship);
  });

  const ships = [];
  shipRegistry.getAllShips().forEach((othership) => {
    ships.push(othership.serializeMapData());
  });

  objectRegistry.getAllObjects().forEach((spaceObject) => {
    ships.push(spaceObject.serializeMapData());
  });

  channel.pushToGlobal('GlobalUpdate', { ships: ships });
}

export function sendKnownWorld(ship: Ship) {
  const ships = [];
  shipRegistry.getAllShips().forEach((othership) => {
    if (ship != othership) {
      ships.push(othership.serializeMapData());
    }
  });

  objectRegistry.getAllObjects().forEach((spaceObject) => {
    ships.push(spaceObject.serializeMapData());
  });

  channel.pushToShip(ship, 'WorldUpdate', {
    ship: ship.serialize(),
    ships: ships,
  });
}
