import Database from 'better-sqlite3';
import { UserSettings, DEFAULT_SETTINGS } from '../../../shared/types/settings';

export class SettingsRepository {
  constructor(private db: Database.Database) {}

  getSettings(): UserSettings {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: any = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return settings as UserSettings;
  }

  updateSettings(updates: Partial<UserSettings>): UserSettings {
    const updateTx = this.db.transaction(() => {
      const stmt = this.db.prepare(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          stmt.run(key, JSON.stringify(value));
        }
      }
    });

    updateTx();
    return this.getSettings();
  }
}
