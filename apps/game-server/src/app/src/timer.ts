import { Action } from './action/action';
import { moveShips, sendUpdates, getActionManager } from './game';

let gameActionManager;

export function run(actionManager) {
  gameActionManager = actionManager;
  setInterval(tick, 100);
}

function tick() {
  gameActionManager.update();
  moveShips();
  sendUpdates();
}

/**
 * Add action for area
 */
export function addAction(action: Action): boolean {
  return getActionManager().addAction(action);
}

/**
 * Abort action for area
 */
export function abortAction(type: string, id: number) {
  return getActionManager().abortAction(type, id);
}

/**
 * Abort all action for a given id in area
 */
export function abortAllAction(id: string) {
  getActionManager().abortAllAction(id);
}
