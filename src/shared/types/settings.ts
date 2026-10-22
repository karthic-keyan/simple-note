export type AppTheme = 'light' | 'dark' | 'system';
export type EditorFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface UserSettings {
  theme: AppTheme;
  editor_font_size: EditorFontSize;
  sidebar_width: number;
  notes_list_width: number;
  sort_field: 'updated_at' | 'created_at' | 'title';
  sort_order: 'asc' | 'desc';
  auto_save_interval: number; // in milliseconds (default: 500)
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  editor_font_size: 'medium',
  sidebar_width: 240,
  notes_list_width: 320,
  sort_field: 'updated_at',
  sort_order: 'desc',
  auto_save_interval: 500,
};
