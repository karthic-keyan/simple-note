import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';

export type IpcHandlerFn = (event: IpcMainInvokeEvent, ...args: any[]) => any;

/**
 * Registers an IPC handler with security verification:
 * 1. Verifies that the sender webContents matches the trusted main window.
 * 2. Ensures the call originates from the top-level frame (no malicious subframe/iframe).
 * 3. Safely removes any existing handler before registering to prevent handler leaks.
 */
export function registerSecureHandler(
  channel: string,
  getMainWindow: () => BrowserWindow | null,
  handler: IpcHandlerFn
): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, async (event, ...args) => {
    const win = getMainWindow();
    if (!win || win.isDestroyed() || event.sender !== win.webContents) {
      throw new Error(`[Security] Blocked unauthorized IPC call to channel '${channel}'`);
    }
    if (event.senderFrame && event.senderFrame.parent !== null) {
      throw new Error(`[Security] Blocked unauthorized subframe IPC call to channel '${channel}'`);
    }
    return handler(event, ...args);
  });
}
