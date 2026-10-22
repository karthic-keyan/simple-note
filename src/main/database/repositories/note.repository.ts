import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { Note, CreateNoteInput, UpdateNoteInput, NoteFilterOptions, NoteSortOptions } from '../../../shared/types/note';

export class NoteRepository {
  private stmtGetById: Database.Statement;
  private stmtInsertNote: Database.Statement;
  private stmtInsertTag: Database.Statement;
  private stmtDeleteTags: Database.Statement;
  private stmtTrash: Database.Statement;
  private stmtRestore: Database.Statement;
  private stmtDeletePermanent: Database.Statement;
  private stmtEmptyTrash: Database.Statement;
  private stmtTogglePin: Database.Statement;
  private stmtToggleFavorite: Database.Statement;
  private stmtMoveToNotebook: Database.Statement;
  private stmtAssignTag: Database.Statement;
  private stmtRemoveTag: Database.Statement;
  private stmtTouchUpdated: Database.Statement;

  constructor(private db: Database.Database) {
    this.stmtGetById = this.db.prepare(`
      SELECT n.*, (SELECT GROUP_CONCAT(tag_id) FROM note_tags nt WHERE nt.note_id = n.id) as tag_ids
      FROM notes n
      WHERE n.id = ?
    `);

    this.stmtInsertNote = this.db.prepare(`
      INSERT INTO notes (
        id, title, content_json, content_text, notebook_id,
        is_pinned, is_favorite, created_at, updated_at, deleted_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, NULL)
    `);

    this.stmtInsertTag = this.db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
    this.stmtDeleteTags = this.db.prepare('DELETE FROM note_tags WHERE note_id = ?');
    this.stmtTrash = this.db.prepare('UPDATE notes SET deleted_at = ?, is_pinned = 0 WHERE id = ?');
    this.stmtRestore = this.db.prepare('UPDATE notes SET deleted_at = NULL WHERE id = ?');
    this.stmtDeletePermanent = this.db.prepare('DELETE FROM notes WHERE id = ?');
    this.stmtEmptyTrash = this.db.prepare('DELETE FROM notes WHERE deleted_at IS NOT NULL');
    this.stmtTogglePin = this.db.prepare('UPDATE notes SET is_pinned = (1 - is_pinned), updated_at = ? WHERE id = ?');
    this.stmtToggleFavorite = this.db.prepare('UPDATE notes SET is_favorite = (1 - is_favorite), updated_at = ? WHERE id = ?');
    this.stmtMoveToNotebook = this.db.prepare('UPDATE notes SET notebook_id = ?, updated_at = ? WHERE id = ?');
    this.stmtAssignTag = this.db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)');
    this.stmtRemoveTag = this.db.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?');
    this.stmtTouchUpdated = this.db.prepare('UPDATE notes SET updated_at = ? WHERE id = ?');
  }

  getAll(filter?: NoteFilterOptions, sort?: NoteSortOptions): Note[] {
    let query = `
      SELECT n.*, (SELECT GROUP_CONCAT(tag_id) FROM note_tags nt WHERE nt.note_id = n.id) as tag_ids
      FROM notes n
    `;

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    // Trash handling
    if (filter?.is_trash) {
      whereClauses.push('n.deleted_at IS NOT NULL');
    } else {
      whereClauses.push('n.deleted_at IS NULL');
    }

    // Notebook filter
    if (filter?.notebook_id !== undefined) {
      if (filter.notebook_id === null) {
        whereClauses.push('n.notebook_id IS NULL');
      } else {
        whereClauses.push('n.notebook_id = ?');
        params.push(filter.notebook_id);
      }
    }

    // Favorite filter
    if (filter?.is_favorite !== undefined) {
      whereClauses.push('n.is_favorite = ?');
      params.push(filter.is_favorite ? 1 : 0);
    }

    // Pinned filter
    if (filter?.is_pinned !== undefined) {
      whereClauses.push('n.is_pinned = ?');
      params.push(filter.is_pinned ? 1 : 0);
    }

    // Tag filter
    if (filter?.tag_id) {
      whereClauses.push(`
        n.id IN (
          SELECT note_id FROM note_tags WHERE tag_id = ?
        )
      `);
      params.push(filter.tag_id);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Sorting: pinned notes always on top for normal list views
    const sortField = sort?.field === 'title' ? 'n.title COLLATE NOCASE' : (sort?.field === 'created_at' ? 'n.created_at' : 'n.updated_at');
    const sortOrder = sort?.order === 'asc' ? 'ASC' : 'DESC';

    if (filter?.is_trash) {
      query += ` ORDER BY n.deleted_at DESC`;
    } else {
      query += ` ORDER BY n.is_pinned DESC, ${sortField} ${sortOrder}`;
    }

    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map(row => this.mapRowToNote(row));
  }

  getById(id: string): Note | null {
    const row = this.stmtGetById.get(id) as any;
    if (!row) return null;
    return this.mapRowToNote(row);
  }

  create(input: CreateNoteInput): Note {
    const id = randomUUID();
    const now = new Date().toISOString();
    const title = input.title !== undefined && input.title.trim() !== '' ? input.title.trim() : 'Untitled Note';
    const content_json = input.content_json || '{"type":"doc","content":[{"type":"paragraph"}]}';
    const content_text = input.content_text || '';
    const notebook_id = input.notebook_id || null;

    const createTx = this.db.transaction(() => {
      this.stmtInsertNote.run(id, title, content_json, content_text, notebook_id, now, now);

      if (input.tag_ids && input.tag_ids.length > 0) {
        for (const tagId of input.tag_ids) {
          this.stmtInsertTag.run(id, tagId);
        }
      }
    });

    createTx();
    return this.getById(id)!;
  }

  update(input: UpdateNoteInput): Note {
    const existing = this.getById(input.id);
    if (!existing) {
      throw new Error(`Note with id ${input.id} not found`);
    }

    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const params: (string | number | null)[] = [now];

    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title.trim() !== '' ? input.title.trim() : 'Untitled Note');
    }
    if (input.content_json !== undefined) {
      updates.push('content_json = ?');
      params.push(input.content_json);
    }
    if (input.content_text !== undefined) {
      updates.push('content_text = ?');
      params.push(input.content_text);
    }
    if (input.notebook_id !== undefined) {
      updates.push('notebook_id = ?');
      params.push(input.notebook_id);
    }
    if (input.is_pinned !== undefined) {
      updates.push('is_pinned = ?');
      params.push(input.is_pinned);
    }
    if (input.is_favorite !== undefined) {
      updates.push('is_favorite = ?');
      params.push(input.is_favorite);
    }

    params.push(input.id);

    const updateTx = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE notes
        SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...params);

      if (input.tag_ids !== undefined) {
        this.stmtDeleteTags.run(input.id);
        if (input.tag_ids.length > 0) {
          for (const tagId of input.tag_ids) {
            this.stmtInsertTag.run(input.id, tagId);
          }
        }
      }
    });

    updateTx();
    return this.getById(input.id)!;
  }

  trash(id: string): void {
    const now = new Date().toISOString();
    this.stmtTrash.run(now, id);
  }

  restore(id: string): void {
    this.stmtRestore.run(id);
  }

  deletePermanent(id: string): void {
    this.stmtDeletePermanent.run(id);
  }

  emptyTrash(): void {
    this.stmtEmptyTrash.run();
  }

  togglePin(id: string): Note {
    const res = this.stmtTogglePin.run(new Date().toISOString(), id);
    if (res.changes === 0) throw new Error(`Note ${id} not found`);
    return this.getById(id)!;
  }

  toggleFavorite(id: string): Note {
    const res = this.stmtToggleFavorite.run(new Date().toISOString(), id);
    if (res.changes === 0) throw new Error(`Note ${id} not found`);
    return this.getById(id)!;
  }

  moveToNotebook(noteId: string, notebookId: string | null): Note {
    this.stmtMoveToNotebook.run(notebookId, new Date().toISOString(), noteId);
    return this.getById(noteId)!;
  }

  assignTag(noteId: string, tagId: string): void {
    this.stmtAssignTag.run(noteId, tagId);
    this.stmtTouchUpdated.run(new Date().toISOString(), noteId);
  }

  removeTag(noteId: string, tagId: string): void {
    this.stmtRemoveTag.run(noteId, tagId);
    this.stmtTouchUpdated.run(new Date().toISOString(), noteId);
  }

  private mapRowToNote(row: any): Note {
    return {
      id: row.id,
      title: row.title,
      content_json: row.content_json,
      content_text: row.content_text,
      notebook_id: row.notebook_id,
      is_pinned: row.is_pinned,
      is_favorite: row.is_favorite,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
      tags: row.tag_ids ? row.tag_ids.split(',').filter(Boolean) : [],
    };
  }
}
