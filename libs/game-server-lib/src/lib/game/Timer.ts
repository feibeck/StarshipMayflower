import { ActionManager } from '../actions/ActionManager';

/**
 * Game timer that runs the game loop every 100ms
 */
export class Timer {
  private interval: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private actionManager: ActionManager,
    private moveShips: () => void,
    private sendUpdates: () => void
  ) {}

  /**
   * Start the game loop
   */
  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.interval = setInterval(() => this.tick(), 100);
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.running = false;
  }

  /**
   * Game tick - runs every 100ms
   */
  private tick() {
    this.actionManager.update();
    this.moveShips();
    this.sendUpdates();
  }

  /**
   * Check if the timer is running
   */
  isRunning(): boolean {
    return this.running;
  }
}
