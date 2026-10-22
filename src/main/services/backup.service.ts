import Database from 'better-sqlite3';
import fs from 'fs';
import { dialog, BrowserWindow } from 'electron';
import { BackupData, BackupExportResult, BackupImportOptions, BackupImportResult } from '../../shared/types/backup';
import { BackupDataSchema } from '../../shared/schemas/backup.schema';
import { SettingsRepository } from '../database/repositories/settings.repository';

export class BackupService {
  constructor(private db: Database.Database) {}

  async exportBackup(window?: BrowserWindow): Promise<BackupExportResult> {
    const { canceled, filePath } = await dialog.showSaveDialog(window || undefined as any, {
      title: 'Export Simple Note Backup',
      defaultPath: `simplenote-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    });

    if (canceled || !filePath) {
      return { success: false, cancelled: true };
    }

    try {
      const notes = this.db.prepare('SELECT * FROM notes').all() as any[];
      const notebooks = this.db.prepare('SELECT * FROM notebooks').all() as any[];
      const tags = this.db.prepare('SELECT * FROM tags').all() as any[];
      const note_tags = this.db.prepare('SELECT note_id, tag_id FROM note_tags').all() as any[];
      const settingsRepo = new SettingsRepository(this.db);
      const settings = settingsRepo.getSettings();

      const backup: BackupData = {
        version: '1.0.0',
        exported_at: new Date().toISOString(),
        app: 'Simple Note',
        notes,
        notebooks,
        tags,
        note_tags,
        settings,
      };

      await fs.promises.writeFile(filePath, JSON.stringify(backup, null, 2), 'utf-8');
      return { success: true, filePath };
    } catch (err: any) {
      console.error('Export backup error:', err);
      return { success: false, error: err.message || 'Failed to export backup' };
    }
  }

  async importBackup(options: BackupImportOptions, window?: BrowserWindow): Promise<BackupImportResult> {
    const { canceled, filePaths } = await dialog.showOpenDialog(window || undefined as any, {
      title: 'Import Simple Note Backup',
      properties: ['openFile'],
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, cancelled: true };
    }

    const filePath = filePaths[0];

    try {
      const rawContent = await fs.promises.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(rawContent);

      // Validate schema
      const validation = BackupDataSchema.safeParse(parsed);
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid backup file structure: ${validation.error.issues.map(i => i.message).join(', ')}`,
        };
      }

      const data = validation.data;
      let notesCount = 0;
      let notebooksCount = 0;
      let tagsCount = 0;

      const importTx = this.db.transaction(() => {
        if (options.mode === 'replace') {
          // Clear existing database
          this.db.prepare('DELETE FROM note_tags').run();
          this.db.prepare('DELETE FROM notes').run();
          this.db.prepare('DELETE FROM notebooks').run();
          this.db.prepare('DELETE FROM tags').run();
        }

        // Insert notebooks
        const insertNotebook = this.db.prepare(`
          INSERT INTO notebooks (id, name, parent_id, display_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            parent_id = excluded.parent_id,
            display_order = excluded.display_order,
            updated_at = excluded.updated_at
        `);

        for (const nb of data.notebooks) {
          insertNotebook.run(nb.id, nb.name, nb.parent_id, nb.display_order, nb.created_at, nb.updated_at);
          notebooksCount++;
        }

        // Insert tags
        const insertTag = this.db.prepare(`
          INSERT INTO tags (id, name, color)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            color = excluded.color
        `);

        for (const t of data.tags) {
          insertTag.run(t.id, t.name, t.color);
          tagsCount++;
        }

        // Insert notes
        const insertNote = this.db.prepare(`
          INSERT INTO notes (
            id, title, content_json, content_text, notebook_id,
            is_pinned, is_favorite, created_at, updated_at, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            content_json = excluded.content_json,
            content_text = excluded.content_text,
            notebook_id = excluded.notebook_id,
            is_pinned = excluded.is_pinned,
            is_favorite = excluded.is_favorite,
            updated_at = excluded.updated_at,
            deleted_at = excluded.deleted_at
        `);

        for (const n of data.notes) {
          insertNote.run(
            n.id,
            n.title,
            n.content_json,
            n.content_text,
            n.notebook_id,
            n.is_pinned,
            n.is_favorite,
            n.created_at,
            n.updated_at,
            n.deleted_at
          );
          notesCount++;
        }

        // Insert note_tags
        const insertNoteTag = this.db.prepare(`
          INSERT OR IGNORE INTO note_tags (note_id, tag_id)
          VALUES (?, ?)
        `);

        for (const nt of data.note_tags) {
          insertNoteTag.run(nt.note_id, nt.tag_id);
        }

        // Settings
        if (data.settings) {
          const settingsRepo = new SettingsRepository(this.db);
          settingsRepo.updateSettings(data.settings);
        }
      });

      importTx();

      return {
        success: true,
        notesImported: notesCount,
        notebooksImported: notebooksCount,
        tagsImported: tagsCount,
      };
    } catch (err: any) {
      console.error('Import backup error:', err);
      return { success: false, error: err.message || 'Failed to import backup' };
    }
  }
}
