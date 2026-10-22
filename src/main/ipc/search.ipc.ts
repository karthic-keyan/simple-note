import { BrowserWindow } from 'electron';
import Database from 'better-sqlite3';
import { IPC_CHANNELS } from '../../shared/constants/ipc-channels';
import { SearchRepository } from '../database/repositories/search.repository';
import { registerSecureHandler } from './security';
import { SearchQueryParams } from '../../shared/types/search';
import { z } from 'zod';

const SearchQueryParamsSchema = z.object({
  query: z.string(),
  notebook_id: z.string().uuid().nullable().optional(),
  tag_id: z.string().uuid().optional(),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  include_trash: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export function registerSearchIpc(db: Database.Database, getMainWindow: () => BrowserWindow | null): void {
  const repo = new SearchRepository(db);

  registerSecureHandler(IPC_CHANNELS.SEARCH_QUERY, getMainWindow, async (_event, params: SearchQueryParams) => {
    const validParams = SearchQueryParamsSchema.parse(params);
    return repo.search(validParams);
  });
}
