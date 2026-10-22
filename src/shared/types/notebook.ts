export interface Notebook {
  id: string;
  name: string;
  parent_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  note_count?: number;
  children?: Notebook[];
}

export interface CreateNotebookInput {
  name: string;
  parent_id?: string | null;
  display_order?: number;
}

export interface UpdateNotebookInput {
  id: string;
  name?: string;
  parent_id?: string | null;
  display_order?: number;
}

export interface DeleteNotebookOptions {
  id: string;
  strategy: 'move_notes_to_trash' | 'move_notes_to_parent' | 'keep_notes_unassigned';
}
