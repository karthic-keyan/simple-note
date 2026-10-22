import Database from 'better-sqlite3';

export interface Migration {
  id: number;
  name: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    id: 1,
    name: '001_initial_schema',
    up: (db: Database.Database) => {
      // 1. Notebooks table
      db.exec(`
        CREATE TABLE IF NOT EXISTS notebooks (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          parent_id TEXT NULL,
          display_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (parent_id) REFERENCES notebooks(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_notebooks_parent ON notebooks(parent_id);
      `);

      // 2. Notes table
      db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content_json TEXT NOT NULL,
          content_text TEXT NOT NULL,
          notebook_id TEXT NULL,
          is_pinned INTEGER NOT NULL DEFAULT 0,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT NULL,
          FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_notes_notebook ON notes(notebook_id);
        CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(deleted_at);
        CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned);
        CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite);
      `);

      // 3. Tags table
      db.exec(`
        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL DEFAULT '#3b82f6'
        );
      `);

      // 4. Note-Tags junction table
      db.exec(`
        CREATE TABLE IF NOT EXISTS note_tags (
          note_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          PRIMARY KEY (note_id, tag_id),
          FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);
        CREATE INDEX IF NOT EXISTS idx_note_tags_note ON note_tags(note_id);
      `);

      // 5. Settings table
      db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // 6. Full-text search FTS5 virtual table
      db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
          id UNINDEXED,
          title,
          content_text,
          tokenize = 'unicode61 remove_diacritics 2'
        );
      `);

      // 7. FTS automatic synchronization triggers
      db.exec(`
        -- Trigger on insert
        CREATE TRIGGER IF NOT EXISTS trg_notes_fts_insert AFTER INSERT ON notes
        BEGIN
          INSERT INTO notes_fts(id, title, content_text)
          VALUES (new.id, new.title, new.content_text);
        END;

        -- Trigger on delete
        CREATE TRIGGER IF NOT EXISTS trg_notes_fts_delete AFTER DELETE ON notes
        BEGIN
          DELETE FROM notes_fts WHERE id = old.id;
        END;

        -- Trigger on update
        CREATE TRIGGER IF NOT EXISTS trg_notes_fts_update AFTER UPDATE ON notes
        BEGIN
          DELETE FROM notes_fts WHERE id = old.id;
          INSERT INTO notes_fts(id, title, content_text)
          VALUES (new.id, new.title, new.content_text);
        END;
      `);
    },
  },
  {
    id: 2,
    name: '002_performance_composite_indices',
    up: (db: Database.Database) => {
      // High performance composite indices for note listing and notebook filtering
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_notes_list_composite ON notes(deleted_at, is_pinned DESC, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notes_notebook_composite ON notes(notebook_id, deleted_at, is_pinned DESC, updated_at DESC);
      `);
    },
  },
];

export function runMigrations(db: Database.Database): void {
  // Ensure schema_migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedMigrations = db.prepare('SELECT id FROM schema_migrations').all() as { id: number }[];
  const appliedIds = new Set(appliedMigrations.map(m => m.id));

  const insertMigration = db.prepare(
    'INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)'
  );

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      const runTransaction = db.transaction(() => {
        migration.up(db);
        insertMigration.run(migration.id, migration.name, new Date().toISOString());
      });
      runTransaction();
    }
  }
}
