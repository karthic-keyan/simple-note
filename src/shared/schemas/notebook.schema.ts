import { z } from 'zod';

export const CreateNotebookSchema = z.object({
  name: z.string().min(1).max(200),
  parent_id: z.string().uuid().nullable().optional().default(null),
  display_order: z.number().int().optional().default(0),
});

export const UpdateNotebookSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  display_order: z.number().int().optional(),
});

export const DeleteNotebookSchema = z.object({
  id: z.string().uuid(),
  strategy: z.enum(['move_notes_to_trash', 'move_notes_to_parent', 'keep_notes_unassigned']),
});

export const ReorderNotebooksSchema = z.array(z.string().uuid());
