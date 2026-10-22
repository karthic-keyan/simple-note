export interface Note {
  id: string;
  title: string;
  content_json: string; // Serialized ProseMirror/Tiptap JSON
  content_text: string; // Plain text extracted for search and preview
  notebook_id: string | null;
  is_pinned: number; // 0 or 1
  is_favorite: number; // 0 or 1
  created_at: string; // ISO 8601 UTC string
  updated_at: string; // ISO 8601 UTC string
  deleted_at: string | null; // ISO 8601 UTC string if in trash
  tags?: string[]; // Tag IDs
}

export type NoteSortField = 'updated_at' | 'created_at' | 'title';
export type NoteSortOrder = 'asc' | 'desc';

export interface NoteSortOptions {
  field: NoteSortField;
  order: NoteSortOrder;
}

export interface NoteFilterOptions {
  notebook_id?: string | null;
  tag_id?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_trash?: boolean;
  search_query?: string;
}

export interface CreateNoteInput {
  title?: string;
  content_json?: string;
  content_text?: string;
  notebook_id?: string | null;
  tag_ids?: string[];
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content_json?: string;
  content_text?: string;
  notebook_id?: string | null;
  is_pinned?: number;
  is_favorite?: number;
  tag_ids?: string[];
}
