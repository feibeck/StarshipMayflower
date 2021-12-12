import { Action } from './action';
import { ActionQueue } from './ActionQueue';

/**
 * ActionManager manages actions
 */
export class ActionManager {
  protected actionMap: Record<string, Record<number, Action>> = {};
  protected actionQueue: ActionQueue;

  constructor(limit = 10000) {
    this.actionQueue = new ActionQueue(limit);
  }

  /**
   * Add action
   */
  addAction(action: Action): boolean {
    if (action.singleton) {
      this.abortAction(action.type, action.id);
    }
    if (!this.actionMap[action.type]) {
      this.actionMap[action.type] = {};
    }
    this.actionMap[action.type][action.id] = action;
    return this.actionQueue.push(action);
  }

  /**
   * Abort an action, the action will be canceled and not excuted
   */
  abortAction(type: string, id: number) {
    if (!this.actionMap[type] || !this.actionMap[type][id]) {
      return;
    }
    this.actionMap[type][id].aborted = true;
    delete this.actionMap[type][id];
  }

  /**
   * Abort all action by given id, it will find all action type
   */
  abortAllAction(id: string) {
    for (const type in this.actionMap) {
      if (this.actionMap[type][id]) {
        this.actionMap[type][id].aborted = true;
      }
    }
  }

  /**
   * Update all actions
   */
  update() {
    const length = this.actionQueue.length();

    for (let i = 0; i < length; i++) {
      const action = this.actionQueue.pop();

      if (action.aborted) {
        continue;
      }

      action.update();
      if (!action.finished) {
        this.actionQueue.push(action);
      } else {
        delete this.actionMap[action.type][action.id];
      }
    }
  }
}
