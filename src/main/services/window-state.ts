import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const DEFAULT_STATE: WindowState = {
  width: 1240,
  height: 820,
  isMaximized: false,
};

export class WindowStateManager {
  private stateFilePath: string;
  private state: WindowState;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor() {
    let userData = '';
    try {
      userData = app.getPath('userData');
    } catch {
      userData = process.cwd();
    }
    this.stateFilePath = path.join(userData, 'window-state.json');
    this.state = this.loadState();
  }

  private loadState(): WindowState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
          // Verify saved coordinates exist on currently connected displays
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            const displays = screen.getAllDisplays();
            const isVisible = displays.some((display) => {
              const b = display.bounds;
              return (
                parsed.x >= b.x - 20 &&
                parsed.y >= b.y - 20 &&
                parsed.x < b.x + b.width &&
                parsed.y < b.y + b.height
              );
            });
            if (!isVisible) {
              delete parsed.x;
              delete parsed.y;
            }
          }
          return {
            width: Math.max(860, parsed.width),
            height: Math.max(560, parsed.height),
            x: parsed.x,
            y: parsed.y,
            isMaximized: Boolean(parsed.isMaximized),
          };
        }
      }
    } catch {
      // Fall back to default
    }
    return { ...DEFAULT_STATE };
  }

  public getState(): WindowState {
    return this.state;
  }

  public track(window: BrowserWindow): void {
    const queueSave = () => {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(async () => {
        try {
          if (window.isDestroyed()) return;
          const isMax = window.isMaximized();
          if (!isMax && !window.isMinimized()) {
            const bounds = window.getBounds();
            this.state = {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              isMaximized: false,
            };
          } else {
            this.state.isMaximized = isMax;
          }
          await fs.promises.writeFile(this.stateFilePath, JSON.stringify(this.state), 'utf-8');
        } catch {
          // ignore write errors during shutdown
        }
      }, 500);
    };

    window.on('resize', queueSave);
    window.on('move', queueSave);
    window.on('close', () => {
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
      }
      try {
        if (!window.isDestroyed()) {
          const isMax = window.isMaximized();
          if (!isMax && !window.isMinimized()) {
            const bounds = window.getBounds();
            this.state = {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              isMaximized: false,
            };
          } else {
            this.state.isMaximized = isMax;
          }
          fs.writeFileSync(this.stateFilePath, JSON.stringify(this.state), 'utf-8');
        }
      } catch {
        // ignore
      }
    });
  }
}
