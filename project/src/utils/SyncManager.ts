import { AIContext } from '../context/AIContext';

export class SyncManager {
  private static instance: SyncManager;
  private subscribers: Map<string, Function[]> = new Map();

  private constructor() {
    // Initialize WebSocket or other real-time connection here
    this.initializeSync();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private initializeSync() {
    // Listen for state changes
    window.addEventListener('stateChange', (event: any) => {
      const { type, data } = event.detail;
      this.notifySubscribers(type, data);
    });
  }

  public subscribe(type: string, callback: Function) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)?.push(callback);
  }

  public unsubscribe(type: string, callback: Function) {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifySubscribers(type: string, data: any) {
    const callbacks = this.subscribers.get(type);
    callbacks?.forEach(callback => callback(data));
  }

  public syncState(type: string, data: any) {
    // Dispatch state change event
    window.dispatchEvent(new CustomEvent('stateChange', {
      detail: { type, data }
    }));
  }
} 