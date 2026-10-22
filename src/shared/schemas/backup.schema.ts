import { z } from 'zod';

export const BackupDataSchema = z.object({
  version: z.string(),
  exported_at: z.string(),
  app: z.string(),
  notes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content_json: z.string(),
      content_text: z.string(),
      notebook_id: z.string().nullable(),
      is_pinned: z.number(),
      is_favorite: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
      deleted_at: z.string().nullable(),
    })
  ),
  notebooks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      parent_id: z.string().nullable(),
      display_order: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
    })
  ),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
    })
  ),
  note_tags: z.array(
    z.object({
      note_id: z.string(),
      tag_id: z.string(),
    })
  ),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    editor_font_size: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    sidebar_width: z.number().optional(),
    notes_list_width: z.number().optional(),
    sort_field: z.enum(['updated_at', 'created_at', 'title']).optional(),
    sort_order: z.enum(['asc', 'desc']).optional(),
    auto_save_interval: z.number().optional(),
  }).optional(),
});
