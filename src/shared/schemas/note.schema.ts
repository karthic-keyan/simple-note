import { z } from 'zod';

export const CreateNoteSchema = z.object({
  title: z.string().max(500).optional().default('Untitled Note'),
  content_json: z.string().optional().default('{"type":"doc","content":[{"type":"paragraph"}]}'),
  content_text: z.string().optional().default(''),
  notebook_id: z.string().uuid().nullable().optional().default(null),
  tag_ids: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(500).optional(),
  content_json: z.string().optional(),
  content_text: z.string().optional(),
  notebook_id: z.string().uuid().nullable().optional(),
  is_pinned: z.number().int().min(0).max(1).optional(),
  is_favorite: z.number().int().min(0).max(1).optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export const NoteSortOptionsSchema = z.object({
  field: z.enum(['updated_at', 'created_at', 'title']),
  order: z.enum(['asc', 'desc']),
}).optional();

export const NoteFilterOptionsSchema = z.object({
  notebook_id: z.string().uuid().nullable().optional(),
  tag_id: z.string().uuid().optional(),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  is_trash: z.boolean().optional(),
  search_query: z.string().optional(),
}).optional();
