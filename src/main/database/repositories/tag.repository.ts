import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { Tag, CreateTagInput, UpdateTagInput } from '../../../shared/types/tag';

export class TagRepository {
  private stmtGetById: Database.Statement;
  private stmtInsert: Database.Statement;

  constructor(private db: Database.Database) {
    this.stmtGetById = this.db.prepare('SELECT * FROM tags WHERE id = ?');
    this.stmtInsert = this.db.prepare('INSERT INTO tags (id, name, color) VALUES (?, ?, ?)');
  }

  getAll(): Tag[] {
    const query = `
      SELECT 
        t.*,
        (
          SELECT COUNT(*)
          FROM note_tags nt
          JOIN notes n ON nt.note_id = n.id
          WHERE nt.tag_id = t.id AND n.deleted_at IS NULL
        ) AS note_count
      FROM tags t
      ORDER BY t.name COLLATE NOCASE ASC
    `;

    const rows = this.db.prepare(query).all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      color: r.color,
      note_count: r.note_count || 0,
    }));
  }

  getById(id: string): Tag | null {
    const row = this.stmtGetById.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      color: row.color,
    };
  }

  create(input: CreateTagInput): Tag {
    const id = randomUUID();
    const name = input.name.trim();
    const color = input.color || '#3b82f6';

    this.stmtInsert.run(id, name, color);
    return this.getById(id)!;
  }

  update(input: UpdateTagInput): Tag {
    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name.trim());
    }
    if (input.color !== undefined) {
      updates.push('color = ?');
      params.push(input.color);
    }

    if (updates.length > 0) {
      params.push(input.id);
      this.db.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    return this.getById(input.id)!;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  }
}
