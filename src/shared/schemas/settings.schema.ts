import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  editor_font_size: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  sidebar_width: z.number().min(150).max(500).optional(),
  notes_list_width: z.number().min(200).max(600).optional(),
  sort_field: z.enum(['updated_at', 'created_at', 'title']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  auto_save_interval: z.number().min(200).max(5000).optional(),
});
