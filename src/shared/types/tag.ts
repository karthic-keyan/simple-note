export interface Tag {
  id: string;
  name: string;
  color: string;
  note_count?: number;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface UpdateTagInput {
  id: string;
  name?: string;
  color?: string;
}
