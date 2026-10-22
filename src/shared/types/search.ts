import { Note } from './note';

export interface SearchQueryParams {
  query: string;
  notebook_id?: string | null;
  tag_id?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  include_trash?: boolean;
  limit?: number;
}

export interface SearchResultItem {
  note: Note;
  snippet?: string;
  matchScore?: number;
}
