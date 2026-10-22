import { describe, it, expect } from 'vitest';
import { WindowStateManager } from '../../src/main/services/window-state';

describe('WindowStateManager & Performance Constraints', () => {
  it('should initialize with safe default bounds', () => {
    const manager = new WindowStateManager();
    const state = manager.getState();

    expect(state.width).toBeGreaterThanOrEqual(860);
    expect(state.height).toBeGreaterThanOrEqual(560);
    expect(typeof state.isMaximized).toBe('boolean');
  });

  it('should enforce minimum window dimensions', () => {
    const manager = new WindowStateManager();
    const state = manager.getState();

    expect(state.width).toBe(1240);
    expect(state.height).toBe(820);
  });
});
