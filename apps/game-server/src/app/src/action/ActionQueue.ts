import { Action } from './action';

export class ActionQueue {
  _store: Action[] = [];

  constructor(private limit: number = 1000) {}

  push(val: Action): boolean {
    if (this._store.length <= this.limit) {
      this._store.push(val);
      return true;
    }
    return false;
  }

  pop(): Action | undefined {
    return this._store.shift();
  }

  length(): number {
    return this._store.length;
  }
}
