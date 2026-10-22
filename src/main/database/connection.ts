import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { runMigrations } from './migrations';
import { createDatabase } from './sqlite';

let dbInstance: Database.Database | null = null;

export function getDatabasePath(): string {
  let dbDir: string;
  try {
    dbDir = app ? app.getPath('userData') : path.join(process.cwd(), '.data');
  } catch {
    dbDir = path.join(process.cwd(), '.data');
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const newPath = path.join(dbDir, 'simplenote.db');
  const legacyPath = path.join(dbDir, 'upnote.db');
  if (!fs.existsSync(newPath) && fs.existsSync(legacyPath)) {
    try {
      fs.renameSync(legacyPath, newPath);
    } catch {}
  }

  return newPath;
}

export function initDatabase(customPath?: string): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = customPath || getDatabasePath();
  const db = createDatabase(dbPath);

  // High performance and safety settings
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('temp_store = MEMORY');
  db.pragma('cache_size = -64000'); // 64MB memory page cache
  db.pragma('mmap_size = 268435456'); // 256MB memory map for read speed

  // Execute database migrations
  runMigrations(db);

  dbInstance = db;
  return dbInstance;
}

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
