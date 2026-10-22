import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { Notebook, CreateNotebookInput, UpdateNotebookInput, DeleteNotebookOptions } from '../../../shared/types/notebook';

export class NotebookRepository {
  private stmtGetAll: Database.Statement;
  private stmtGetById: Database.Statement;

  constructor(private db: Database.Database) {
    this.stmtGetAll = this.db.prepare(`
      SELECT 
        nb.*,
        COUNT(CASE WHEN n.deleted_at IS NULL THEN n.id END) AS note_count
      FROM notebooks nb
      LEFT JOIN notes n ON nb.id = n.notebook_id
      GROUP BY nb.id
      ORDER BY nb.display_order ASC, nb.name COLLATE NOCASE ASC
    `);

    this.stmtGetById = this.db.prepare(`
      SELECT 
        nb.*,
        COUNT(CASE WHEN n.deleted_at IS NULL THEN n.id END) AS note_count
      FROM notebooks nb
      LEFT JOIN notes n ON nb.id = n.notebook_id
      WHERE nb.id = ?
      GROUP BY nb.id
    `);
  }

  getAll(): Notebook[] {
    const rows = this.stmtGetAll.all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      parent_id: r.parent_id,
      display_order: r.display_order,
      created_at: r.created_at,
      updated_at: r.updated_at,
      note_count: r.note_count || 0,
    }));
  }

  getById(id: string): Notebook | null {
    const row = this.stmtGetById.get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      parent_id: row.parent_id,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
      note_count: row.note_count || 0,
    };
  }

  create(input: CreateNotebookInput): Notebook {
    const id = randomUUID();
    const now = new Date().toISOString();
    const name = input.name.trim();
    const parent_id = input.parent_id || null;

    let display_order = input.display_order;
    if (display_order === undefined) {
      const maxOrder = this.db.prepare('SELECT MAX(display_order) as max_val FROM notebooks').get() as any;
      display_order = (maxOrder?.max_val || 0) + 1;
    }

    this.db.prepare(`
      INSERT INTO notebooks (id, name, parent_id, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, name, parent_id, display_order, now, now);

    return this.getById(id)!;
  }

  update(input: UpdateNotebookInput): Notebook {
    const existing = this.getById(input.id);
    if (!existing) throw new Error(`Notebook ${input.id} not found`);

    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const params: (string | number | null)[] = [now];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name.trim());
    }
    if (input.parent_id !== undefined) {
      // Prevent circular parenting
      if (input.parent_id === input.id) {
        throw new Error('Notebook cannot be parent of itself');
      }
      updates.push('parent_id = ?');
      params.push(input.parent_id);
    }
    if (input.display_order !== undefined) {
      updates.push('display_order = ?');
      params.push(input.display_order);
    }

    params.push(input.id);

    this.db.prepare(`
      UPDATE notebooks
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params);

    return this.getById(input.id)!;
  }

  delete(options: DeleteNotebookOptions): void {
    const { id, strategy } = options;
    const target = this.getById(id);
    if (!target) return;

    const deleteTx = this.db.transaction(() => {
      if (strategy === 'move_notes_to_trash') {
        const now = new Date().toISOString();
        this.db.prepare('UPDATE notes SET deleted_at = ?, is_pinned = 0 WHERE notebook_id = ?').run(now, id);
      } else if (strategy === 'move_notes_to_parent') {
        this.db.prepare('UPDATE notes SET notebook_id = ? WHERE notebook_id = ?').run(target.parent_id, id);
      } else {
        // keep_notes_unassigned
        this.db.prepare('UPDATE notes SET notebook_id = NULL WHERE notebook_id = ?').run(id);
      }

      // Reparent any child notebooks to avoid foreign key cascades
      this.db.prepare('UPDATE notebooks SET parent_id = ? WHERE parent_id = ?').run(target.parent_id, id);

      // Now delete the notebook itself
      this.db.prepare('DELETE FROM notebooks WHERE id = ?').run(id);
    });

    deleteTx();
  }

  reorder(notebookIds: string[]): void {
    const reorderTx = this.db.transaction(() => {
      const stmt = this.db.prepare('UPDATE notebooks SET display_order = ? WHERE id = ?');
      notebookIds.forEach((id, index) => {
        stmt.run(index, id);
      });
    });
    reorderTx();
  }
}
