/**
 * Arrow Escape — Hardware Back Button Navigation Manager
 * Handles Android physical back button and gestures:
 * 1. Closes open modals.
 * 2. Returns from GameScreen to HomeScreen.
 * 3. Requires double back tap on HomeScreen within 2s to exit.
 */

import { App as CapApp } from '@capacitor/app';

type BackHandler = () => boolean;

class BackButtonManager {
  private handlers: BackHandler[] = [];
  private lastBackPressed: number = 0;
  private onDoubleBackWarning?: () => void;

  constructor() {
    this.init();
  }

  private init() {
    try {
      CapApp.addListener('backButton', () => {
        this.handleBack();
      });
    } catch {
      // Ignore if not running in Capacitor native environment
    }
  }

  public registerWarningCallback(cb: () => void): () => void {
    this.onDoubleBackWarning = cb;
    return () => {
      this.onDoubleBackWarning = undefined;
    };
  }

  /**
   * Register a contextual handler (e.g. for an open modal or game screen).
   * Return true from handler to indicate the event was handled and stop bubbling.
   */
  public pushHandler(handler: BackHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  public handleBack(): void {
    // 1. Dispatch to registered sub-handlers in LIFO order
    for (let i = this.handlers.length - 1; i >= 0; i--) {
      const handled = this.handlers[i]();
      if (handled) {
        return;
      }
    }

    // 2. Root Home Screen: Require double-back press to exit
    const now = Date.now();
    if (now - this.lastBackPressed < 2000) {
      try {
        CapApp.exitApp();
      } catch {
        // web fallback
      }
    } else {
      this.lastBackPressed = now;
      if (this.onDoubleBackWarning) {
        this.onDoubleBackWarning();
      }
    }
  }
}

export const backButtonManager = new BackButtonManager();
