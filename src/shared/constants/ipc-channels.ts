export const IPC_CHANNELS = {
  // Notes
  NOTES_GET_ALL: 'notes:get-all',
  NOTES_GET_BY_ID: 'notes:get-by-id',
  NOTES_CREATE: 'notes:create',
  NOTES_UPDATE: 'notes:update',
  NOTES_TRASH: 'notes:trash',
  NOTES_RESTORE: 'notes:restore',
  NOTES_DELETE_PERMANENT: 'notes:delete-permanent',
  NOTES_EMPTY_TRASH: 'notes:empty-trash',
  NOTES_TOGGLE_PIN: 'notes:toggle-pin',
  NOTES_TOGGLE_FAVORITE: 'notes:toggle-favorite',
  NOTES_MOVE_TO_NOTEBOOK: 'notes:move-to-notebook',
  NOTES_ASSIGN_TAG: 'notes:assign-tag',
  NOTES_REMOVE_TAG: 'notes:remove-tag',

  // Notebooks
  NOTEBOOKS_GET_ALL: 'notebooks:get-all',
  NOTEBOOKS_CREATE: 'notebooks:create',
  NOTEBOOKS_UPDATE: 'notebooks:update',
  NOTEBOOKS_DELETE: 'notebooks:delete',
  NOTEBOOKS_REORDER: 'notebooks:reorder',

  // Tags
  TAGS_GET_ALL: 'tags:get-all',
  TAGS_CREATE: 'tags:create',
  TAGS_UPDATE: 'tags:update',
  TAGS_DELETE: 'tags:delete',

  // Search
  SEARCH_QUERY: 'search:query',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',

  // Backup & Restore
  BACKUP_EXPORT: 'backup:export',
  BACKUP_IMPORT: 'backup:import',

  // Window Controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
} as const;
