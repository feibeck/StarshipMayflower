import { Action } from './Action';
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
   * Abort an action, the action will be canceled and not executed
   */
  abortAction(type: string, id: number) {
    if (!this.actionMap[type] || !this.actionMap[type][id]) {
      return;
    }
    this.actionMap[type][id].aborted = true;
    delete this.actionMap[type][id];
  }

  /**
   * Abort all actions by given id, it will find all action types
   */
  abortAllAction(id: string) {
    for (const type in this.actionMap) {
      const numId = parseInt(id, 10);
      if (this.actionMap[type][numId]) {
        this.actionMap[type][numId].aborted = true;
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

      if (!action || action.aborted) {
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
