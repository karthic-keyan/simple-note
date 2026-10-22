import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export function createDatabase(filePath: string, options?: Database.Options): Database.Database {
  const isElectron = Boolean(process.versions.electron);

  let nativeBinding: string | undefined;

  if (!isElectron) {
    // When running under pure Node (e.g. Vitest), load the Node ABI 127 binary
    const nodeBinary = path.resolve(process.cwd(), 'native-addons/better_sqlite3_node.node');
    if (fs.existsSync(nodeBinary)) {
      nativeBinding = nodeBinary;
    }
  } else {
    // When running under Electron:
    // Search for the Electron ABI 132 binary
    let appDir = process.cwd();
    try {
      if (app && app.getAppPath) {
        appDir = app.getAppPath();
      }
    } catch {
      appDir = process.cwd();
    }

    const unpackedPath = (process as any).resourcesPath
      ? path.join((process as any).resourcesPath, 'app.asar.unpacked', 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node')
      : '';

    const candidatePaths = [
      path.resolve(process.cwd(), 'native-addons/better_sqlite3_electron.node'),
      path.resolve(appDir, 'native-addons/better_sqlite3_electron.node'),
      unpackedPath,
      path.resolve(appDir.replace('app.asar', 'app.asar.unpacked'), 'node_modules/better-sqlite3/build/Release/better_sqlite3.node'),
      path.resolve(process.cwd(), 'node_modules/better-sqlite3/build/Release/better_sqlite3.node'),
    ].filter(Boolean);

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        nativeBinding = candidate;
        break;
      }
    }
  }

  return new Database(filePath, {
    ...options,
    ...(nativeBinding ? { nativeBinding } : {}),
  });
}
