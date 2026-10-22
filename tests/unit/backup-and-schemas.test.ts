import { describe, it, expect } from 'vitest';
import { CreateNoteSchema } from '../../src/shared/schemas/note.schema';
import { CreateTagSchema } from '../../src/shared/schemas/tag.schema';
import { BackupDataSchema } from '../../src/shared/schemas/backup.schema';

describe('Validation Schemas & Backup Formats', () => {
  it('should validate and sanitize note creation input', () => {
    const valid = CreateNoteSchema.parse({
      title: 'Valid Title',
    });
    expect(valid.title).toBe('Valid Title');
    expect(valid.notebook_id).toBeNull();
  });

  it('should validate tag hex colors', () => {
    const validTag = CreateTagSchema.parse({
      name: 'finance',
      color: '#10b981',
    });
    expect(validTag.color).toBe('#10b981');

    expect(() => {
      CreateTagSchema.parse({
        name: 'invalid',
        color: 'not-a-color',
      });
    }).toThrow();
  });

  it('should validate backup data payload', () => {
    const backupPayload = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      app: 'Simple Note',
      notes: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Sample Note',
          content_json: '{}',
          content_text: 'Sample',
          notebook_id: null,
          is_pinned: 0,
          is_favorite: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        },
      ],
      notebooks: [],
      tags: [],
      note_tags: [],
    };

    const parsed = BackupDataSchema.parse(backupPayload);
    expect(parsed.app).toBe('Simple Note');
    expect(parsed.notes.length).toBe(1);
  });
});
