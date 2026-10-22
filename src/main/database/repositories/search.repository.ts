import Database from 'better-sqlite3';
import { SearchQueryParams, SearchResultItem } from '../../../shared/types/search';

export class SearchRepository {
  constructor(private db: Database.Database) {}

  search(params: SearchQueryParams): SearchResultItem[] {
    const rawQuery = params.query.trim();
    if (!rawQuery) {
      return [];
    }

    // Sanitize and prepare FTS5 query with prefix matching
    const tokens = rawQuery
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) {
      return [];
    }

    // Format tokens for FTS5 prefix match: "token"*
    const ftsQuery = tokens.map((t: string) => `"${t}"*`).join(' AND ');

    let sql = `
      WITH matched_notes AS (
        SELECT 
          id,
          snippet(notes_fts, 2, '<mark class="bg-amber-200 dark:bg-amber-900/60 text-inherit font-semibold rounded px-0.5">', '</mark>', '...', 20) as snippet,
          rank
        FROM notes_fts
        WHERE notes_fts MATCH ?
      )
      SELECT 
        n.*,
        m.snippet,
        m.rank,
        (SELECT GROUP_CONCAT(tag_id) FROM note_tags nt WHERE nt.note_id = n.id) as tag_ids
      FROM matched_notes m
      JOIN notes n ON m.id = n.id
    `;

    const whereClauses: string[] = [];
    const queryParams: (string | number)[] = [ftsQuery];

    // Filter trash
    if (params.include_trash) {
      whereClauses.push('n.deleted_at IS NOT NULL');
    } else {
      whereClauses.push('n.deleted_at IS NULL');
    }

    // Notebook filter
    if (params.notebook_id !== undefined) {
      if (params.notebook_id === null) {
        whereClauses.push('n.notebook_id IS NULL');
      } else {
        whereClauses.push('n.notebook_id = ?');
        queryParams.push(params.notebook_id);
      }
    }

    // Tag filter
    if (params.tag_id) {
      whereClauses.push(`
        n.id IN (
          SELECT note_id FROM note_tags WHERE tag_id = ?
        )
      `);
      queryParams.push(params.tag_id);
    }

    // Favorites
    if (params.is_favorite !== undefined) {
      whereClauses.push('n.is_favorite = ?');
      queryParams.push(params.is_favorite ? 1 : 0);
    }

    // Pinned
    if (params.is_pinned !== undefined) {
      whereClauses.push('n.is_pinned = ?');
      queryParams.push(params.is_pinned ? 1 : 0);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    sql += ' ORDER BY m.rank ASC, n.is_pinned DESC, n.updated_at DESC';

    const limit = params.limit || 50;
    sql += ` LIMIT ${limit}`;

    try {
      const rows = this.db.prepare(sql).all(...queryParams) as any[];
      return rows.map(r => ({
        note: {
          id: r.id,
          title: r.title,
          content_json: r.content_json,
          content_text: r.content_text,
          notebook_id: r.notebook_id,
          is_pinned: r.is_pinned,
          is_favorite: r.is_favorite,
          created_at: r.created_at,
          updated_at: r.updated_at,
          deleted_at: r.deleted_at,
          tags: r.tag_ids ? r.tag_ids.split(',').filter(Boolean) : [],
        },
        snippet: r.snippet || '',
        matchScore: r.rank,
      }));
    } catch (err) {
      console.warn('FTS5 search error, falling back to LIKE query:', err);
      return this.fallbackLikeSearch(tokens, params);
    }
  }

  private fallbackLikeSearch(tokens: string[], params: SearchQueryParams): SearchResultItem[] {
    let sql = `
      SELECT n.*, GROUP_CONCAT(nt.tag_id) as tag_ids
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      WHERE (n.deleted_at ${params.include_trash ? 'IS NOT NULL' : 'IS NULL'})
    `;
    const queryParams: (string | number)[] = [];

    for (const token of tokens) {
      sql += ' AND (n.title LIKE ? OR n.content_text LIKE ?)';
      queryParams.push(`%${token}%`, `%${token}%`);
    }

    if (params.notebook_id !== undefined) {
      if (params.notebook_id === null) {
        sql += ' AND n.notebook_id IS NULL';
      } else {
        sql += ' AND n.notebook_id = ?';
        queryParams.push(params.notebook_id);
      }
    }

    if (params.tag_id) {
      sql += ' AND n.id IN (SELECT note_id FROM note_tags WHERE tag_id = ?)';
      queryParams.push(params.tag_id);
    }

    sql += ' GROUP BY n.id ORDER BY n.is_pinned DESC, n.updated_at DESC LIMIT 50';

    const rows = this.db.prepare(sql).all(...queryParams) as any[];
    return rows.map(r => ({
      note: {
        id: r.id,
        title: r.title,
        content_json: r.content_json,
        content_text: r.content_text,
        notebook_id: r.notebook_id,
        is_pinned: r.is_pinned,
        is_favorite: r.is_favorite,
        created_at: r.created_at,
        updated_at: r.updated_at,
        deleted_at: r.deleted_at,
        tags: r.tag_ids ? r.tag_ids.split(',').filter(Boolean) : [],
      },
      snippet: '',
      matchScore: 0,
    }));
  }
}
