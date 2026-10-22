import { z } from 'zod';

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional().default('#3b82f6'),
});

export const UpdateTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
});
