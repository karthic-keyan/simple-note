import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDatabase } from '../../src/main/database/sqlite';
import { runMigrations } from '../../src/main/database/migrations';
import { NotebookRepository } from '../../src/main/database/repositories/notebook.repository';
import { NoteRepository } from '../../src/main/database/repositories/note.repository';

describe('NotebookRepository', () => {
  let db: Database.Database;
  let nbRepo: NotebookRepository;
  let noteRepo: NoteRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    nbRepo = new NotebookRepository(db);
    noteRepo = new NoteRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should create root and nested notebooks', () => {
    const parent = nbRepo.create({ name: 'Work' });
    expect(parent.id).toBeDefined();
    expect(parent.parent_id).toBeNull();

    const child = nbRepo.create({ name: 'Projects', parent_id: parent.id });
    expect(child.parent_id).toBe(parent.id);

    const all = nbRepo.getAll();
    expect(all.length).toBe(2);
  });

  it('should prevent self-parenting loop', () => {
    const nb = nbRepo.create({ name: 'Test' });
    expect(() => {
      nbRepo.update({ id: nb.id, parent_id: nb.id });
    }).toThrow();
  });

  it('should safely delete notebook with strategy keep_notes_unassigned', () => {
    const nb = nbRepo.create({ name: 'Temporary Notebook' });
    const note = noteRepo.create({ title: 'Important Note', notebook_id: nb.id });

    expect(note.notebook_id).toBe(nb.id);

    nbRepo.delete({ id: nb.id, strategy: 'keep_notes_unassigned' });

    const refetchedNote = noteRepo.getById(note.id);
    expect(refetchedNote).not.toBeNull();
    expect(refetchedNote?.notebook_id).toBeNull();
    expect(refetchedNote?.deleted_at).toBeNull(); // Still active!
  });

  it('should safely delete notebook with strategy move_notes_to_trash', () => {
    const nb = nbRepo.create({ name: 'Trashable Notebook' });
    const note = noteRepo.create({ title: 'Note Inside', notebook_id: nb.id });

    nbRepo.delete({ id: nb.id, strategy: 'move_notes_to_trash' });

    const trashedNote = noteRepo.getById(note.id);
    expect(trashedNote?.deleted_at).not.toBeNull();
  });
});
