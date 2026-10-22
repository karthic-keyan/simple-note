import { Note } from './note';
import { Notebook } from './notebook';
import { Tag } from './tag';
import { UserSettings } from './settings';

export interface NoteTagRelation {
  note_id: string;
  tag_id: string;
}

export interface BackupData {
  version: string;
  exported_at: string;
  app: string;
  notes: Note[];
  notebooks: Notebook[];
  tags: Tag[];
  note_tags: NoteTagRelation[];
  settings: UserSettings;
}

export interface BackupExportResult {
  success: boolean;
  filePath?: string;
  cancelled?: boolean;
  error?: string;
}

export interface BackupImportOptions {
  mode: 'merge' | 'replace';
}

export interface BackupImportResult {
  success: boolean;
  notesImported?: number;
  notebooksImported?: number;
  tagsImported?: number;
  cancelled?: boolean;
  error?: string;
}
