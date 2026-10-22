import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDatabase } from '../../src/main/database/sqlite';
import { runMigrations } from '../../src/main/database/migrations';
import { NoteRepository } from '../../src/main/database/repositories/note.repository';
import { SearchRepository } from '../../src/main/database/repositories/search.repository';
import { TagRepository } from '../../src/main/database/repositories/tag.repository';

describe('NoteRepository & SearchRepository', () => {
  let db: Database.Database;
  let noteRepo: NoteRepository;
  let searchRepo: SearchRepository;
  let tagRepo: TagRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
    noteRepo = new NoteRepository(db);
    searchRepo = new SearchRepository(db);
    tagRepo = new TagRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should create a note with default values and retrieve it', () => {
    const note = noteRepo.create({
      title: 'First Simple Note Test',
      content_json: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello World"}]}]}',
      content_text: 'Hello World',
    });

    expect(note.id).toBeDefined();
    expect(note.title).toBe('First Simple Note Test');
    expect(note.content_text).toBe('Hello World');
    expect(note.is_pinned).toBe(0);
    expect(note.is_favorite).toBe(0);
    expect(note.deleted_at).toBeNull();

    const fetched = noteRepo.getById(note.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('First Simple Note Test');
  });

  it('should update note title and content and track updated_at', () => {
    const note = noteRepo.create({ title: 'Initial' });

    const updated = noteRepo.update({
      id: note.id,
      title: 'Renamed Title',
      content_text: 'Updated body text',
    });

    expect(updated.title).toBe('Renamed Title');
    expect(updated.content_text).toBe('Updated body text');
  });

  it('should handle trash and restore workflow correctly', () => {
    const note = noteRepo.create({ title: 'Note to Trash' });

    // Move to trash
    noteRepo.trash(note.id);
    const activeNotes = noteRepo.getAll({ is_trash: false });
    expect(activeNotes.find(n => n.id === note.id)).toBeUndefined();

    const trashedNotes = noteRepo.getAll({ is_trash: true });
    expect(trashedNotes.find(n => n.id === note.id)).toBeDefined();

    // Restore
    noteRepo.restore(note.id);
    const restoredNotes = noteRepo.getAll({ is_trash: false });
    expect(restoredNotes.find(n => n.id === note.id)).toBeDefined();
  });

  it('should toggle pin and favorite states', () => {
    const note = noteRepo.create({ title: 'Pin Test' });
    expect(note.is_pinned).toBe(0);

    const pinned = noteRepo.togglePin(note.id);
    expect(pinned.is_pinned).toBe(1);

    const unpinned = noteRepo.togglePin(note.id);
    expect(unpinned.is_pinned).toBe(0);

    const fav = noteRepo.toggleFavorite(note.id);
    expect(fav.is_favorite).toBe(1);
  });

  it('should perform full-text search with FTS5 BM25 matching', () => {
    noteRepo.create({
      title: 'Shopping List',
      content_text: 'Buy apples, bananas, and organic sourdough bread from the bakery',
    });

    noteRepo.create({
      title: 'Project Architecture',
      content_text: 'The architecture uses Electron, React, and SQLite with FTS5 search indexing',
    });

    // Search query for "sourdough"
    const results1 = searchRepo.search({ query: 'sourdough' });
    expect(results1.length).toBe(1);
    expect(results1[0].note.title).toBe('Shopping List');
    expect(results1[0].snippet).toContain('sourdough');

    // Search query for "Electron FTS5"
    const results2 = searchRepo.search({ query: 'Electron FTS5' });
    expect(results2.length).toBe(1);
    expect(results2[0].note.title).toBe('Project Architecture');

    // Search query for non-existent text
    const results3 = searchRepo.search({ query: 'NonExistentGibberish12345' });
    expect(results3.length).toBe(0);
  });

  it('should associate tags with notes and filter by tag', () => {
    const tag = tagRepo.create({ name: 'productivity', color: '#10b981' });
    const note1 = noteRepo.create({ title: 'Task 1', tag_ids: [tag.id] });
    noteRepo.create({ title: 'Task 2' });

    const taggedNotes = noteRepo.getAll({ tag_id: tag.id });
    expect(taggedNotes.length).toBe(1);
    expect(taggedNotes[0].id).toBe(note1.id);
  });

  it('should accurately calculate tag note_count without duplicate counting and exclude trashed notes', () => {
    const tagIdeas = tagRepo.create({ name: 'ideas', color: '#3b82f6' });
    const tagUrgent = tagRepo.create({ name: 'urgent', color: '#ef4444' });

    // Note 1 has tagIdeas
    const n1 = noteRepo.create({ title: 'Idea 1', tag_ids: [tagIdeas.id] });
    // Note 2 has tagIdeas and tagUrgent
    const n2 = noteRepo.create({ title: 'Idea 2 & Urgent', tag_ids: [tagIdeas.id, tagUrgent.id] });
    // Note 3 has no tags
    noteRepo.create({ title: 'No tags' });

    let allTags = tagRepo.getAll();
    let ideasTag = allTags.find(t => t.id === tagIdeas.id);
    let urgentTag = allTags.find(t => t.id === tagUrgent.id);

    expect(ideasTag?.note_count).toBe(2);
    expect(urgentTag?.note_count).toBe(1);

    // Trashing n1 should reduce ideasTag note_count to 1
    noteRepo.trash(n1.id);
    allTags = tagRepo.getAll();
    ideasTag = allTags.find(t => t.id === tagIdeas.id);
    expect(ideasTag?.note_count).toBe(1);

    // Restoring n1 should restore ideasTag note_count to 2
    noteRepo.restore(n1.id);
    allTags = tagRepo.getAll();
    ideasTag = allTags.find(t => t.id === tagIdeas.id);
    expect(ideasTag?.note_count).toBe(2);

    // Removing tag from n2 should reduce urgentTag note_count to 0
    noteRepo.removeTag(n2.id, tagUrgent.id);
    allTags = tagRepo.getAll();
    urgentTag = allTags.find(t => t.id === tagUrgent.id);
    expect(urgentTag?.note_count).toBe(0);
  });
});
